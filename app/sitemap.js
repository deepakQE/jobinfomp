import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const { data: posts } = await supabase
    .from('job_posts')
    .select('slug, created_at')
    .eq('is_published', true);

  const jobUrls = (posts || []).map((post) => ({
    url: `https://jobinfomp.in/job/${post.slug}`, // update to your real domain
    lastModified: post.created_at,
  }));

  return [
    { url: 'https://jobinfomp.in', lastModified: new Date() },
    ...jobUrls,
  ];
}