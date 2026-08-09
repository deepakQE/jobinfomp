import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admit Card Updates 2026 | Hall Ticket Alerts | Jobinfo MP',
  description: 'Latest admit card and hall ticket updates for railway, MPPSC, MPESB, police, and SSC exams.',
};

export default async function AdmitCardUpdatesPage() {
  const { data: posts } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type, short_summary')
    .eq('is_published', true)
    .eq('post_type', 'admit-card')
    .order('created_at', { ascending: false })
    .limit(16);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <Link href="/" className="text-xs font-semibold text-blue-700 hover:text-blue-800">← Back to home</Link>
      <h1 className="mt-4 text-2xl font-black text-gray-900 leading-tight">Admit Card Updates 2026</h1>
      <p className="mt-3 text-sm text-gray-700 leading-relaxed">One page for hall tickets, exam dates, and release alerts across major government recruitment boards.</p>

      <section className="mt-5 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {posts && posts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <JobCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-gray-500">No admit card updates are available yet. Add posts in Supabase with post_type set to admit-card.</p>
        )}
      </section>

      <Footer />
    </main>
  );
}