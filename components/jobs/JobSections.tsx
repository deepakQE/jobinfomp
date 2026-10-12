import Link from 'next/link';
import JobRow from '@/components/JobRow';
import type { JobPost } from '@/services/job-listing';
import styles from './JobSections.module.css';

type Section = { type: string; label: string; posts: JobPost[] };
type JobSectionsProps = { sections: Section[]; sectionClassName?: string };

export default function JobSections({ sections, sectionClassName = '' }: JobSectionsProps) {
  return <div className={`${styles.sections} ${sectionClassName}`}>{sections.map(({ type, label, posts }) => posts.length > 0 && <section key={type} className={styles.section}><div className={styles.heading}><h2>{label}</h2><Link href={type === 'archive' ? '/search?archive=1' : `/type/${type}`}>View all</Link></div><div>{posts.slice(0, 8).map((post) => <JobRow key={post.slug} post={post} />)}</div></section>)}</div>;
}
