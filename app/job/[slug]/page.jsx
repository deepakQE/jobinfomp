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

export default async function JobDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const backTo = typeof resolvedSearchParams?.back === 'string' ? resolvedSearchParams.back : '/';
  const post = await getJobPost(slug);

  if (!post) notFound();

  const importantDates = parseJson(post.important_dates);
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

        {post.short_summary && (
          <p className="mt-3 text-sm leading-6 text-gray-700">{post.short_summary}</p>
        )}

        {importantDates && (
          <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Important dates</h2>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{JSON.stringify(importantDates, null, 2)}</pre>
          </section>
        )}

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