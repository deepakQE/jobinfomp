import Container from '@/components/ui/Container';
import Skeleton from '@/components/ui/Skeleton';
import styles from './loading.module.css';

export default function Loading() { return <main className={styles.page}><Container><Skeleton className={styles.heading} /><Skeleton className={styles.search} /><div className={styles.rows}>{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className={styles.row} />)}</div></Container></main>; }
