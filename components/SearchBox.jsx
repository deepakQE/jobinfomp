'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import styles from './SearchBox.module.css';

export default function SearchBox({ defaultValue = '' }) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => fetch(`/api/search-suggestions?q=${encodeURIComponent(value)}`, { signal: controller.signal }).then((response) => response.json()).then(setSuggestions).catch(() => {}), 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);
  const visibleSuggestions = query.trim().length >= 2 ? suggestions : [];
  return <form className={styles.form} role="search" action="/search"><label className="sr-only" htmlFor="search-box-input">Search jobs</label><div className={styles.inputWrap}><Search size={18} aria-hidden="true" /><input id="search-box-input" name="q" value={query} onChange={(event) => setQuery(event.target.value)} minLength="2" maxLength="80" placeholder="Post, organization, or category" autoComplete="off" />{visibleSuggestions.length > 0 && <ul className={styles.suggestions}>{visibleSuggestions.map((item) => <li key={item.slug}><Link href={`/job/${item.slug}`} onClick={() => setSuggestions([])}><strong>{item.title}</strong><span>{item.category}</span></Link></li>)}</ul>}</div><Button type="submit">Search</Button></form>;
}