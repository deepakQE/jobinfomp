import Link from 'next/link';

const categories = ['all', 'ssc', 'railway', 'mp-police', 'mpesb', 'mppsc'];

export default function CategoryTabs({ active = 'all', showLabel = true }) {
  return (
    <nav className="container-editorial mb-6" aria-label="Categories">
      <div className="flex items-center gap-3 pb-3 border-b hairline-border">
        {showLabel && (
          <span className="text-xs font-mono text-slate uppercase tracking-wider">Category:</span>
        )}
        <div className="flex gap-2 overflow-x-auto -mb-3 pb-3">
          {categories.map((cat) => {
            const href = cat === 'all' ? '/' : `/category/${cat}`;
            const isActive = cat === active;

            return (
              <Link
                key={cat}
                href={href}
                prefetch
                className={`underline-animated px-3 py-2 text-xs font-medium whitespace-nowrap rounded-card transition-colors ${
                  isActive
                    ? 'active text-primary bg-gold/10'
                    : 'text-slate hover:text-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {cat === 'all' ? 'All' : cat.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
