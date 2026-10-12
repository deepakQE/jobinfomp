import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: posts } = await supabase.from('job_posts').select('slug, title, short_summary').eq('is_published', true).order('created_at', { ascending: false }).limit(100);
  const lines = ['# Jobinfo MP', '', '> Government job notifications, admit cards, results, and answer keys from official sources.', '', '## Important pages', '- https://jobinfomp.netlify.app/', '- https://jobinfomp.netlify.app/about', '- https://jobinfomp.netlify.app/disclaimer', '- https://jobinfomp.netlify.app/contact', '', '## Published updates', ...(posts || []).map((post) => `- [${post.title}](https://jobinfomp.netlify.app/job/${encodeURIComponent(post.slug)}): ${post.short_summary || post.title}`)];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
