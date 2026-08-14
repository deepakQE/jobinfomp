"""
Jobinfo MP - Automated Gov Job Scraper & Telegram Bot
------------------------------------------------------
Requirements (see requirements.txt):
    pip install requests beautifulsoup4 supabase python-dotenv google-genai pypdf

Key fixes vs. the previous version:
  1. Migrated off the deprecated `google.generativeai` SDK / `gemini-1.5-flash`
     (both are retired) to the current `google-genai` SDK on `gemini-2.5-flash`.
     This was silently failing before, which is why every post used the
     generic fallback summary with "N/A" everywhere.
  2. Gemini now actually reads the PDF content (not just the title), so it
     can extract real vacancy counts, deadlines, qualifications, age limits,
     fees, and important dates.
  3. PDF link detection uses a regex (handles query strings) + urljoin
     (handles relative/protocol-relative hrefs correctly) instead of a
     brittle `.endswith('.pdf')` check.
  4. Title extraction falls back to the parent row/list-item text when the
     anchor text itself is generic ("Click Here", "Download", the raw
     filename, etc.) - this is what was causing raw links to show up
     where a job title should be.
  5. Each site scrape can now find and insert MULTIPLE new postings per
     run instead of stopping after the first match.
  6. The 6 near-identical per-site functions are collapsed into one
     configurable `scrape_site()` driven by SITE_CONFIGS.

Set SCRAPER_DEBUG=true in the environment to print extra diagnostics
(link counts, etc.) when a site's selectors need tuning.
"""

import os
import re
import time
import json
import html
import warnings
from io import BytesIO
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client
import urllib3

warnings.filterwarnings("ignore", category=FutureWarning)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- Gemini (current SDK) -----------------------------------------------
try:
    from google import genai
    from google.genai import types
    GENAI_SDK_AVAILABLE = True
except ImportError:
    GENAI_SDK_AVAILABLE = False

# --- PDF text extraction --------------------------------------------------
try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')  # MUST BE SERVICE ROLE KEY
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3.6-flash')
# If the primary model gets retired/blocked again, these are tried in order
# before giving up and falling back to the placeholder summary.
GEMINI_FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash-lite']
DEBUG = os.getenv('SCRAPER_DEBUG', 'false').lower() == 'true'

print("=== TELEGRAM & AI SCRAPER BOT START ===")
print(f"1. Token Loaded: {bool(TELEGRAM_BOT_TOKEN)}")
print(f"2. Chat ID Loaded: {bool(TELEGRAM_CHAT_ID)}")
print(f"3. Supabase URL: {SUPABASE_URL}")
print(f"4. pypdf available: {PYPDF_AVAILABLE}")
print("====================================\n")

