import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import { cache } from 'react';

// FORCE INSTANT LIVE FETCHING - NO STATIC CACHING
export const dynamic = 'force-dynamic';

const getJobPost = cache(async (slug) => {
  return supabase
    .from('job_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: post } = await getJobPost(slug);

  if (!post) return { title: 'Job not found | Jobinfo MP' };

  return {
    title: `${post.title} | Jobinfo MP`,
    description: post.short_summary || 'Latest MP government job notification, eligibility, vacancy, and apply online details.',
    alternates: { canonical: `https://jobinfomp.netlify.app/job/${slug}` },
  };
}

export default async function JobPage({ params }) {
  const { slug } = await params;
  const { data: post } = await getJobPost(slug);

  if (!post) return notFound();

  // Robust JSON parser that handles both raw arrays and stringified JSON
  const parseJson = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try { return JSON.parse(field); } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  const dates = parseJson(post.important_dates);
  const fees = parseJson(post.application_fee);
  const vacancies = parseJson(post.vacancy_details);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-primary mb-3 leading-tight">{post.title}</h1>
        {post.short_summary && (
          <p className="text-sm text-slate bg-notice p-4 rounded-lg border border-notice-border leading-relaxed">
            {post.short_summary}
          </p>
        )}
      </div>

      {dates.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
             <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
             Important Dates
          </h2>
          <div className="overflow-hidden border hairline-border rounded-lg">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-hairline">
                {dates.map((row, i) => (
                  <tr key={i} className="bg-card-bg hover:bg-card-hover transition-colors">
                    <td className="p-3 text-slate">{row.label}</td>
                    <td className="p-3 text-right text-primary font-semibold">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {fees.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
             <span className="w-2 h-2 bg-green-600 rounded-full"></span>
             Application Fee
          </h2>
          <div className="overflow-hidden border hairline-border rounded-lg">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-hairline">
                {fees.map((row, i) => (
                  <tr key={i} className="bg-card-bg hover:bg-card-hover transition-colors">
                    <td className="p-3 text-slate">{row.category}</td>
                    <td className="p-3 text-right text-primary font-semibold">{row.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {post.eligibility && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-primary mb-3 uppercase tracking-wider">Eligibility</h2>
          <div className="text-sm text-slate whitespace-pre-line bg-card-bg p-4 rounded-lg border hairline-border leading-relaxed">
            {post.eligibility}
          </div>
        </section>
      )}

      {vacancies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-primary mb-3 uppercase tracking-wider">Vacancy Breakdown</h2>
          <div className="overflow-hidden border hairline-border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-card-hover border-b hairline-border text-slate font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-3">Post Name</th>
                  <th className="p-3 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {vacancies.map((row, i) => (
                  <tr key={i} className="bg-card-bg hover:bg-card-hover transition-colors">
                    <td className="p-3 text-slate">{row.post_name}</td>
                    <td className="p-3 text-right text-primary font-bold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {post.how_to_apply && (
        <section className="mb-8">
          <h2 className="text-sm font-extrabold text-primary mb-3 uppercase tracking-wider">How to Apply</h2>
          <div className="text-sm text-slate whitespace-pre-line bg-card-bg p-4 rounded-lg border hairline-border leading-relaxed">
            {post.how_to_apply}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {post.official_link && (
          <a href={post.official_link} target="_blank" rel="noopener noreferrer"
             className="text-sm text-center font-bold tracking-wide bg-action hover:bg-action-hover text-action-contrast rounded-lg py-3.5 transition-colors">
            Apply Online / Official Website
          </a>
        )}
        {post.notification_pdf_link && (
          <a href={post.notification_pdf_link} target="_blank" rel="noopener noreferrer"
             className="text-sm text-center font-semibold tracking-wide border-2 border-hairline bg-card-bg hover:bg-card-hover rounded-lg py-3 text-primary transition-all">
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
    </>
  );
}