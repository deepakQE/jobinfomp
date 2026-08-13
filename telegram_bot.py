import os
import requests
import json
import re
import html
import warnings
from bs4 import BeautifulSoup
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import time
import urllib3

# Hide the Google Generative AI FutureWarning to keep logs clean
warnings.filterwarnings("ignore", category=FutureWarning)

# Import the stable Google Generative AI library
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Suppress SSL warnings for government sites
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY') # MUST BE SERVICE ROLE KEY
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print("=== TELEGRAM & AI SCRAPER BOT START ===")
print(f"1. Token Loaded: {bool(TELEGRAM_BOT_TOKEN)}")
print(f"2. Chat ID Loaded: {bool(TELEGRAM_CHAT_ID)}")
print(f"3. Supabase URL: {SUPABASE_URL}")
print(f"4. Gemini AI: {'Enabled' if GEMINI_AVAILABLE and GEMINI_API_KEY else 'Disabled (Using Smart Fallback)'}")
print("====================================\n")

if not all([TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("❌ Missing API keys. Check your .env file or GitHub Secrets.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize the STABLE Gemini Client
gemini_model = None
if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.1,
            }
        )
        print("✅ Gemini 1.5 Flash initialized successfully!")
    except Exception as e:
        print(f"⚠️ Gemini Init Failed (Will use fallback): {e}")

def clean_text_for_match(text):
    return re.sub(r'[^a-z0-9\u0900-\u097F]', '', str(text).lower())

def check_if_exists(pdf_link, title):
    if pdf_link:
        res = supabase.table('job_posts').select('slug').eq('notification_pdf_link', pdf_link).execute()
        if res.data: return True
    
    clean_title = clean_text_for_match(title[:40])
    res = supabase.table('job_posts').select('title, created_at').order('created_at', desc=True).limit(50).execute()
    
    for job in res.data:
        if clean_text_for_match(job['title'][:40]) == clean_title:
            return True
    return False

def get_ai_summary(title, category, description=""):
    fallback_summary = f"Official notification released for {category}. Please check the PDF for detailed information."
    
    if not gemini_model:
        return {"post_type": "latest-job", "summary": fallback_summary, "vacancy": "N/A", "deadline": None}

    prompt = f"""
    You are an expert Indian government job portal assistant for 'Jobinfo MP'.
    Analyze this notice:
    - Title: {title}
    - Category: {category}
    - Context: {description}
    
    TASK:
    1. Categorize as exactly one of: "latest-job", "result", "answer-key", "admit-card", or "notice-cancellation".
    2. Write a short, accurate, 1-sentence English summary. If it's a cancellation/result, clearly state that. NEVER say "apply online" for a cancellation or result.
    3. Extract vacancy count if it's a new job, else "N/A".
    4. Extract deadline if mentioned. You MUST format it strictly as "YYYY-MM-DD" (e.g., "2026-09-03"). If no deadline is mentioned, return null.
    
    Return ONLY valid JSON matching this schema:
    {{
      "post_type": "latest-job",
      "summary": "Your 1-sentence summary here.",
      "vacancy": "N/A or number",
      "deadline": null or "YYYY-MM-DD"
    }}
    """
    
    try:
        response = gemini_model.generate_content(prompt)
        result = json.loads(response.text)
        return {
            "post_type": result.get("post_type", "latest-job"),
            "summary": result.get("summary", fallback_summary),
            "vacancy": result.get("vacancy", "N/A"),
            "deadline": result.get("deadline")
        }
    except Exception as e:
        print(f"⚠️ Gemini API failed, using smart fallback: {e}")
        return {"post_type": "latest-job", "summary": fallback_summary, "vacancy": "N/A", "deadline": None}

def scrape_mppsc():
    print("🔍 Scraping MPPSC...")
    try:
        url = "https://mppsc.mp.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if ('advertisement' in href or 'notification' in href) and href.endswith('.pdf'):
                title = a_tag.text.strip()
                if len(title) < 10: continue
                pdf_link = href if href.startswith('http') else "https://mppsc.mp.gov.in" + (href if href.startswith('/') else '/' + href)
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MPPSC Job: {title}")
                    insert_job(title, pdf_link, "https://mppsc.mp.gov.in", "mppsc")
                    return
    except Exception as e: print(f"❌ MPPSC Scraper Error: {e}")

def scrape_mpesb():
    print("🔍 Scraping MPESB...")
    try:
        url = "https://esb.mp.gov.in/e_default.html"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if ('rulebook' in href or 'advertisement' in href) and href.endswith('.pdf'):
                title = a_tag.text.strip()
                if len(title) < 10: continue
                pdf_link = href if href.startswith('http') else "https://esb.mp.gov.in" + (href if href.startswith('/') else '/' + href)
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MPESB Job: {title}")
                    insert_job(title, pdf_link, "https://esb.mp.gov.in", "mpesb")
                    return
    except Exception as e: print(f"❌ MPESB Scraper Error: {e}")

def scrape_mppolice():
    print("🔍 Scraping MP Police...")
    try:
        url = "https://police.mp.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if ('recruitment' in href or 'notification' in href) and href.endswith('.pdf'):
                title = a_tag.text.strip()
                if len(title) < 10: continue
                pdf_link = href if href.startswith('http') else "https://police.mp.gov.in" + (href if href.startswith('/') else '/' + href)
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MP Police Job: {title}")
                    insert_job(title, pdf_link, "https://police.mp.gov.in", "mp-police")
                    return
    except Exception as e: print(f"❌ MP Police Scraper Error (Likely blocked by firewall): {e}")

def scrape_mphc():
    print("🔍 Scraping MP High Court...")
    try:
        url = "https://mphc.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if ('recruitment' in href or 'advertisement' in href) and href.endswith('.pdf'):
                title = a_tag.text.strip()
                if len(title) < 10: continue
                pdf_link = href if href.startswith('http') else "https://mphc.gov.in" + (href if href.startswith('/') else '/' + href)
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MP High Court Job: {title}")
                    insert_job(title, pdf_link, "https://mphc.gov.in", "mp-high-court")
                    return
    except Exception as e: print(f"❌ MP High Court Scraper Error (Likely blocked by firewall): {e}")

def scrape_ssc():
    print("🔍 Scraping SSC...")
    try:
        url = "https://ssc.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if ('notice' in href or 'corrigendum' in href) and href.endswith('.pdf'):
                title = a_tag.text.strip()
                if len(title) < 10: continue
                pdf_link = href if href.startswith('http') else "https://ssc.gov.in" + (href if href.startswith('/') else '/' + href)
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New SSC Update: {title}")
                    insert_job(title, pdf_link, "https://ssc.gov.in", "ssc")
                    return
    except Exception as e: print(f"❌ SSC Scraper Error: {e}")

def scrape_rrb():
    print("🔍 Scraping RRB...")
    try:
        url = "https://www.rrbcdg.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if ('notice' in href or 'cen' in href) and href.endswith('.pdf'):
                title = a_tag.text.strip()
                if len(title) < 10: continue
                pdf_link = href if href.startswith('http') else "https://www.rrbcdg.gov.in/" + (href if href.startswith('/') else '/' + href)
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New RRB Update: {title}")
                    insert_job(title, pdf_link, "https://www.rrbcdg.gov.in/", "railway")
                    return
    except Exception as e: print(f"❌ RRB Scraper Error (Likely blocked by firewall): {e}")

def insert_job(title, pdf_link, official_link, category):
    clean_title = re.sub(r'[^a-z0-9]+', '-', title.lower().strip()).strip('-')
    if not clean_title: clean_title = "latest-job-notification"
    safe_title = clean_title[:60]
    slug = f"{safe_title}-{int(time.time())}"
    
    ai_data = get_ai_summary(title, category)
    
    job_data = {
        'slug': slug,
        'title': title,
        'category': category,
        'post_type': ai_data['post_type'],
        'short_summary': ai_data['summary'],
        'total_vacancy': ai_data['vacancy'],
        'application_deadline': ai_data['deadline'],
        'age_limit': 'N/A',
        'application_fee_text': 'N/A',
        'qualification': 'Check PDF',
        'important_dates': [],
        'application_fee': [],
        'eligibility': 'Check official PDF notification for detailed eligibility criteria.',
        'vacancy_details': [],
        'how_to_apply': f'1. Visit: {official_link}\n2. Read the PDF carefully.\n3. Apply through the official portal.',
        'official_link': official_link,
        'notification_pdf_link': pdf_link,
        'is_published': True,
        'telegram_posted': False,
        'meta_title': f'{title} | Jobinfo MP',
        'meta_description': ai_data['summary']
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
    
    safe_summary = html.escape(job['short_summary'], quote=False)
    safe_title = html.escape(job['title'], quote=False)
    safe_category = html.escape(job['category'].upper(), quote=False)
    safe_deadline = html.escape(str(display_deadline), quote=False)
    safe_official = html.escape(job['official_link'], quote=False)
    safe_pdf = html.escape(job['notification_pdf_link'], quote=False)
    
    message = f"""<b>🚨 New Verified Update! 🚨</b>

📌 <b>{safe_title}</b>
💼 <b>Category:</b> {safe_category}

{safe_summary}

🗓 <b>Deadline:</b> {safe_deadline}

🔗 <b>Official Website:</b> <a href="{safe_official}">Click Here</a>
📄 <b>Download PDF:</b> <a href="{safe_pdf}">Click Here</a>

✅ <b>Verified by Jobinfo MP</b>
🔎 <b>View Details:</b> <a href="{job_url}">Click Here</a>
"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID, 
        "text": message, 
        "parse_mode": "HTML", 
        "disable_web_page_preview": True
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
        response = supabase.table('job_posts').select('*').eq('is_published', True).eq('telegram_posted', False).order('created_at', desc=True).limit(1).execute()
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
    
    # Run all 6 scrapers
    scrape_mppsc()
    scrape_mpesb()
    scrape_mppolice()
    scrape_mphc()
    scrape_ssc()
    scrape_rrb()
    
    check_and_post_existing_jobs()
    print("✅ Scraper and Bot run complete.")