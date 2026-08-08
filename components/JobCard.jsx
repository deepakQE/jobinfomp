import Link from 'next/link';

export default function JobCard({ post }) {
  // Map post types to seal badge classes
  const sealType = {
    'latest-job': 'notification',
    'notification': 'notification',
    'upcoming-job': 'upcoming',
    'upcoming': 'upcoming',
    'admit-card': 'admit-card',
    'result': 'result',
    'answer-key': 'answer-key',
  }[post.post_type] || 'notification';

  // Format date for Plex Mono display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <Link href={`/job/${post.slug}`}>
      <div className="card-lift relative p-4 border hairline-border rounded-card bg-card-bg transition-all duration-150 group">
        {/* Seal Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <div className={`seal-badge ${sealType}`} aria-label={`Status: ${sealType}`} />
        </div>

        {/* Title */}
        <h3 className="headline-sm text-primary pr-12 group-hover:text-gold transition-colors duration-150">
          {post.title}
        </h3>

        {/* Meta Line - Department, Count, Date */}
        <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-slate">
          {[
            post.category ? post.category.toUpperCase() : null,
            post.post_count ? `${post.post_count} Posts` : null,
            formatDate(post.created_at),
          ]
            .filter(Boolean)
            .map((item, index, items) => (
              <span key={`${item}-${index}`} className="flex items-center gap-x-3">
                <span className={index === 0 ? 'truncate' : 'tabular whitespace-nowrap'}>{item}</span>
                {index < items.length - 1 && <span className="text-hairline">•</span>}
              </span>
            ))}
        </div>

        {/* Description */}
        {post.short_summary && (
          <p className="text-sm leading-relaxed text-slate mt-3 line-clamp-2">
            {post.short_summary}
          </p>
        )}
      </div>
    </Link>
  );
}