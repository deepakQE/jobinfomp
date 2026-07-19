import { supabase } from '@/lib/supabase';
import JobCard from '@/components/JobCard';
import CategoryTabs from '@/components/CategoryTabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// FORCE NEXT.JS TO FETCH FRESH DATA ON EVERY VISIT INSTEAD OF BUILDING STATIC FILES
export const dynamic = 'force-dynamic';

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

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <CategoryTabs active="all" />

      {error && (
        <p className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded mb-4">
          Failed to load job sections. Please try again.
        </p>
      )}
      
      {!hasData && !error && (
        <p className="p-3 text-sm text-gray-500 text-center py-8">
          No job alerts or updates posted yet.
        </p>
      )}

      {renderableSections.map(({ type, label, posts }) => {
        if (posts.length === 0) return null;

        return (
          <section key={type} className="mb-8">
            <h2 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
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