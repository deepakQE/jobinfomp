'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky-header mb-6">
      {/* Main Header Bar */}
      <div className="container-editorial py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex flex-col">
            <h1 className="headline-sm text-primary">Jobinfo MP</h1>
            <p className="text-xs text-slate font-mono tracking-wide">Official Gazette</p>
          </div>
        </Link>

        {/* Search Bar - Center/Right */}
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-sm border hairline-border rounded-card bg-card-bg placeholder-slate focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-0 transition-all"
          />
        </div>
      </div>

    </header>
  );
}
