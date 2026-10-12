import { supabase } from '@/lib/supabase';

const baseUrl = 'https://jobinfomp.netlify.app';
function escapeXml(value) { return String(value || '').replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character])); }

export async function GET() {
  const { data: posts } = await supabase.from('job_posts').select('slug, title, short_summary, created_at').eq('is_published', true).order('created_at', { ascending: false }).limit(50);
  const items = (posts || []).map((post) => `<item><title>${escapeXml(post.title)}</title><link>${baseUrl}/job/${encodeURIComponent(post.slug)}</link><guid>${baseUrl}/job/${encodeURIComponent(post.slug)}</guid><pubDate>${new Date(post.created_at).toUTCString()}</pubDate><description>${escapeXml(post.short_summary || post.title)}</description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Jobinfo MP</title><link>${baseUrl}</link><description>Latest government job updates from Jobinfo MP.</description>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
