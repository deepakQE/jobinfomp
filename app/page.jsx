import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryTabs from '@/components/CategoryTabs';
import JobSections from '@/components/jobs/JobSections';
import Container from '@/components/ui/Container';
import SearchBox from '@/components/SearchBox';
import { getJobSections } from '@/services/job-listing';
import styles from './page.module.css';

export const revalidate = 60;

export default async function Home() {
  const { data: allPosts, error } = await supabase.from('job_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(100);
  const currentISTDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const sections = getJobSections(allPosts || [], { filterExpiredLatestJobs: true, currentDate: currentISTDateStr });
  const categories = [...new Set((allPosts || []).map((post) => post.category).filter(Boolean))].slice(0, 8);
  return <><Header showSearch={false} /><main id="main-content" className={styles.main}><Container className={styles.hero}><h1>Government jobs, clearly listed.</h1><SearchBox /><CategoryTabs active="all" showLabel /></Container><Container className={styles.content}>{error && <p role="alert" className={styles.error}>Jobs are temporarily unavailable. Please refresh and try again.</p>}{!error && sections.every((section) => section.posts.length === 0) && <div className={styles.empty}><h2>No jobs yet</h2><p>New published updates will appear here when they are available.</p></div>}<JobSections sections={sections} />{categories.length > 0 && <section className={styles.categorySection}><div className={styles.sectionHeading}><h2>Browse by Category</h2></div><div className={styles.categoryGrid}>{categories.map((category) => <a key={category} href={`/category/${encodeURIComponent(category.toLowerCase())}`}>{category}</a>)}</div></section>}</Container></main><Footer /></>;
}
