'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Container from '@/components/ui/Container';
import styles from './Header.module.css';

const navigation = [
  { label: 'Latest Jobs', href: '/' },
  { label: 'Admit Card', href: '/type/admit-card' },
  { label: 'Results', href: '/type/result' },
  { label: 'Answer Key', href: '/type/answer-key' },
];

export default function Header({ showSearch = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={styles.header}>
      <Container className={styles.headerInner}>
        <Link href="/" className={styles.logo} aria-label="Jobinfo MP home">Jobinfo MP</Link>
        <nav className={styles.desktopNav} aria-label="Primary navigation">{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <form action="/search" method="get" className={`${styles.headerSearch} ${!showSearch ? styles.homeSearchHidden : ''}`} role="search">
          <label className="sr-only" htmlFor="header-search">Search jobs</label>
          <Search size={17} strokeWidth={1.5} aria-hidden="true" />
          <input id="header-search" type="search" name="q" placeholder="Search jobs" />
        </form>
        <Link href="/search" className={`${styles.iconButton} ${styles.mobileSearchButton}`} aria-label="Open search" title="Search"><Search size={18} strokeWidth={1.5} /></Link>
        <button type="button" className={styles.iconButton} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle theme">{resolvedTheme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}</button>
        <button type="button" className={`${styles.iconButton} ${styles.menuButton}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}</button>
      </Container>
      {menuOpen && <div id="mobile-navigation" className={styles.drawer}><Container>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}<Link href="/saved" onClick={() => setMenuOpen(false)}>Saved Jobs</Link><Link href="/about" onClick={() => setMenuOpen(false)}>About</Link></nav>
      </Container></div>}
    </header>
  </>;
}
