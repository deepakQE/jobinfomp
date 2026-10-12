'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobRow from '@/components/JobRow';
import Container from '@/components/ui/Container';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function SavedJobsPage() {
  const [posts, setPosts] = useState([]); const [ready, setReady] = useState(false);
  useEffect(() => { const slugs = JSON.parse(window.localStorage.getItem('jobinfo-saved-jobs') || '[]'); if (slugs.length === 0) { queueMicrotask(() => setReady(true)); return; } supabase.from('job_posts').select('*').in('slug', slugs).eq('is_published', true).then(({ data }) => { setPosts(data || []); setReady(true); }); }, []);
  return <><Header /><main id="main-content"><Container className={styles.page}><h1>Saved jobs</h1><p className={styles.intro}>Jobs saved on this device.</p>{ready && posts.length === 0 && <div className={styles.empty}><h2>No saved jobs yet</h2><p>Open a job and select Save job to keep it here.</p><Link href="/">Browse latest jobs</Link></div>}{posts.length > 0 && <div className={styles.rows}>{posts.map((post) => <JobRow key={post.slug} post={post} />)}</div>}</Container></main><Footer /></>;
}
