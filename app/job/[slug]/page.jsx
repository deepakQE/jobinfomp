import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import SimilarJobs from '@/components/SimilarJobs';
import StickyTelegramButton from '@/components/StickyTelegramButton';

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

  const title = post.meta_title || `${post.title} | Jobinfo MP`;
  const description = post.meta_description || post.short_summary || `Check latest details, apply online link, and eligibility for ${post.title} on Jobinfo MP.`;
  
  const keywords = [
    post.title,
    post.category,
    post.department_name,
    post.post_type,
    'MP job update',
    'government vacancy',
    'sarkari naukri',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
    },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: post.title,
    description: post.short_summary,
    datePosted: post.created_at,
    validThrough: post.application_deadline || '2026-12-31',
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: post.category.toUpperCase(),
      url: post.official_link,
    },
    applicantLocationRequirements: { '@type': 'Country', name: 'IN' },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressRegion: 'Madhya Pradesh', addressCountry: 'IN' },
    },
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
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

        {/* Verified Trust Signal Badge */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified from {post.category === 'mpesb' ? 'esb.mp.gov.in' : post.category === 'mppsc' ? 'mppsc.mp.gov.in' : 'Official Source'}
        </div>

        {/* 🌟 NEW: KEY HIGHLIGHTS GRID 🌟 */}
        {(post.total_vacancy || post.age_limit || post.application_fee_text || post.qualification) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {post.total_vacancy && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Vacancy</p>
                <p className="text-sm font-semibold text-gray-900">{post.total_vacancy}</p>
              </div>
            )}
            {post.age_limit && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Age Limit</p>
                <p className="text-sm font-semibold text-gray-900">{post.age_limit}</p>
              </div>
            )}
            {post.application_fee_text && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-700">Application Fee</p>
                <p className="text-sm font-semibold text-gray-900">{post.application_fee_text}</p>
              </div>
            )}
            {post.qualification && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Qualification</p>
                <p className="text-sm font-semibold text-gray-900">{post.qualification}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
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
              <a href={post.official_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 font-medium">
                Official website →
              </a>
            )}
            {post.notification_pdf_link && (
              <a href={post.notification_pdf_link} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-medium">
                📄 Download PDF Notification →
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

      <SimilarJobs currentCategory={post.category} currentSlug={post.slug} />
      <StickyTelegramButton />

      <Footer />
    </main>
  );
}