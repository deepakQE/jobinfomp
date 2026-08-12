import os
import requests
import json
import re
import html
from bs4 import BeautifulSoup
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import time
import urllib3

# Suppress SSL warnings since we use verify=False for government sites
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY') # MUST BE SERVICE ROLE KEY

print("=== TELEGRAM & SCRAPER BOT START ===")
print(f"1. Token Loaded: {bool(TELEGRAM_BOT_TOKEN)}")
print(f"2. Chat ID Loaded: {bool(TELEGRAM_CHAT_ID)}")
print("====================================\n")

if not all([TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("❌ Missing API keys. Check your .env file or GitHub Secrets.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def escape_html(text):
    if not text: return ""
    return html.escape(str(text), quote=False)

def check_if_exists(pdf_link, title):
    if pdf_link:
        res = supabase.table('job_posts').select('slug').eq('notification_pdf_link', pdf_link).execute()
        if res.data: return True
    search_term = title[:30].strip()
    res = supabase.table('job_posts').select('slug').ilike('title', f'%{search_term}%').execute()
    return len(res.data) > 0

def scrape_mppsc():
    print("🔍 Scraping MPPSC...")
    try:
        url = "https://mppsc.mp.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if 'advertisement' in href and '.pdf' in href:
                title = a_tag.text.strip()
                if len(title) < 15: continue
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://mppsc.mp.gov.in" + a_tag['href']
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
            if 'rulebook' in href or 'advertisement' in href:
                title = a_tag.text.strip()
                if len(title) < 20: continue
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://esb.mp.gov.in" + a_tag['href']
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
            if 'recruitment' in href or 'notification' in href or '.pdf' in href:
                title = a_tag.text.strip()
                if len(title) < 15: continue
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://police.mp.gov.in" + a_tag['href']
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MP Police Job: {title}")
                    insert_job(title, pdf_link, "https://police.mp.gov.in", "mp-police")
                    return
    except Exception as e: print(f"❌ MP Police Scraper Error: {e}")

def scrape_mphc():
    print("🔍 Scraping MP High Court...")
    try:
        url = "https://mphc.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if 'recruitment' in href or 'advertisement' in href or '.pdf' in href:
                title = a_tag.text.strip()
                if len(title) < 15: continue
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://mphc.gov.in" + a_tag['href']
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MP High Court Job: {title}")
                    insert_job(title, pdf_link, "https://mphc.gov.in", "mp-high-court")
                    return
    except Exception as e: print(f"❌ MP High Court Scraper Error: {e}")

def scrape_ssc():
    print("🔍 Scraping SSC...")
    try:
        url = "https://ssc.gov.in/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            if 'notice' in href or 'corrigendum' in href or '.pdf' in href:
                title = a_tag.text.strip()
                if len(title) < 15: continue
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://ssc.gov.in" + a_tag['href']
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
            if 'notice' in href or 'cen' in href or '.pdf' in href:
                title = a_tag.text.strip()
                if len(title) < 15: continue
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://www.rrbcdg.gov.in/" + a_tag['href']
                if not check_if_exists(pdf_link, title):
                    print(f"✅ Found New RRB Update: {title}")
                    insert_job(title, pdf_link, "https://www.rrbcdg.gov.in/", "railway")
                    return
    except Exception as e: print(f"❌ RRB Scraper Error: {e}")

def insert_job(title, pdf_link, official_link, category):
    clean_title = re.sub(r'[^a-z0-9]+', '-', title.lower().strip()).strip('-')
    if not clean_title: clean_title = "latest-job-notification"
    safe_title = clean_title[:60]
    slug = f"{safe_title}-{int(time.time())}"
    
    job_data = {
        'slug': slug,
        'title': title,
        'category': category,
        'post_type': 'latest-job',
        'short_summary': f'Official notification released for {title}. Candidates can apply online through the official portal.',
        # NEW KEY HIGHLIGHTS COLUMNS (Ready for manual/AI updates)
        'total_vacancy': '',
        'age_limit': '',
        'application_fee_text': '',
        'qualification': '',
        'important_dates': [],
        'application_fee': [],
        'eligibility': 'Check official PDF notification for detailed eligibility criteria, age limit, and educational qualifications.',
        'vacancy_details': [],
        'how_to_apply': f'1. Visit the official website: {official_link}\n2. Read the detailed PDF notification carefully.\n3. Apply online through the official portal before the last date.',
        'official_link': official_link,
        'notification_pdf_link': pdf_link,
        'is_published': True,
        'telegram_posted': False,
        'meta_title': f'{title} 2026 | Apply Online, PDF, Last Date - Jobinfo MP',
        'meta_description': f'Download official PDF notification, check eligibility, and apply online for {title}. Verified source.'
    }
    
    try:
        supabase.table('job_posts').insert(job_data).execute()
        print("💾 Successfully inserted into Supabase!")
        trigger_telegram(job_data)
    except Exception as e:
        print(f"❌ Insert failed: {e}")

def get_last_date(job):
    dates = job.get('important_dates') or []
    if isinstance(dates, str):
        try: dates = json.loads(dates)
        except: dates = []
    for date_row in dates:
        if isinstance(date_row, dict):
            label = str(date_row.get('label', '')).lower()
            if 'last date' in label or 'deadline' in label:
                return date_row.get('date', 'Not specified')
    return 'Not specified'

def trigger_telegram(job):
    job_url = f"https://jobinfomp.netlify.app/job/{job['slug']}"
    raw_date = get_last_date(job)
    formatted_date = raw_date if raw_date != 'Not specified' else 'Not specified'
    
    message = f"""<b>🚨 New Verified Job Update! 🚨</b>

📌 <b>{escape_html(job['title'])}</b>
💼 <b>Category:</b> {escape_html(job['category'].upper())}

{escape_html(job['short_summary'])}

🗓 <b>Deadline:</b> {escape_html(formatted_date)}

🔗 <b>Official Website:</b> {escape_html(job['official_link'])}
📄 <b>Download PDF:</b> {escape_html(job['notification_pdf_link'])}

✅ <b>Verified by Jobinfo MP</b>
🔎 <b>View Details:</b> {escape_html(job_url)}
"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    
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
    print("🤖 Starting Automated Authentic Scraper & Bot")
    print("🤖 ==========================================\n")
    
    # Run all scrapers
    scrape_mppsc()
    scrape_mpesb()
    scrape_mppolice()
    scrape_mphc()
    scrape_ssc()
    scrape_rrb()
    
    check_and_post_existing_jobs()
    print("✅ Scraper and Bot run complete.")