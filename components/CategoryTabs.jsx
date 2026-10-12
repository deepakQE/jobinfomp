import Link from 'next/link';
import Container from '@/components/ui/Container';
import styles from './CategoryTabs.module.css';

const categories = ['all', 'ssc', 'railway', 'mp-police', 'mpesb', 'mppsc'];

export default function CategoryTabs({ active = 'all', showLabel = true }) {
  return <Container className={styles.wrapper}><div className={styles.chips}>{showLabel && <span className={styles.label}>Browse by category</span>}<div className={styles.scroll}>{categories.map((category) => { const href = category === 'all' ? '/' : `/category/${category}`; const isActive = category === active; return <Link key={category} href={href} className={`${styles.chip} ${isActive ? styles.active : ''}`} aria-current={isActive ? 'page' : undefined}>{category === 'all' ? 'All' : category.toUpperCase()}</Link>; })}</div></div></Container>;
}