if not all([TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("❌ Missing API keys. Check your .env file or GitHub Secrets.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

REQUEST_HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}


def fetch_with_retry(url, retries=2, backoff=4, **kwargs):
    """Wraps requests.get with a couple of retries + backoff, since gov.in
    sites intermittently fail DNS/connect from cloud CI runners (this will
    not fix a hard firewall block, only transient blips)."""
    last_err = None
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=REQUEST_HEADERS, verify=False, **kwargs)
            resp.raise_for_status()
            return resp
        except requests.exceptions.RequestException as e:
            last_err = e
            if attempt < retries:
                time.sleep(backoff)
    raise last_err

gemini_client = None
if GENAI_SDK_AVAILABLE and GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print(f"✅ Gemini client initialized ({GEMINI_MODEL})")
    except Exception as e:
        print(f"⚠️ Gemini init failed (will use fallback): {e}")
else:
    print("⚠️ Gemini disabled (missing SDK or API key) - using fallback summaries only. "
          "Run: pip install google-genai")


# ---------------------------------------------------------------------------
# Matching / dedup helpers
# ---------------------------------------------------------------------------

def clean_text_for_match(text):
    return re.sub(r'[^a-z0-9\u0900-\u097F]', '', str(text).lower())


# Generic words that appear in almost every MPPSC/MPESB title and carry no
# distinguishing signal - excluded before comparing titles, so dedup
# compares the words that actually identify WHICH job this is.
TITLE_STOPWORDS = {
    'recruitment', 'advertisement', 'advt', 'no', 'notification', 'exam',
    'examination', 'dated', 'the', 'for', 'of', 'and', 'to', 'a', 'an',
    'mppsc', 'mpesb', 'post', 'posts', 'department', 'government', 'madhya',
    'pradesh', 'notice', 'regarding', 'sambandhi', 'suchna',
}


def title_token_set(title):
    """Lowercases, strips punctuation, and drops stopwords/plain numbers-
    with-slashes so two differently-worded titles about the same job (e.g.
    'Recruitment Advertisement for Internal Accounts Examiner Officer Exam
    2026' vs 'MPPSC Internal Accounts Examiner Officer Recruitment 2026')
    still overlap heavily on the words that actually matter."""
    words = re.findall(r'[a-z0-9\u0900-\u097F]+', str(title).lower())
    return {w for w in words if w not in TITLE_STOPWORDS and len(w) > 2}


def titles_are_similar(title_a, title_b, threshold=0.8):
    set_a, set_b = title_token_set(title_a), title_token_set(title_b)
    if not set_a or not set_b:
        return False
    overlap = len(set_a & set_b)
    smaller = min(len(set_a), len(set_b))
    # Ratio against the SMALLER set, not the union - a short precise title
    # ("MPESB Krishi Vistar Adhikari") fully contained in a longer one
    # should still count as a strong match even though the union is large.
    return (overlap / smaller) >= threshold


def check_if_exists(pdf_link, title):
    if pdf_link:
        res = supabase.table('job_posts').select('slug').eq('notification_pdf_link', pdf_link).execute()
        if res.data:
            return True

    clean_title = clean_text_for_match(title[:40])
    res = supabase.table('job_posts').select('title, created_at').order('created_at', desc=True).limit(80).execute()

    for job in res.data:
        if clean_text_for_match(job['title'][:40]) == clean_title:
            return True

    # Fallback: differently-worded titles for the same underlying job
    # (common with manually-seeded rows, or sites that rephrase notices).
    # Checked last since it's the most expensive/approximate of the three.
    for job in res.data:
        if titles_are_similar(title, job['title']):
            print(f"   ℹ️ Skipping likely duplicate (title similarity): \"{title[:60]}\" ~ \"{job['title'][:60]}\"")
            return True

    return False


# ---------------------------------------------------------------------------
# PDF content extraction
# ---------------------------------------------------------------------------

def extract_pdf_excerpt(pdf_link, max_chars=6000, max_pages=3):
    """Download the PDF and pull raw text from the first few pages so
    Gemini has real content to work with instead of just a title."""
    if not pdf_link or not PYPDF_AVAILABLE:
        return ""
    try:
        resp = fetch_with_retry(pdf_link, timeout=25)
        reader = PdfReader(BytesIO(resp.content))
        parts = []
        for page in reader.pages[:max_pages]:
            try:
                parts.append(page.extract_text() or "")
            except Exception:
                continue
        return "\n".join(parts).strip()[:max_chars]
    except Exception as e:
        print(f"   ⚠️ Could not read PDF content ({pdf_link}): {e}")
        return ""


# ---------------------------------------------------------------------------
# Gemini summarization
# ---------------------------------------------------------------------------

def call_gemini(prompt):
    if not gemini_client:
        return None

    models_to_try = [GEMINI_MODEL] + [m for m in GEMINI_FALLBACK_MODELS if m != GEMINI_MODEL]

    for model_name in models_to_try:
        for attempt in range(2):
            try:
                resp = gemini_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    ),
                )
                if model_name != GEMINI_MODEL:
                    print(f"   ℹ️ Used fallback model '{model_name}' (primary '{GEMINI_MODEL}' unavailable)")
                return resp.text
            except Exception as e:
                err_str = str(e)
                print(f"⚠️ Gemini call failed ({model_name}, attempt {attempt + 1}/2): {e}")
                # A retired/unavailable model won't succeed on retry - move to
                # the next model in the list instead of wasting an attempt.
                if '404' in err_str or 'NOT_FOUND' in err_str or 'no longer available' in err_str.lower():
                    break
                time.sleep(2)
    return None


