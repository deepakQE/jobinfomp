// app/job/[slug]/page.jsx
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';

// Keep this commented out while testing locally so you aren't fighting the cache
// export const revalidate = 300; 

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('job_posts')
    .select('title, short_summary')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) return { title: 'Job not found | Jobinfo MP' };

  return {
    title: `${post.title} | Jobinfo MP`,
    description: post.short_summary || 'Latest MP government job notification, eligibility, vacancy, and apply online details.',
    // Fixed domain to match your new registration
    alternates: { canonical: `https://marvelous-peony-6a778e.netlify.app/job/${slug}` }, 
  };
}

export default async function JobPage({ params }) {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('job_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) return notFound();

  // Strict validation to prevent fatal .map() crashes if data is missing or malformed
  const safeArray = (data) => Array.isArray(data) ? data : [];
  
  const dates = safeArray(post.important_dates);
  const fees = safeArray(post.application_fee);
  const vacancies = safeArray(post.vacancy_details);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{post.title}</h1>
        {post.short_summary && (
          <p className="text-sm text-gray-700 bg-blue-50/50 p-4 rounded-lg border border-blue-100 leading-relaxed">
            {post.short_summary}
          </p>
        )}
      </div>

      {dates.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
             <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
             Important Dates
          </h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-gray-200">
                {dates.map((row, i) => (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-600">{row.label}</td>
                    <td className="p-3 text-right text-gray-900 font-semibold">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {fees.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-2">
             <span className="w-2 h-2 bg-green-600 rounded-full"></span>
             Application Fee
          </h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-gray-200">
                {fees.map((row, i) => (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-600">{row.category}</td>
                    <td className="p-3 text-right text-gray-900 font-semibold">{row.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {post.eligibility && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider">Eligibility</h2>
          <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-4 rounded-lg border border-gray-200 shadow-sm leading-relaxed">
            {post.eligibility}
          </div>
        </section>
      )}

      {vacancies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider">Vacancy Breakdown</h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-3">Post Name</th>
                  <th className="p-3 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vacancies.map((row, i) => (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-700">{row.post_name}</td>
                    <td className="p-3 text-right text-gray-900 font-bold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {post.how_to_apply && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-gray-800 mb-3 uppercase tracking-wider">How to Apply</h2>
          <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-4 rounded-lg border border-gray-200 shadow-sm leading-relaxed">
            {post.how_to_apply}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {post.official_link && (
          <a href={post.official_link} target="_blank" rel="noopener noreferrer"
             className="text-sm text-center font-bold tracking-wide bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3.5 shadow-sm transition-colors">
            Apply Online / Official Website
          </a>
        )}
        {post.notification_pdf_link && (
          <a href={post.notification_pdf_link} target="_blank" rel="noopener noreferrer"
             className="text-sm text-center font-semibold tracking-wide border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-lg py-3 text-gray-700 transition-all">
            Download Notification PDF
          </a>
        )}
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'JobPosting',
            title: post.title,
            description: post.eligibility || post.short_summary || post.title,
            datePosted: post.created_at,
            validThrough: dates.find((d) =>
              d.label.toLowerCase().includes('last date')
            )?.date || undefined,
            employmentType: 'FULL_TIME',
            hiringOrganization: { '@type': 'Organization', name: post.category?.toUpperCase() || 'Government of Madhya Pradesh' },
            jobLocation: {
              '@type': 'Place',
              address: { '@type': 'PostalAddress', addressRegion: 'Madhya Pradesh', addressCountry: 'IN' },
            },
          }),
        }}
      />
    </main>
  );
}