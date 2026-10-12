'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  async function submit(event) {
    event.preventDefault();
    setStatus('Sending...');
    const response = await fetch('/api/contact', { method: 'POST', body: new FormData(event.currentTarget) });
    const result = await response.json();
    setStatus(result.message || 'Unable to send your message.');
    if (response.ok) event.currentTarget.reset();
  }
  return <form onSubmit={submit} className={styles.form}><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" maxLength="80" required /><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" maxLength="160" required /><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" maxLength="2000" required /><div aria-hidden="true" className={styles.honeypot}><label htmlFor="contact-company">Company</label><input id="contact-company" name="company" tabIndex="-1" autoComplete="off" /></div><button type="submit">Send message</button>{status && <p role="status">{status}</p>}</form>;
}