def get_ai_summary(title, category, pdf_link=None):
    fallback = {
        "post_type": "latest-job",
        "summary": f"Official notification released for {category}. Please check the PDF for detailed information.",
        "vacancy": "N/A",
        "deadline": None,
        "qualification": "Check PDF",
        "age_limit": "N/A",
        "application_fee_text": "N/A",
        "eligibility": "Check official PDF notification for detailed eligibility criteria.",
        "important_dates": [],
        "application_fee": [],
        "vacancy_details": [],
    }

    if not gemini_client:
        return fallback

    pdf_excerpt = extract_pdf_excerpt(pdf_link)
    if pdf_excerpt:
        context_block = f"\nPDF CONTENT EXCERPT:\n{pdf_excerpt}"
    else:
        context_block = ("\n(PDF content could not be read - base your answer on the title only, "
                          "and use 'N/A' / null for anything you cannot determine. Do not invent numbers.)")

    prompt = f"""You are an expert Indian government job portal assistant for 'Jobinfo MP'.

Title: {title}
Category: {category}
{context_block}

TASK: Read the PDF content excerpt carefully and extract accurate details. Never guess numbers
that are not actually present in the excerpt.

1. post_type: exactly one of "latest-job", "result", "answer-key", "admit-card", "notice-cancellation".
2. summary: one accurate sentence in English. Never say "apply online" for a cancellation or result.
3. vacancy: total number of vacancies as a string (e.g. "1250"), or "N/A" if not a new job or not mentioned.
4. deadline: last date to apply, strictly formatted "YYYY-MM-DD", or null if not mentioned.
5. qualification: minimum educational qualification required, short phrase, or "Check PDF" if not found.
6. age_limit: age limit as stated (e.g. "18-40 years as on 01-01-2026"), or "N/A" if not applicable.
7. application_fee_text: short fee summary (e.g. "General: Rs 500, SC/ST: Rs 250"), or "N/A" if not mentioned.
8. eligibility: 1-2 sentence eligibility summary.
9. important_dates: JSON array of objects like {{"label": "Start Date", "date": "YYYY-MM-DD"}} for any
   dates mentioned (application start/end, exam date, etc). Empty array if none found.
10. application_fee: JSON array of objects like {{"category": "General / Other State", "amount": "560"}},
    one entry per fee category actually stated (General, SC/ST/OBC, PWD, Female, etc). Empty array if no
    fee breakdown is given. Do not invent categories that aren't in the text.
11. vacancy_details: JSON array of objects like {{"post": "Agriculture Extension Officer", "count": "2784"}},
    one entry per distinct post/role with its vacancy count, if the notification breaks vacancies down by
    post. Empty array if only a single total is given (use `vacancy` for that case instead).

Return ONLY valid JSON matching this schema, with no preamble or markdown fences:
{{
  "post_type": "latest-job",
  "summary": "...",
  "vacancy": "N/A",
  "deadline": null,
  "qualification": "...",
  "age_limit": "...",
  "application_fee_text": "...",
  "eligibility": "...",
  "important_dates": [],
  "application_fee": [],
  "vacancy_details": []
}}"""

    raw = call_gemini(prompt)
    if not raw:
        return fallback

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            print("⚠️ Gemini returned non-JSON output, using fallback")
            return fallback
        try:
            result = json.loads(match.group(0))
        except Exception:
            print("⚠️ Could not parse Gemini JSON, using fallback")
            return fallback

    deadline = result.get("deadline")
    if deadline and not re.match(r'^\d{4}-\d{2}-\d{2}$', str(deadline)):
        deadline = None

    important_dates = result.get("important_dates")
    if not isinstance(important_dates, list):
        important_dates = []

    application_fee = result.get("application_fee")
    if not isinstance(application_fee, list):
        application_fee = []

    vacancy_details = result.get("vacancy_details")
    if not isinstance(vacancy_details, list):
        vacancy_details = []

    return {
        "post_type": result.get("post_type") or fallback["post_type"],
        "summary": result.get("summary") or fallback["summary"],
        "vacancy": result.get("vacancy") or fallback["vacancy"],
        "deadline": deadline,
        "qualification": result.get("qualification") or fallback["qualification"],
        "age_limit": result.get("age_limit") or fallback["age_limit"],
        "application_fee_text": result.get("application_fee_text") or fallback["application_fee_text"],
        "eligibility": result.get("eligibility") or fallback["eligibility"],
        "important_dates": important_dates,
        "application_fee": application_fee,
        "vacancy_details": vacancy_details,
    }


# ---------------------------------------------------------------------------
# Link / title extraction
# ---------------------------------------------------------------------------

