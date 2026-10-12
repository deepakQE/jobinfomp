export const metadata = { title: 'Disclaimer | Jobinfo MP', description: 'Important source and accuracy disclaimer for Jobinfo MP.' };
import styles from './page.module.css';

export default function DisclaimerPage() {
  return <main className={styles.page}><h1>Disclaimer</h1><p>Jobinfo MP is not an official government website and is not affiliated with any government department. Information is compiled from official sources for convenience and may contain delays or errors.</p><p>Always verify the eligibility, dates, fees, vacancy details, and application instructions on the official website before taking action.</p></main>;
}
