import { supabase } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryTabs from '@/components/CategoryTabs';

export const revalidate = 60;

export default async function Home() {
  // 1. Single DB hit pulling the pool along with application_deadline column live on request
  const { data: allPosts, error } = await supabase
    .from('job_posts')
    .select('slug, title, category, post_type, short_summary, application_deadline')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(100); 

  // 2. Structural config mapping matching exact database post_type enum values
  const sectionsConfig = [
    { type: 'latest-job', label: 'Latest Notifications', limit: 30 },
    { type: 'upcoming-job', label: 'Upcoming (Expected)', limit: 10 },
    { type: 'admit-card', label: 'Admit Cards', limit: 15 },
    { type: 'result', label: 'Results', limit: 15 },
    { type: 'answer-key', label: 'Answer Keys', limit: 10 },
  ];

  // Get current date string structured strictly for IST (Asia/Kolkata) matching
  const currentISTDateStr = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  }); // Outputs: YYYY-MM-DD reliably

  // 3. Process the filtration in-memory safely
  const renderableSections = sectionsConfig.map((section) => {
    const sectionPosts = (allPosts || [])
      .filter((post) => {
        // Condition A: Verify type mapping match
        if (post.post_type !== section.type) return false;

        // Condition B: Filter out expired application notifications automatically
        if (section.type === 'latest-job' && post.application_deadline) {
          return post.application_deadline >= currentISTDateStr;
        }

        return true;
      })
      .slice(0, section.limit); 

    return {
      ...section,
      posts: sectionPosts,
    };
  });

  const hasData = renderableSections.some((s) => s.posts.length > 0);
  const totalNotifications = renderableSections.reduce((sum, s) => sum + s.posts.length, 0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-paper">
        <CategoryTabs active="all" showLabel={false} />
        {/* Hero Section - Notice Board Style */}
        <section className="bg-ink-navy text-hero-text border-b-4 border-gold">
          <div className="container-editorial py-10 md:py-14">
            <h1 className="headline-xl text-hero-text mb-3">
              Government Job Portal
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-hero-muted mb-6">
              Official notifications aggregated in one place. Notifications, admit cards, results, and answer keys.
            </p>

            {/* Live Counter */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex flex-col">
                <span className="text-3xl font-mono font-bold tabular text-gold">
                  {totalNotifications}
                </span>
                <span className="text-xs font-mono text-hero-muted uppercase tracking-widest">
                  Active Updates
                </span>
              </div>
              <div className="w-px h-12 bg-hero-muted/20" />
              <div className="flex flex-col">
                <span className="text-3xl font-mono font-bold tabular text-gold">
                  {new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs font-mono text-hero-muted uppercase tracking-widest">
                  Last Updated
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container-editorial py-8">
          {error && (
            <div className="p-4 text-sm text-danger bg-danger-bg border border-danger-border rounded-card mb-6">
              Failed to load job sections. Please try again.
            </div>
          )}
          
          {!hasData && !error && (
            <div className="text-center py-12">
              <p className="text-sm text-slate">
                No job alerts or updates posted yet. Check back soon.
              </p>
            </div>
          )}

          {renderableSections.map(({ type, label, posts }, sectionIndex) => {
            if (posts.length === 0) return null;

            return (
              <section key={type} className="mb-10">
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