PDF_LINK_REGEX = re.compile(r'\.pdf(\?.*)?$', re.IGNORECASE)
GENERIC_ANCHOR_TEXTS = {
    'here', 'click here', 'download', 'pdf', 'view', 'download pdf', 'click',
    'more', 'read more', 'view details', 'download here', 'notification',
    'advertisement', 'view pdf', 'view notification', 'new',
}


def looks_like_pdf_link(href):
    return bool(PDF_LINK_REGEX.search(href.strip().lower()))


def extract_real_title(a_tag):
    """Prefer the anchor's own text, but fall back to the surrounding
    row/list-item text when the anchor text is generic or is itself
    just the filename/URL - this is what was causing raw PDF links to
    show up in place of a real job title."""
    text = a_tag.get_text(strip=True)
    if text and len(text) >= 12 and text.lower() not in GENERIC_ANCHOR_TEXTS and not looks_like_pdf_link(text):
        return text

    parent = a_tag.find_parent(['tr', 'li', 'td', 'p', 'div'])
    if parent:
        parent_text = parent.get_text(" ", strip=True)
        if parent_text and len(parent_text) >= 12:
            return parent_text[:200]

    title_attr = (a_tag.get('title') or '').strip()
    if title_attr:
        return title_attr

    return text


# ---------------------------------------------------------------------------
# Generic site scraper
# ---------------------------------------------------------------------------

def scrape_site(name, url, category, keywords, max_new=3):
    print(f"🔍 Scraping {name}...")
    try:
        resp = fetch_with_retry(url, timeout=20)
        soup = BeautifulSoup(resp.text, 'html.parser')
        anchors = soup.find_all('a', href=True)

        if DEBUG:
            print(f"   (debug) {len(anchors)} total links on page")

        found = 0
        seen = set()
        for a_tag in anchors:
            if found >= max_new:
                break

            href = a_tag['href'].strip()
            if not href or href.startswith('javascript:') or href.startswith('#') or href.startswith('mailto:'):
                continue

            href_l = href.lower()
            if not looks_like_pdf_link(href_l):
                continue

            text_l = a_tag.get_text(strip=True).lower()
            if keywords and not any(k in href_l or k in text_l for k in keywords):
                continue

            pdf_link = urljoin(url, href)
            if pdf_link in seen:
                continue
            seen.add(pdf_link)

            title = extract_real_title(a_tag)
            if not title or len(title) < 10:
                if DEBUG:
                    print(f"   (debug) skipped, title too short: {pdf_link}")
                continue

            if check_if_exists(pdf_link, title):
                continue

            print(f"✅ Found new {name} update: {title[:80]}")
            insert_job(title, pdf_link, url, category)
            found += 1

        if found == 0:
            print(f"   No new updates for {name}.")

    except requests.exceptions.RequestException as e:
        print(f"❌ {name} Scraper Error (network/firewall): {e}")
    except Exception as e:
        print(f"❌ {name} Scraper Error: {e}")


SITE_CONFIGS = [
    {"name": "MPPSC", "url": "https://mppsc.mp.gov.in/", "category": "mppsc",
     "keywords": ["advertisement", "notification", "recruitment"]},
    {"name": "MPESB", "url": "https://esb.mp.gov.in/e_default.html", "category": "mpesb",
     "keywords": ["rulebook", "advertisement", "recruitment"]},
    {"name": "MP Police", "url": "https://police.mp.gov.in/", "category": "mp-police",
     "keywords": ["recruitment", "notification", "bharti"]},
    {"name": "MP High Court", "url": "https://mphc.gov.in/", "category": "mp-high-court",
     "keywords": ["recruitment", "advertisement", "notification"]},
    {"name": "SSC", "url": "https://ssc.gov.in/", "category": "ssc",
     "keywords": ["notice", "corrigendum", "recruitment", "result"]},
    {"name": "RRB", "url": "https://www.rrbcdg.gov.in/", "category": "railway",
     "keywords": ["notice", "cen", "recruitment", "result"]},
]


# ---------------------------------------------------------------------------
# Insert + Telegram
# ---------------------------------------------------------------------------

