export default function JobCard({ post }) {
  const badgeColor = {
    notification: 'bg-red-50 text-red-700',
    'admit-card': 'bg-green-50 text-green-700',
    result: 'bg-blue-50 text-blue-700',
    'answer-key': 'bg-amber-50 text-amber-700',
  }[post.post_type] || 'bg-gray-50 text-gray-700';
  return (
    <a href={`/job/${post.slug}`} className="block p-3 hover:bg-gray-50">
      <div className="flex justify-between gap-2 items-start">
        <p className="text-sm font-medium leading-snug text-gray-900">{post.title}</p>
        <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${badgeColor}`}>
          {post.post_type}
        </span>
      </div>
      {post.short_summary && (
        <p className="text-xs text-gray-500 mt-1">{post.short_summary}</p>
      )}
    </a>
  );
}
