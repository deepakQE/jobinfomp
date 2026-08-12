import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function SimilarJobs({ currentCategory, currentSlug }) {
  const { data: similarJobs } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type')
    .eq('category', currentCategory)
    .eq('is_published', true)
    .neq('slug', currentSlug)
    .limit(3);

  if (!similarJobs || similarJobs.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-600 rounded-sm"></span>
        Similar Jobs in {currentCategory?.toUpperCase()}
      </h2>
      <div className="grid gap-3">
        {similarJobs.map((job) => (
          <Link 
            key={job.slug} 
            href={`/job/${job.slug}`}
            className="block p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1 block">
              {job.post_type}
            </span>
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2">
              {job.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}