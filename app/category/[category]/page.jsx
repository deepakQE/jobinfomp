import { supabase } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import CategoryTabs from '@/components/CategoryTabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;

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
    { type: 'latest-job', label: 'Latest Notifications', limit: 30 },
    { type: 'upcoming-job', label: 'Upcoming (Expected)', limit: 10 },
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
    <>
      <Header />
      <main className="min-h-screen bg-paper">
        <CategoryTabs active={activeCategory} showLabel={false} />
        {/* Category Hero */}
        <section className="bg-ink-navy text-hero-text border-b-4 border-gold">
          <div className="container-editorial py-8 md:py-10">
            <h1 className="headline-lg text-hero-text mb-2">
              {activeCategory.toUpperCase()} Portal
            </h1>
            <p className="text-sm md:text-base text-hero-muted">
              Notifications, admit cards, results, and answer keys for {activeCategory.toUpperCase()}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="container-editorial pb-8">
          {error && (
            <div className="p-4 text-sm text-danger bg-danger-bg border border-danger-border rounded-card mb-6 mt-6">
              Could not load category updates. Please try again.
            </div>
          )}

          {!hasData && !error && (
            <div className="text-center py-12 mt-6">
              <p className="text-sm text-slate">
                No updates posted under <span className="font-semibold text-primary">{activeCategory.toUpperCase()}</span> yet.
              </p>
            </div>
          )}

          {renderableSections.map(({ type, label, posts }, sectionIndex) => {
            if (posts.length === 0) return null;

            return (
              <section key={type} className="mb-10 mt-6">
                {/* Section Header */}
                <div className="flex items-center gap-3 pb-4 mb-6 border-b hairline-border">
                  <span className="w-2 h-2 bg-gold rounded-full" />
                  <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                    {label}
                  </h2>
                  <span className="ml-auto text-xs font-mono text-slate">
                    {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post, cardIndex) => (
                    <div
                      key={post.slug}
                      className="fade-up"
                      style={{
                        animationDelay: `${sectionIndex * 100 + cardIndex * 60}ms`,
                      }}
                    >
                      <JobCard post={post} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}