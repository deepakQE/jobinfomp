import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobRow from '@/components/JobRow';
import Container from '@/components/ui/Container';
import { supabase } from '@/lib/supabase';
import { getPostTypeLabel } from '@/lib/format';
import styles from './page.module.css';

const PAGE_SIZE = 12;
export async function generateMetadata({ params }) { const { type } = await params; return { title: `${getPostTypeLabel(type)} | Jobinfo MP`, description: `Published ${getPostTypeLabel(type).toLowerCase()} from official sources.`, alternates: { canonical: `/type/${type}` } }; }
export default async function TypePage({ params, searchParams }) {
  const { type } = await params; const query = await searchParams; const page = Math.max(1, Number.parseInt(query?.page || '1', 10) || 1); const category = String(query?.category || '').trim(); const from = (page - 1) * PAGE_SIZE;
  let request = supabase.from('job_posts').select('*', { count: 'exact' }).eq('is_published', true).eq('post_type', type).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1); if (category) request = request.eq('category', category); const { data: posts, count, error } = await request; const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)); const label = getPostTypeLabel(type);
  return <><Header /><main id="main-content"><Container className={styles.page}><Link href="/" className={styles.back}>Home</Link><h1>{label}</h1><div className={styles.toolbar}><p>{count || 0} published updates</p><form><label className="sr-only" htmlFor="type-category">Filter by category</label><input id="type-category" name="category" defaultValue={category} placeholder="Filter category" /></form></div>{error && <p role="alert" className={styles.error}>Updates are temporarily unavailable.</p>}{!error && posts?.length === 0 && <div className={styles.empty}><h2>No updates found</h2><p>Try another category or return to the latest jobs.</p></div>}<div>{posts?.map((post) => <JobRow key={post.slug} post={post} />)}</div>{totalPages > 1 && <nav className={styles.pagination} aria-label="Listing pagination"><span>Page {page} of {totalPages}</span><div>{page > 1 && <Link href={`/type/${type}?page=${page - 1}`}>Previous</Link>}{page < totalPages && <Link href={`/type/${type}?page=${page + 1}`}>Next</Link>}</div></nav>}</Container></main><Footer /></>;
}
