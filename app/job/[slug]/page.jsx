import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { cache } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobActions from '@/components/jobs/JobActions';
import JobRow from '@/components/JobRow';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { cleanText, formatDate, formatOrganization, formatVacancies, getDeadline, getPostTypeLabel, getStatus, parseJsonArray } from '@/lib/format';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
const getJobPost = cache(async (slug) => supabase.from('job_posts').select('*').eq('slug', slug).eq('is_published', true).single());
export async function generateMetadata({ params }) { const { slug } = await params; const { data: post } = await getJobPost(slug); if (!post) return { title: 'Job not found | Jobinfo MP' }; return { title: `${post.title} | Jobinfo MP`, description: post.short_summary || `Details for ${post.title}.`, alternates: { canonical: `/job/${slug}` } }; }
function DetailTable({ rows }) { return rows.length > 0 ? <dl className={styles.table}>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null; }
export default async function JobPage({ params }) {
  const { slug } = await params; const { data: post } = await getJobPost(slug); if (!post) return notFound(); const dates = parseJsonArray(post.important_dates).filter((item) => cleanText(item?.date) && cleanText(item?.label)); const fees = parseJsonArray(post.application_fee).filter((item) => cleanText(item?.fee) && cleanText(item?.category)); const vacancies = parseJsonArray(post.vacancy_details).filter((item) => cleanText(item?.post_name) && item?.count !== null && item?.count !== undefined); const status = getStatus(post);
  const nonce = (await headers()).get('x-nonce') || undefined;
  const facts = [['Organization', formatOrganization(post.category)], ['Vacancies', formatVacancies(post.total_vacancy)], ['Posted', formatDate(post.created_at)], ['Last date', formatDate(getDeadline(post))], ['Age limit', cleanText(post.age_limit)], ['Qualification', cleanText(post.qualification)], ['Application fee', cleanText(post.application_fee_text)]].filter(([, value]) => value);
  const { data: related } = await supabase.from('job_posts').select('*').eq('is_published', true).eq('category', post.category).neq('slug', post.slug).order('created_at', { ascending: false }).limit(4);
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, datePublished: post.created_at, dateModified: post.updated_at || post.created_at, description: post.short_summary || post.title }).replace(/</g, '\\u003c');
  return <><Header /><main id="main-content"><Container className={styles.page}><nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href={`/category/${encodeURIComponent(String(post.category || '').toLowerCase())}`}>{formatOrganization(post.category) || 'Updates'}</Link><span>/</span><span>Details</span></nav><div className={styles.layout}><article><div className={styles.typeLine}><Badge tone={status.tone}>{status.label}</Badge><span>{getPostTypeLabel(post.post_type)}</span></div><h1>{post.title}</h1>{post.short_summary && <p className={styles.summary}>{post.short_summary}</p>}<div className={styles.actions}><JobActions slug={post.slug} title={post.title} /></div><section><h2>Key facts</h2><DetailTable rows={facts} /></section>{dates.length > 0 && <section><h2>Important dates</h2><DetailTable rows={dates.map((item) => [item.label, item.date])} /></section>}{vacancies.length > 0 && <section><h2>Vacancy breakdown</h2><DetailTable rows={vacancies.map((item) => [item.post_name, String(item.count)])} /></section>}{fees.length > 0 && <section><h2>Application fee</h2><DetailTable rows={fees.map((item) => [item.category, item.fee])} /></section>}<section><h2>Eligibility</h2><p className={styles.copy}>{cleanText(post.eligibility) || 'Read the official notification for eligibility requirements.'}</p>{!cleanText(post.eligibility) && post.notification_pdf_link && <a href={post.notification_pdf_link} target="_blank" rel="noreferrer"><Button>Read official notification</Button></a>}</section>{cleanText(post.how_to_apply) && <section><h2>How to apply</h2><p className={styles.copy}>{post.how_to_apply}</p></section>}<p className={styles.updated}>Last updated {formatDate(post.updated_at || post.created_at)}. Source: official notification linked above.</p></article><aside className={styles.aside}><h2>Official links</h2>{post.official_link && <a href={post.official_link} target="_blank" rel="noreferrer"><Button>Official website</Button></a>}{post.notification_pdf_link && <a href={post.notification_pdf_link} target="_blank" rel="noreferrer"><Button variant="secondary">Notification PDF</Button></a>}</aside></div>{related?.length > 0 && <section className={styles.related}><h2>Related updates</h2>{related.map((item) => <JobRow key={item.slug} post={item} />)}</section>}</Container></main><Footer /><script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /></>;
}
