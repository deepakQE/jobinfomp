// components/JobCard.jsx
import Link from 'next/link';

export default function JobCard({ post }) {
  // Map internal DB string identifiers to clean UI presentation classes
  const badgeColor = {
    notification: 'bg-red-50 text-red-700 border-red-200',
    upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
    'admit-card': 'bg-green-50 text-green-700 border-green-200',
    result: 'bg-blue-50 text-blue-700 border-blue-200',
    'answer-key': 'bg-purple-50 text-purple-700 border-purple-200',
  }[post.post_type] || 'bg-gray-50 text-gray-700 border-gray-200';

  // Translate database backend tokens into optimized student-facing labels
  const badgeLabel = {
    notification: 'New Job',
    upcoming: 'Expected',
    'admit-card': 'Admit Card',
    result: 'Result',
    'answer-key': 'Answer Key',
  }[post.post_type] || post.post_type;

  return (
    <Link href={`/job/${post.slug}`} className="block p-3 hover:bg-gray-50 transition duration-150 ease-in-out group">
      <div className="flex justify-between gap-3 items-start">
        <p className="text-sm font-semibold leading-snug text-gray-900 group-hover:text-blue-600 transition-colors">
          {post.title}
        </p>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${badgeColor}`}>
          {badgeLabel}
        </span>
      </div>
      {post.short_summary && (
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {post.short_summary}
        </p>
      )}
    </Link>
  );
}