import { supabase } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import CategoryTabs from '@/components/CategoryTabs';
import SearchForm from '@/components/SearchForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const revalidate = 60;

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const searchQuery = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q.trim().toLowerCase() : '';
  const activeCategory = category; 

  const { data: categoryPosts, error } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type, short_summary')
    .eq('is_published', true)
    .ilike('category', activeCategory) // FIX: Ignores uppercase/lowercase mismatches
    .order('created_at', { ascending: false })
    .limit(100);

  const sectionsConfig = [
    { type: 'latest-job', label: 'Latest Notifications', limit: 30 }, // FIX: Matches DB exactly
    { type: 'upcoming-job', label: 'Upcoming (Expected)', limit: 10 }, // FIX: Matches DB exactly
    { type: 'admit-card', label: 'Admit Cards', limit: 15 },
    { type: 'result', label: 'Results', limit: 15 },
    { type: 'answer-key', label: 'Answer Keys', limit: 10 },
  ];

  const renderableSections = sectionsConfig.map((section) => {
    const sectionPosts = (categoryPosts || [])
      .filter((post) => post.post_type === section.type)
      .filter((post) => {
        if (!searchQuery) return true;
        const searchableText = [post.title, post.short_summary, post.category, post.post_type].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(searchQuery);
      })
      .slice(0, section.limit);
    return { ...section, posts: sectionPosts };
  });

  const hasData = renderableSections.some((s) => s.posts.length > 0);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link href="/" className="text-xs font-semibold text-blue-700 hover:text-blue-800">← Back to all jobs</Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{activeCategory}</span>
      </div>
      <CategoryTabs active={activeCategory?.toLowerCase()} />
      <SearchForm value={searchQuery} action={`/category/${activeCategory}`} />
      <section className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-gray-700 leading-relaxed">
        Category-specific updates for {activeCategory}. Check the latest notifications, results, and answer keys in one place.
      </section>
      <h1 className="text-base font-black text-gray-900 my-4 uppercase tracking-tight px-1 flex items-center gap-1.5">
        <span className="w-1.5 h-3 bg-blue-600 rounded-sm"></span>{activeCategory} Portal Updates
      </h1>
      {error && <p className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded mb-4">Could not load category updates.</p>}
      {!hasData && !error && (
        <p className="p-4 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg text-center py-12">
          {searchQuery ? <>No matching updates found under <span className="font-semibold text-gray-700">{activeCategory}</span>.</> : <>No updates posted under <span className="font-semibold text-gray-700">{activeCategory}</span> yet.</>}
        </p>
      )}
      {renderableSections.map(({ type, label, posts }) => {
        if (posts.length === 0) return null;
        return (
          <section key={type} className="mb-8">
            <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest px-1">{label}</h2>
            <div className="border border-gray-200 divide-y divide-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
              {posts.map((post) => <JobCard key={post.slug} post={post} />)}
            </div>
          </section>
        );
      })}
      <Footer />
    </main>
  );
}