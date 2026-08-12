import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://jobinfomp.netlify.app';

  const { data: posts } = await supabase
    .from('job_posts')
    .select('slug, created_at')
    .eq('is_published', true);

  const jobUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/job/${post.slug}`,
    lastModified: post.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticRoutes = [
    '', 
    '/category/mpesb',
    '/category/mppsc',
    '/category/mp-police',
    '/category/railway',
    '/category/ssc',
    '/about',
    '/contact',
    '/railway-jobs',
    '/rrb-technician-vacancy',
    '/result-updates',
    '/admit-card-updates',
    '/answer-key-updates',
    '/syllabus',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.9,
  }));

  return [...staticRoutes, ...jobUrls];
}