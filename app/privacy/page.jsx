export const metadata = { title: 'Privacy Policy | Jobinfo MP' };
import styles from './page.module.css';

export default function Privacy() {
  return (
    <main className={styles.page}>
      <h1>Privacy policy</h1>
      <p>Saved jobs are stored locally in your browser. The site does not need an account to browse published updates.</p>
      <p>Contact us before sending personal information. Third-party analytics or advertising services, if enabled, may use cookies under their own policies.</p>
    </main>
  );
}