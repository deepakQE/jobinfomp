import Link from 'next/link';

const categories = ['all', 'ssc', 'railway', 'mp-police', 'mpesb', 'mppsc'];

export default function CategoryTabs({ active = 'all', showLabel = true }) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1" aria-label="Job categories">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={cat === 'all' ? '/' : `/category/${cat}`}
          className={`text-sm px-4 py-2 rounded-full whitespace-nowrap border font-medium transition-colors ${
            cat === active
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
              : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          {cat === 'all' ? 'All' : cat.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
