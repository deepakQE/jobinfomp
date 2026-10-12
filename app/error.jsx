'use client';

import styles from './boundary.module.css';

export default function Error({ reset }) { return <main className={styles.page}><p>Something went wrong</p><h1>The page could not load.</h1><button type="button" onClick={() => reset()}>Try again</button></main>; }
