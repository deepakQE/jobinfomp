import Link from 'next/link';
import styles from './boundary.module.css';

export default function NotFound() { return <main className={styles.page}><p>404</p><h1>This page is not available.</h1><span>The update may have moved or the link may be incorrect.</span><Link href="/">Back to latest jobs</Link></main>; }
