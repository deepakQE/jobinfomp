import { supabase } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import CategoryTabs from '@/components/CategoryTabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 300;

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const { data: posts, error } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type, short_summary')
    .eq('is_published', true)
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <CategoryTabs active={category} />
      <div className="border border-gray-200 divide-y divide-gray-200 rounded">
        {error && <p className="p-3 text-sm text-red-600">Could not load posts.</p>}
        {posts?.length === 0 && (
          <p className="p-3 text-sm text-gray-500">No posts in this category yet.</p>
        )}
        {posts?.map((post) => (
          <JobCard key={post.slug} post={post} />
        ))}
      </div>
      <Footer />
    </main>
  );
}