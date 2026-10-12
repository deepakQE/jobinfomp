'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Heart, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './JobActions.module.css';

export default function JobActions({ slug, title }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { const savedJobs = JSON.parse(window.localStorage.getItem('jobinfo-saved-jobs') || '[]'); queueMicrotask(() => setSaved(savedJobs.includes(slug))); }, [slug]);
  function toggleSaved() { const savedJobs = JSON.parse(window.localStorage.getItem('jobinfo-saved-jobs') || '[]'); const next = saved ? savedJobs.filter((item) => item !== slug) : [...savedJobs, slug]; window.localStorage.setItem('jobinfo-saved-jobs', JSON.stringify(next)); setSaved(!saved); }
  async function copyLink() { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  async function share() { if (navigator.share) await navigator.share({ title, url: window.location.href }); else await copyLink(); }
  return <div className={styles.actions}><Button variant="secondary" type="button" onClick={toggleSaved}><Heart size={17} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save job'}</Button><Button variant="secondary" type="button" onClick={share}><Share2 size={17} strokeWidth={1.5} />Share</Button><Button variant="secondary" type="button" onClick={copyLink}>{copied ? <Check size={17} strokeWidth={1.5} /> : <Copy size={17} strokeWidth={1.5} />}{copied ? 'Copied' : 'Copy link'}</Button></div>;
}
