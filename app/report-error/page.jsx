import Link from 'next/link';
import styles from './page.module.css';

export const metadata = { title: 'Report an error | Jobinfo MP', description: 'Report an incorrect or outdated Jobinfo MP listing.' };

export default function ReportErrorPage() {
  return <main className={styles.page}><h1>Report an error</h1><p>Found an incorrect date, link, title, or vacancy count? Send the job URL and the correction to the contact address.</p><a className={styles.button} href="mailto:contact@jobinfomp.in">Email a correction</a><p className={styles.note}><Link href="/contact">Open the contact page</Link></p></main>;
}
