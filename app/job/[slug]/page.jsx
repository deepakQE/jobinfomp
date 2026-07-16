import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';

export const revalidate = 300;

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
    alternates: { canonical: `https://jobinfomp.in/job/${slug}` },
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

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />
      <h1 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h1>
      {post.short_summary && <p className="text-sm text-gray-700 mb-4">{post.short_summary}</p>}

      {post.important_dates && (
        <section className="mb-4">
          <h2 className="text-sm font-medium mb-1">Important dates</h2>
          <table className="w-full text-xs border border-gray-200">
            <tbody>
              {post.important_dates.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="p-2 text-gray-600">{row.label}</td>
                  <td className="p-2 text-right font-medium text-gray-900">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {post.application_fee && (
        <section className="mb-4">
          <h2 className="text-sm font-medium mb-1">Application fee</h2>
          <table className="w-full text-xs border border-gray-200">
            <tbody>
              {post.application_fee.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="p-2 text-gray-600">{row.category}</td>
                  <td className="p-2 text-right font-medium text-gray-900">{row.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {post.eligibility && (
        <section className="mb-4">
          <h2 className="text-sm font-medium mb-1">Eligibility</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{post.eligibility}</p>
        </section>
      )}

      {post.vacancy_details && (
        <section className="mb-4">
          <h2 className="text-sm font-medium mb-1">Vacancy breakdown</h2>
          <table className="w-full text-xs border border-gray-200">
            <tbody>
              {post.vacancy_details.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="p-2 text-gray-600">{row.post_name}</td>
                  <td className="p-2 text-right font-medium text-gray-900">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {post.how_to_apply && (
        <section className="mb-4">
          <h2 className="text-sm font-medium mb-1">How to apply</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{post.how_to_apply}</p>
        </section>
      )}

      <div className="flex flex-col gap-2 mb-4">
        {post.official_link && (
          <a href={post.official_link} target="_blank" rel="noopener noreferrer"
             className="text-sm text-center bg-blue-600 text-white rounded py-2">
            Apply online / official website
          </a>
        )}
        {post.notification_pdf_link && (
          <a href={post.notification_pdf_link} target="_blank" rel="noopener noreferrer"
             className="text-sm text-center border border-gray-300 rounded py-2 text-gray-700">
            Download notification PDF
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
            description: post.eligibility || post.short_summary,
            datePosted: post.created_at,
            validThrough: post.important_dates?.find((d) =>
              d.label.toLowerCase().includes('last date')
            )?.date,
            employmentType: 'FULL_TIME',
            hiringOrganization: { '@type': 'Organization', name: post.category?.toUpperCase() },
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