const categories = ['all', 'ssc', 'railway', 'mp-police', 'mpesb', 'mppsc'];
export default function CategoryTabs({ active = 'all' }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
      {categories.map((cat) => (
        <a
          key={cat}
          href={cat === 'all' ? '/' : `/category/${cat}`}
          className={`text-xs px-3 py-1 rounded whitespace-nowrap border ${
            cat === active
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          {cat === 'all' ? 'All' : cat.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
