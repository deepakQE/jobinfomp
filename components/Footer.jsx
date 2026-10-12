import Container from '@/components/ui/Container';
import styles from './Footer.module.css';

export default function Footer() {
  return <footer className={styles.footer}><Container className={styles.grid}><div><p className={styles.name}>Jobinfo MP</p><p className={styles.copy}>Independent summaries of government job notifications. Always verify dates and eligibility on the official website before applying.</p></div><nav aria-label="Footer links" className={styles.links}><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav><nav aria-label="Legal links" className={styles.links}><a href="/terms">Terms</a><a href="/disclaimer">Disclaimer</a><a href="/report-error">Report an error</a></nav></Container><div className={styles.copyright}><Container>© 2026 Jobinfo MP</Container></div></footer>;
}
