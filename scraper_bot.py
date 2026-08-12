import os
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import time

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY') # MUST BE SERVICE ROLE KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_if_exists(pdf_link, title):
    if pdf_link:
        res = supabase.table('job_posts').select('slug').eq('notification_pdf_link', pdf_link).execute()
        if res.data: return True
    res = supabase.table('job_posts').select('slug').ilike('title', f'%{title[:30]}%').execute()
    return len(res.data) > 0

def scrape_mppsc():
    print("🔍 Scraping MPPSC...")
    try:
        url = "https://mppsc.mp.gov.in/"
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            if 'advertisement' in a_tag['href'].lower() and '.pdf' in a_tag['href'].lower():
                title = a_tag.text.strip()
                pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://mppsc.mp.gov.in" + a_tag['href']
                if len(title) > 15 and not check_if_exists(pdf_link, title):
                    print(f"✅ Found New MPPSC Job: {title}")
                    insert_job(title, pdf_link, "https://mppsc.mp.gov.in", "mppsc")
                    break
    except Exception as e: print(f"❌ MPPSC Scraper Error: {e}")

def scrape_mpesb():
    print("🔍 Scraping MPESB...")
    try:
        url = "https://esb.mp.gov.in/e_default.html"
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        for a_tag in soup.find_all('a', href=True):
            if 'rulebook' in a_tag['href'].lower() or 'advertisement' in a_tag['href'].lower():
                title = a_tag.text.strip()
                if len(title) > 20:
                    pdf_link = a_tag['href'] if a_tag['href'].startswith('http') else "https://esb.mp.gov.in" + a_tag['href']
                    if not check_if_exists(pdf_link, title):
                        print(f"✅ Found New MPESB Job: {title}")
                        insert_job(title, pdf_link, "https://esb.mp.gov.in", "mpesb")
                        break
    except Exception as e: print(f"❌ MPESB Scraper Error: {e}")

def insert_job(title, pdf_link, official_link, category):
    slug = title.lower().replace(' ', '-').replace('/', '-')[:100] + "-" + str(int(time.time()))
    job_data = {
        'slug': slug, 'title': title, 'category': category, 'post_type': 'latest-job',
        'short_summary': f'Official notification released for {title}. Candidates can apply online through the official portal.',
        'important_dates': '[]', 'application_fee': '[]', 'eligibility': 'Check official PDF notification for detailed eligibility criteria.',
        'vacancy_details': '[]', 'how_to_apply': f'1. Visit the official website: {official_link}\n2. Read the detailed PDF notification carefully.\n3. Apply online through the official MPOnline or departmental portal.',
        'official_link': official_link, 'notification_pdf_link': pdf_link, 'is_published': True, 'telegram_posted': False,
        'meta_title': f'{title} 2026 | Apply Online, PDF, Last Date - Jobinfo MP',
        'meta_description': f'Download official PDF notification, check eligibility, and apply online for {title}. Verified source.'
    }
    try:
        supabase.table('job_posts').insert(job_data).execute()
        print("💾 Successfully inserted into Supabase!")
        trigger_telegram(job_data)
    except Exception as e: print(f"❌ Insert failed: {e}")

def trigger_telegram(job):
    message = f"""🚨 *New Verified Job Update!* 🚨\n\n📌 *{job['title']}*\n💼 *Category:* {job['category'].upper()}\n\n🔗 *Official Website:* {job['official_link']}\n📄 *Download PDF:* {job['notification_pdf_link']}\n\n✅ *Verified by Jobinfo MP*\n🔎 *View Details:* https://jobinfomp.netlify.app/job/{job['slug']}"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}, timeout=10)
    print("📤 Telegram alert sent!")

if __name__ == "__main__":
    print("🤖 Starting Automated Authentic Scraper...")
    scrape_mppsc()
    scrape_mpesb()
    print("✅ Scraper run complete.")