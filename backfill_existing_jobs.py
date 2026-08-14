"""
One-time backfill: repairs job_posts rows that were inserted by the OLD
script (before the PDF-extraction / urljoin fixes) and are stuck showing
fallback placeholders ("N/A", "Check PDF", malformed PDF links).

check_if_exists() in telegram_bot.py title-matches, so the normal scraper
will never revisit these rows on its own - this script targets them
directly, once.

Run manually (NOT as part of the scheduled GitHub Action):
    python backfill_existing_jobs.py            # dry run, just lists what it would fix
    python backfill_existing_jobs.py --apply     # actually updates Supabase

Requires the same .env / secrets as telegram_bot.py (it imports from it).
"""

import argparse
import re
import sys
import time

# Reuses the already-fixed client, extraction, and summary logic instead
# of duplicating it. Importing runs telegram_bot.py's module-level setup
# (env checks, Supabase client, Gemini client) - that's expected here.
from telegram_bot import supabase, get_ai_summary

FALLBACK_SUMMARY_PREFIX = "Official notification released for"


def repair_pdf_link(url):
    """Fixes the old concatenation bug where a domain like '...gov.in' got
    glued directly to the path with no '/' in between, e.g.
    'https://mppsc.mp.gov.inuploads/...' -> 'https://mppsc.mp.gov.in/uploads/...'."""
    if not url:
        return url
    return re.sub(r'(\.(?:gov\.in|nic\.in|org\.in|co\.in))(?=[a-zA-Z0-9])', r'\1/', url, count=1)


def looks_like_stale_fallback(job):
    summary = (job.get('short_summary') or '')
    return (
        summary.startswith(FALLBACK_SUMMARY_PREFIX)
        or job.get('qualification') == 'Check PDF'
        or job.get('total_vacancy') in (None, 'N/A')
    )


def find_stale_jobs(limit=200, retries=2, backoff=5):
    """Wrapped with a couple of retries - a single TLS/handshake timeout to
    Supabase from a local machine's network shouldn't kill the whole run."""
    last_err = None
    for attempt in range(retries + 1):
        try:
            res = (supabase.table('job_posts')
                   .select('*')
                   .order('created_at', desc=True)
                   .limit(limit)
                   .execute())
            return [j for j in res.data if looks_like_stale_fallback(j)]
        except Exception as e:
            last_err = e
            print(f"⚠️ Supabase query failed (attempt {attempt + 1}/{retries + 1}): {e}")
            if attempt < retries:
                time.sleep(backoff)
    raise last_err


def backfill(apply_changes=False):
    stale = find_stale_jobs()
    if not stale:
        print("✅ No stale/fallback rows found.")
        return

    print(f"Found {len(stale)} row(s) that look like old fallback data:\n")

    for job in stale:
        title = job.get('title', '')
        category = job.get('category', 'unknown')
        old_link = job.get('notification_pdf_link')
        new_link = repair_pdf_link(old_link)

        print(f"— {title[:80]}")
        if new_link != old_link:
            print(f"    fixing link: {old_link}")
            print(f"             ->  {new_link}")

        if not apply_changes:
            continue

        ai_data = get_ai_summary(title, category, new_link)

        update_payload = {
            'notification_pdf_link': new_link,
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
            'meta_description': ai_data['summary'],
        }

        for attempt in range(2):
            try:
                supabase.table('job_posts').update(update_payload).eq('slug', job['slug']).execute()
                print(f"    💾 updated slug={job['slug']}")
                break
            except Exception as e:
                print(f"    ⚠️ update attempt {attempt + 1}/2 failed for slug={job['slug']}: {e}")
                if attempt == 0:
                    time.sleep(5)
                else:
                    print(f"    ❌ giving up on slug={job['slug']} - re-run the script to retry it")

        print()

    if not apply_changes:
        print("\n(dry run - nothing was written. Re-run with --apply to update Supabase.)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually write updates to Supabase")
    args = parser.parse_args()
    backfill(apply_changes=args.apply)