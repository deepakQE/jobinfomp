export type JobPost = {
  slug: string;
  title: string;
  category: string | null;
  post_type: string;
  short_summary: string | null;
  application_deadline?: string | null;
  notification_date?: string | null;
  published_at?: string | null;
  publish_date?: string | null;
  created_at: string;
  total_vacancy?: number | null;
};

export const JOB_POST_COLUMNS =
  'slug, title, category, post_type, short_summary, application_deadline, created_at, total_vacancy';

const jobSectionConfig = [
  { type: 'latest-job', label: 'Latest Jobs', limit: 8 },
  { type: 'admit-card', label: 'Admit Cards', limit: 8 },
  { type: 'result', label: 'Results', limit: 8 },
  { type: 'answer-key', label: 'Answer Keys', limit: 8 },
  { type: 'archive', label: 'Archive', limit: 8 },
] as const;

type ListingOptions = {
  filterExpiredLatestJobs?: boolean;
  currentDate?: string;
};

export function getPublicationDate(post: JobPost) {
  return post.notification_date || post.published_at || post.publish_date || post.created_at;
}

function subtractSixMonths(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCMonth(value.getUTCMonth() - 6);
  return value.toISOString().slice(0, 10);
}

export function getJobSections(posts: JobPost[], options: ListingOptions = {}) {
  const { filterExpiredLatestJobs = false, currentDate } = options;

  return jobSectionConfig.map((section) => ({
    ...section,
    posts: posts
      .filter((post) => {
        const publicationDate = getPublicationDate(post).slice(0, 10);
        const isOldLatestJob = section.type === 'archive' && post.post_type === 'latest-job' && currentDate && publicationDate < subtractSixMonths(currentDate);
        if (section.type === 'archive') return Boolean(isOldLatestJob);
        if (post.post_type !== section.type) return false;

        return !(
          section.type === 'latest-job' &&
          currentDate &&
          publicationDate < subtractSixMonths(currentDate)
        ) && !(
          filterExpiredLatestJobs &&
          section.type === 'latest-job' &&
          post.application_deadline &&
          currentDate &&
          post.application_deadline < currentDate
        );
      })
      .sort((left, right) => getPublicationDate(right).localeCompare(getPublicationDate(left)))
      .slice(0, section.limit),
  }));
}
