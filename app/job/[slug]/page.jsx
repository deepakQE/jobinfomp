import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export const revalidate = 60;

const getJobPost = cache(async (slug) => {
  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getJobPost(slug);

  if (!post) {
    return {
      title: 'Job not found | Jobinfo MP',
      description: 'The requested job update could not be found.',
    };
  }

  const keywords = [
    post.title,
    post.category,
    post.department_name,
    post.post_type,
    'MP job update',
    'government vacancy',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title: `${post.title} | Jobinfo MP`,
    description: post.short_summary || post.title,
    keywords,
  };
}

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value || '';
}

function DetailsList({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-md bg-white/80 px-3 py-3 border border-blue-100 shadow-sm">
            {item && typeof item === 'object' && !Array.isArray(item) ? (
              <div className="space-y-1">
                {item.label && <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">{item.label}</p>}
                {item.date && <p className="font-medium text-gray-900">{item.date}</p>}
                {item.fee && item.category && (
                  <>
                    <p className="font-medium text-gray-900">{item.fee}</p>
                    <p className="text-gray-600">{item.category}</p>
                  </>
                )}
                {item.post_name && <p className="font-medium text-gray-900">{item.post_name}</p>}
                {item.count && <p className="text-gray-600">Posts: {item.count}</p>}
              </div>
            ) : (
              <p>{typeof item === 'string' ? item : formatValue(item)}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function JobDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const backTo = typeof resolvedSearchParams?.back === 'string' ? resolvedSearchParams.back : '/';
  const post = await getJobPost(slug);

  if (!post) notFound();

  const importantDates = parseJson(post.important_dates);
  const applicationFees = parseJson(post.application_fee);
  const vacancyDetails = parseJson(post.vacancy_details);
  const eligibility = parseJson(post.eligibility);
  const howToApply = parseJson(post.how_to_apply);
  const relatedLabel = ['result', 'answer-key', 'admit-card'].includes(post.post_type)
    ? 'Related updates'
    : 'Related links';

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <Header />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href={backTo} className="text-xs font-semibold text-blue-700 hover:text-blue-800">
          ← Back
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {post.category}
        </span>
      </div>

      <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 mb-2">
          {post.post_type}
        </p>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
          {post.status && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
              Status: {post.status}
            </span>
          )}
          {post.application_deadline && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
              Deadline: {post.application_deadline}
            </span>
          )}
        </div>

        {post.short_summary && (
          <p className="mt-3 text-sm leading-6 text-gray-700">{post.short_summary}</p>
        )}

        <DetailsList title="Important dates" items={importantDates} />

        {Array.isArray(applicationFees) && applicationFees.length > 0 && (
          <DetailsList title="Application fee" items={applicationFees} />
        )}

        {eligibility && (
          <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Eligibility</h2>
            <p className="mt-3 text-sm leading-6 text-gray-700">{formatValue(eligibility)}</p>
          </section>
        )}

        {Array.isArray(vacancyDetails) && vacancyDetails.length > 0 && (
          <DetailsList title="Vacancy details" items={vacancyDetails} />
        )}

        {howToApply && (
          <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">How to apply</h2>
            <p className="mt-3 text-sm leading-6 text-gray-700">{formatValue(howToApply)}</p>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Official links</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {post.official_link && (
              <a href={post.official_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                Official website
              </a>
            )}
            {post.notification_pdf_link && (
              <a href={post.notification_pdf_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                Notification PDF
              </a>
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{relatedLabel}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href={`/category/${encodeURIComponent(post.category)}`} className="text-blue-700 hover:text-blue-800">
              View category updates
            </Link>
            <Link href="/contact" className="text-blue-700 hover:text-blue-800">
              Contact us
            </Link>
          </div>
        </section>
      </article>

      <Footer />
    </main>
  );
}