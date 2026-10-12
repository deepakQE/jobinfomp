import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobRow from '@/components/JobRow';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import SearchBox from '@/components/SearchBox';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const PAGE_SIZE = 12;
function normalizeQuery(value) { return String(value || '').trim().slice(0, 80); }
function escapeSearch(value) { return value.replace(/[%,_]/g, (character) => `\\${character}`); }
export const metadata = { title: 'Search government jobs | Jobinfo MP', description: 'Search published government jobs, admit cards, results, and answer keys.', alternates: { canonical: '/search' } };

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = normalizeQuery(params?.q);
  const type = String(params?.type || '').trim();
  const category = String(params?.category || '').trim();
  const sort = params?.sort === 'oldest' ? 'oldest' : 'newest';
  const page = Math.max(1, Number.parseInt(params?.page || '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  let request = supabase.from('job_posts').select('*', { count: 'exact' }).eq('is_published', true).order('created_at', { ascending: sort === 'oldest' }).range(from, from + PAGE_SIZE - 1);
  if (query.length >= 2) { const term = escapeSearch(query); request = request.or(`title.ilike.%${term}%,short_summary.ilike.%${term}%,category.ilike.%${term}%`); }
  if (type) request = request.eq('post_type', type);
  if (category) request = request.eq('category', category);
  const { data: posts, count, error } = await request;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
  return <><Header /><main id="main-content"><Container className={styles.page}><p className={styles.eyebrow}>Search</p><h1>Find a government job update</h1><SearchBox defaultValue={query} /><details><summary>Filters and sort</summary><form className={styles.toolbar}><label>Type<select name="type" defaultValue={type}><option value="">All types</option><option value="latest-job">Jobs</option><option value="admit-card">Admit cards</option><option value="result">Results</option><option value="answer-key">Answer keys</option></select></label><label>Category<input name="category" defaultValue={category} placeholder="e.g. mppsc" /></label><label>Sort<select name="sort" defaultValue={sort}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label><input type="hidden" name="q" value={query} /><Button type="submit">Apply filters</Button></form></details><div className={styles.resultHeading}><div><h2>{query.length >= 2 ? `Results for “${query}”` : 'Latest updates'}</h2><p>{count || 0} published updates</p></div><div className={styles.quickFilters}><Link href="/search?type=latest-job">Jobs</Link><Link href="/search?type=admit-card">Admit cards</Link><Link href="/search?type=result">Results</Link></div></div>{error && <p role="alert" className={styles.error}>Search is temporarily unavailable. Please try again.</p>}{!error && posts?.length === 0 && <div className={styles.empty}><h3>No matching updates</h3><p>Try a broader post title, organization, or category.</p></div>}<div>{posts?.map((post) => <JobRow key={post.slug} post={post} />)}</div>{totalPages > 1 && <nav className={styles.pagination} aria-label="Search pagination"><span>Page {page} of {totalPages}</span><div>{page > 1 && <Link href={`/search?q=${encodeURIComponent(query)}&type=${type}&category=${encodeURIComponent(category)}&sort=${sort}&page=${page - 1}`}>Previous</Link>}{page < totalPages && <Link href={`/search?q=${encodeURIComponent(query)}&type=${type}&category=${encodeURIComponent(category)}&sort=${sort}&page=${page + 1}`}>Next</Link>}</div></nav>}</Container></main><Footer /></>;
}
