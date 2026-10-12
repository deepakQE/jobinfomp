import ContactForm from '@/components/ContactForm';
import styles from './page.module.css';

export const metadata = { title: 'Contact us | Jobinfo MP', description: 'Contact Jobinfo MP about corrections, feedback, or questions.' };

export default function Contact() {
  return (
    <main className={styles.page}>
      <h1>Contact us</h1>
      <p>For corrections, feedback, or queries, send a message below or email <a href="mailto:contact@jobinfomp.in">contact@jobinfomp.in</a>.</p>
      <ContactForm />
    </main>
  );
}