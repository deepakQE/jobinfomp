import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryTabs from '@/components/CategoryTabs';
import JobSections from '@/components/jobs/JobSections';
import Container from '@/components/ui/Container';
import { supabase } from '@/lib/supabase';
import { getJobSections, JOB_POST_COLUMNS } from '@/services/job-listing';
import styles from './page.module.css';

export const revalidate = 60;

export async function generateMetadata({ params }) { const { category } = await params; return { title: `${category.toUpperCase()} government jobs | Jobinfo MP`, description: `Latest published government job updates for ${category.toUpperCase()}.`, alternates: { canonical: `/category/${category}` } }; }

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const activeCategory = category?.toLowerCase();
  const { data: posts, error } = await supabase.from('job_posts').select(JOB_POST_COLUMNS).eq('is_published', true).eq('category', activeCategory).order('created_at', { ascending: false }).limit(100);
  const sections = getJobSections(posts || []);
  return <><Header /><main id="main-content"><Container className={styles.page}><CategoryTabs active={activeCategory} showLabel={false} /><h1>{activeCategory.toUpperCase()} updates</h1><p className={styles.intro}>Latest published jobs, admit cards, results, and answer keys for {activeCategory.toUpperCase()}.</p>{error && <p role="alert" className={styles.error}>Updates are temporarily unavailable.</p>}{!error && sections.every((section) => section.posts.length === 0) && <div className={styles.empty}><h2>No updates found</h2><p>No published updates are available for this category.</p></div>}<JobSections sections={sections} sectionClassName={styles.sections} /></Container></main><Footer /></>;
}
