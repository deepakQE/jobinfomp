import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'RRB Technician Vacancy 2026 | Apply Online | Jobinfo MP',
  description: 'RRB technician vacancy updates, eligibility, last date, and official railway links for 2026 recruitment.',
};

export default async function RrbTechnicianVacancyPage() {
  const { data: posts } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type, short_summary')
    .eq('is_published', true)
    .eq('category', 'railway')
    .or('title.ilike.%technician%,slug.ilike.%technician%')
    .order('created_at', { ascending: false })
    .limit(16);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <Link href="/railway-jobs" className="text-xs font-semibold text-blue-700 hover:text-blue-800">← Back to railway jobs</Link>
      <h1 className="mt-4 text-2xl font-black text-gray-900 leading-tight">RRB Technician Vacancy 2026</h1>
      <p className="mt-3 text-sm text-gray-700 leading-relaxed">This page is for high-intent searchers who want technician recruitment details, official notices, and direct apply links quickly.</p>

      <section className="mt-5 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {posts && posts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <JobCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-gray-500">No railway technician posts are available yet. Add posts in Supabase with technician in the title or slug.</p>
        )}
      </section>

      <Footer />
    </main>
  );
}