import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatDate, formatOrganization, formatVacancies, getDeadline, getStatus } from '@/lib/format';
import styles from './JobRow.module.css';

export default function JobRow({ post }) {
  const status = getStatus(post);
  const meta = [
    formatOrganization(post.category),
    formatVacancies(post.total_vacancy),
    formatDate(post.created_at) ? `Posted ${formatDate(post.created_at)}` : null,
    formatDate(getDeadline(post)) ? `Last date ${formatDate(getDeadline(post))}` : null,
  ].filter(Boolean);

  return <Link href={`/job/${post.slug}`} className={styles.row} aria-label={post.title}>
    <div className={styles.titleLine}><h3>{post.title}</h3><Badge tone={status.tone}>{status.label}</Badge></div>
    <div className={styles.metaLine}>{meta.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
    <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} className={styles.arrow} />
  </Link>;
}
