import os
import argparse
import calendar
import requests
from datetime import date, datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Force Python to load the .env file into memory
load_dotenv()

# 2. Fetch the keys directly from the loaded environment
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Guard clause to prevent the script from running if the .env is missing
if not all([TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Missing API keys. Check your .env file.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def publication_date(job):
    raw_date = job.get('notification_date') or job.get('published_at') or job.get('publish_date') or job.get('created_at')
    return datetime.fromisoformat(str(raw_date).replace('Z', '+00:00')).date()

def is_recent(job, today=None):
    today = today or date.today()
    month = today.month - 6
    year = today.year
    if month <= 0:
        month += 12
        year -= 1
    cutoff = date(year, month, min(today.day, calendar.monthrange(year, month)[1]))
    return publication_date(job) >= cutoff

def fetch_latest_job():
    try:
        # Pull the latest job that is published AND has NOT been posted to Telegram yet
        response = supabase.table('job_posts') \
            .select('*') \
            .eq('is_published', True) \
            .eq('telegram_posted', False) \
            .order('created_at', desc=True) \
            .limit(25) \
            .execute()
        for job in response.data or []:
            if is_recent(job):
                return job
            print(f"Skipping archive job: {job.get('slug')} ({publication_date(job).isoformat()})")
        return None
    except Exception as e:
        print(f"Database Fetch Error: {str(e)}")
        return None

def send_telegram_alert(job):
    job_url = f"https://jobinfomp.netlify.app/job/{job['slug']}"
    
    # PROTECTED DATE PARSING LAYER
    raw_date = job.get('application_deadline')
    formatted_date = 'Not specified' # Secure default fallback layout
    
    if raw_date:
        try:
            # Handle if the database passes a full timestamp or string split parameter
            clean_date = str(raw_date).split('T')[0].strip()
            date_obj = datetime.strptime(clean_date, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d %B %Y')
        except (ValueError, TypeError):
            # Fallback instead of crashing if the date format is unexpected
            formatted_date = str(raw_date)
    
    message = f"""🚨 *New Job Update!* 🚨

📌 *{job['title']}*
💼 *Category:* {job['category'].upper()}

{job['short_summary']}

🗓 *Deadline:* {formatted_date}

🔗 *Apply / View Details:* {job_url}
"""

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            # Tell the database this job is handled so it never posts again
            supabase.table('job_posts').update({'telegram_posted': True}).eq('slug', job['slug']).execute()
            print(f"Success: Anti-spam flag set. Job [{job['slug']}] posted securely.")
        else:
            print(f"Telegram API Error: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Network Timeout/Error contacting Telegram: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send the newest recent job alert.")
    parser.add_argument('--dry-run', action='store_true', help='Print the job that would be sent without calling Telegram or updating Supabase.')
    args = parser.parse_args()
    latest_job = fetch_latest_job()
    if latest_job:
        if args.dry_run:
            print(f"Dry run: would send {latest_job['slug']} ({publication_date(latest_job).isoformat()})")
        else:
            send_telegram_alert(latest_job)
    else:
        print("No active jobs found to post.")