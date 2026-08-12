import os
import requests
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Force Python to load the .env file
load_dotenv()

# 2. Fetch keys
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

print("=== TELEGRAM BOT DEBUG START ===")
print(f"1. Token Loaded: {bool(TELEGRAM_BOT_TOKEN)}")
print(f"2. Chat ID Loaded: {bool(TELEGRAM_CHAT_ID)}")
print(f"3. Supabase URL: {SUPABASE_URL}")
print(f"4. Supabase Key starts with: {SUPABASE_KEY[:15] if SUPABASE_KEY else 'MISSING'}...")
print("================================\n")

if not all([TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("❌ Missing API keys. Check your .env file.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_last_date(job):
    dates = job.get('important_dates') or []
    for date_row in dates:
        label = str(date_row.get('label', '')).lower()
        if 'last date' in label or 'deadline' in label:
            return date_row.get('date', 'Not specified')
    return 'Not specified'

def fetch_latest_job():
    try:
        print("🔍 Querying Supabase for jobs where is_published=True AND telegram_posted=False...")
        response = supabase.table('job_posts') \
            .select('*') \
            .eq('is_published', True) \
            .eq('telegram_posted', False) \
            .order('created_at', desc=True) \
            .limit(1) \
            .execute()
        
        if not response.data:
            print("⚠️ No jobs found. This usually means:")
            print("   a) All jobs already have telegram_posted = true")
            print("   b) Supabase RLS is blocking the query (Use Service Role Key or add RLS policies)")
            
            # Debug: Check what IS in the database
            debug_response = supabase.table('job_posts').select('slug, is_published, telegram_posted').limit(3).execute()
            print(f"   🔎 Sample of jobs in DB: {debug_response.data}")
            return None
            
        print(f"✅ Found job to post: {response.data[0]['title']}")
        return response.data[0]
        
    except Exception as e:
        print(f"❌ Database Fetch Error: {str(e)}")
        return None

def send_telegram_alert(job):
    job_url = f"https://jobinfomp.netlify.app/job/{job['slug']}"
    raw_date = get_last_date(job)
    
    # Since our DB uses formats like "16 August 2026", we'll just use it directly 
    # instead of forcing a YYYY-MM-DD parse that will crash.
    formatted_date = raw_date if raw_date != 'Not specified' else 'Not specified'
    
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
        "parse_mode": "Markdown"
    }

    try:
        print("📤 Sending message to Telegram...")
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            print("✅ Telegram message sent successfully!")
            try:
                print("💾 Updating Supabase to set telegram_posted = True...")
                supabase.table('job_posts') \
                    .update({'telegram_posted': True}) \
                    .eq('slug', job['slug']) \
                    .execute()
                print("✅ Database updated successfully. Anti-spam flag set.")
            except Exception as update_error:
                print(f"⚠️ Telegram sent, but database update failed: {str(update_error)}")
        else:
            print(f"❌ Telegram API Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Timeout/Error contacting Telegram: {str(e)}")

if __name__ == "__main__":
    latest_job = fetch_latest_job()
    if latest_job:
        send_telegram_alert(latest_job)
    else:
        print("🛑 Script finished. No active jobs found to post.")