def insert_job(title, pdf_link, official_link, category):
    clean_title = re.sub(r'[^a-z0-9]+', '-', title.lower().strip()).strip('-')
    if not clean_title:
        clean_title = "latest-job-notification"
    safe_title = clean_title[:60]
    slug = f"{safe_title}-{int(time.time())}"

    ai_data = get_ai_summary(title, category, pdf_link)

    job_data = {
        'slug': slug,
        'title': title,
        'category': category,
        'post_type': ai_data['post_type'],
        'short_summary': ai_data['summary'],
        'total_vacancy': ai_data['vacancy'],
        'application_deadline': ai_data['deadline'],
        'age_limit': ai_data['age_limit'],
        'application_fee_text': ai_data['application_fee_text'],
        'qualification': ai_data['qualification'],
        'important_dates': ai_data['important_dates'],
        'application_fee': ai_data['application_fee'],
        'eligibility': ai_data['eligibility'],
        'vacancy_details': ai_data['vacancy_details'],
        'how_to_apply': f'1. Visit: {official_link}\n2. Read the PDF carefully.\n3. Apply through the official portal.',
        'official_link': official_link,
        'notification_pdf_link': pdf_link,
        'is_published': True,
        'telegram_posted': False,
        'meta_title': f'{title} | Jobinfo MP',
        'meta_description': ai_data['summary'],
    }

    try:
        supabase.table('job_posts').insert(job_data).execute()
        print("💾 Successfully inserted into Supabase!")
        trigger_telegram(job_data)
    except Exception as e:
        print(f"❌ Insert failed: {e}")


def trigger_telegram(job):
    job_url = f"https://jobinfomp.netlify.app/job/{job['slug']}"
    display_deadline = job.get('application_deadline') if job.get('application_deadline') else "Not specified"

    safe_summary = html.escape(str(job.get('short_summary', '')), quote=False)
    safe_title = html.escape(str(job.get('title', '')), quote=False)
    safe_category = html.escape(str(job.get('category', '')).upper(), quote=False)
    safe_deadline = html.escape(str(display_deadline), quote=False)

    official_link = job.get('official_link')
    if official_link and str(official_link).startswith('http'):
        official_text = f'<a href="{html.escape(str(official_link), quote=False)}">Click Here</a>'
    else:
        official_text = "Not Available"

    pdf_link = job.get('notification_pdf_link')
    if pdf_link and str(pdf_link).startswith('http'):
        pdf_text = f'<a href="{html.escape(str(pdf_link), quote=False)}">Click Here</a>'
    else:
        pdf_text = "Not Available"

    message = f"""<b>🚨 New Verified Update! 🚨</b>

📌 <b>{safe_title}</b>
💼 <b>Category:</b> {safe_category}

{safe_summary}

🗓 <b>Deadline:</b> {safe_deadline}

🔗 <b>Official Website:</b> {official_text}
📄 <b>Download PDF:</b> {pdf_text}

✅ <b>Verified by Jobinfo MP</b>
🔎 <b>View Details:</b> <a href="{job_url}">Click Here</a>
"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    try:
        print("📤 Sending message to Telegram...")
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            print("✅ Telegram message sent successfully!")
            supabase.table('job_posts').update({'telegram_posted': True}).eq('slug', job['slug']).execute()
            print("💾 Database updated: telegram_posted = True\n")
        else:
            print(f"❌ Telegram API Error: {resp.status_code} - {resp.text}\n")
    except Exception as e:
        print(f"❌ Network Error contacting Telegram: {e}\n")


def check_and_post_existing_jobs():
    print("🔍 Checking for existing unposted jobs in Supabase...")
    try:
        response = (supabase.table('job_posts')
                    .select('*')
                    .eq('is_published', True)
                    .eq('telegram_posted', False)
                    .order('created_at', desc=True)
                    .limit(1)
                    .execute())
        if response.data:
            job = response.data[0]
            print(f"✅ Found unposted job: {job['title']}")
            trigger_telegram(job)
        else:
            print("✅ No unposted jobs found. All caught up!\n")
    except Exception as e:
        print(f"❌ Error checking existing jobs: {e}")


if __name__ == "__main__":
    print("🤖 ==========================================")
    print("🤖 Starting Automated AI Scraper & Bot (6 Websites)")
    print("🤖 ==========================================\n")

    for site in SITE_CONFIGS:
        scrape_site(site["name"], site["url"], site["category"], site["keywords"])

    check_and_post_existing_jobs()
    print("✅ Scraper and Bot run complete.")