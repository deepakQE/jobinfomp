import { describe, expect, it } from 'vitest';
import { getJobSections, JOB_POST_COLUMNS } from '../services/job-listing';
import { cleanText, formatVacancies } from '../lib/format';

describe('job listing', () => {
  it('keeps created_at for JobCard and removes expired latest jobs', () => {
    const sections = getJobSections(
      [
        {
          slug: 'current-role', title: 'Current role', category: 'mppsc', post_type: 'latest-job',
          short_summary: null, application_deadline: '2026-10-11', created_at: '2026-10-10T00:00:00.000Z',
        },
        {
          slug: 'expired-role', title: 'Expired role', category: 'mppsc', post_type: 'latest-job',
          short_summary: null, application_deadline: '2026-10-09', created_at: '2026-10-09T00:00:00.000Z',
        },
      ],
      { filterExpiredLatestJobs: true, currentDate: '2026-10-10' }
    );

    expect(JOB_POST_COLUMNS).toContain('created_at');
    expect(JOB_POST_COLUMNS).toContain('total_vacancy');
    expect(JOB_POST_COLUMNS).not.toContain('post_count');
    expect(sections[0].posts).toEqual([
      expect.objectContaining({ slug: 'current-role', created_at: '2026-10-10T00:00:00.000Z' }),
    ]);
  });

  it('removes N/A prefixes while preserving meaningful details', () => {
    expect(formatVacancies('N/A (Notice)')).toBe('Notice');
    expect(cleanText('N/A - Result')).toBe('Result');
    expect(formatVacancies('N/A')).toBeNull();
    expect(cleanText('N/A ()')).toBeNull();
  });

  it('sorts by notification date and moves old latest jobs to Archive', () => {
    const sections = getJobSections([
      { slug: 'saved-later', title: 'Saved later', category: 'mppsc', post_type: 'latest-job', short_summary: null, application_deadline: null, created_at: '2026-10-09T00:00:00.000Z', notification_date: '2026-08-01' },
      { slug: 'notified-later', title: 'Notified later', category: 'mppsc', post_type: 'latest-job', short_summary: null, application_deadline: null, created_at: '2026-08-01T00:00:00.000Z', notification_date: '2026-10-09' },
      { slug: 'old-ad', title: 'Old advertisement', category: 'mppsc', post_type: 'latest-job', short_summary: null, application_deadline: null, created_at: '2026-09-01T00:00:00.000Z', notification_date: '2026-03-01' },
    ], { currentDate: '2026-10-10' });

    expect(sections.find((section) => section.type === 'latest-job')?.posts.map((post) => post.slug)).toEqual(['notified-later', 'saved-later']);
    expect(sections.find((section) => section.type === 'archive')?.posts.map((post) => post.slug)).toEqual(['old-ad']);
  });
});
