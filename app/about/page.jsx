export const metadata = { title: 'About us | Jobinfo MP' };
import styles from './page.module.css';

export default function About() {
  return (
    <main className={styles.page}>
      <h1>About Jobinfo MP</h1>
      <p>Jobinfo MP provides concise summaries of government job notifications, admit cards, results, and answer keys relevant to Madhya Pradesh job seekers.</p>
      <p>We are an independent information service, not a government body. Always verify the complete notification and application instructions on the official website.</p>
    </main>
  );
}