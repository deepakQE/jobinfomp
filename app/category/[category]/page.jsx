import { supabase } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import CategoryTabs from '@/components/CategoryTabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 300;

export default async function CategoryPage({ params }) {
  const { category } = await params;
  
  // Normalize string for components and database match safety
  const activeCategory = category?.toLowerCase();

  // 1. Single database hit scoped strictly to this category
  const { data: categoryPosts, error } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type, short_summary')
    .eq('is_published', true)
    .eq('category', activeCategory)
    .order('created_at', { ascending: false })
    .limit(100); // Pool capacity to let section slices work safely

  // 2. Uniform UI configuration mirroring the homepage sections
  const sectionsConfig = [
    { type: 'notification', label: 'Latest Notifications', limit: 30 },
    { type: 'upcoming', label: 'Upcoming (Expected)', limit: 10 },
    { type: 'admit-card', label: 'Admit Cards', limit: 15 },
    { type: 'result', label: 'Results', limit: 15 },
    { type: 'answer-key', label: 'Answer Keys', limit: 10 },
  ];

  // 3. Low-latency in-memory grouping (Executes under 1ms)
  const renderableSections = sectionsConfig.map((section) => {
    const sectionPosts = (categoryPosts || [])
      .filter((post) => post.post_type === section.type)
      .slice(0, section.limit);

    return {
      ...section,
      posts: sectionPosts,
    };
  });

  const hasData = renderableSections.some((s) => s.posts.length > 0);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      
      {/* Dynamic string passing ensures the right tab glows active */}
      <CategoryTabs active={activeCategory} />

      {/* Clear section context for SEO and user path tracking */}
      <h1 className="text-base font-black text-gray-900 my-4 uppercase tracking-tight px-1 flex items-center gap-1.5">
        <span className="w-1.5 h-3 bg-blue-600 rounded-sm"></span>
        {activeCategory} Portal Updates
      </h1>

      {error && (
        <p className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded mb-4">
          Could not load category updates. Please try again.
        </p>
      )}

      {!hasData && !error && (
        <p className="p-4 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg text-center py-12">
          No updates posted under <span className="font-semibold text-gray-700">{activeCategory}</span> yet.
        </p>
      )}

      {renderableSections.map(({ type, label, posts }) => {
        if (posts.length === 0) return null;

        return (
          <section key={type} className="mb-8">
            <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest px-1">
              {label}
            </h2>
            <div className="border border-gray-200 divide-y divide-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
              {posts.map((post) => (
                <JobCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        );
      })}

      <Footer />
    </main>
  );
}