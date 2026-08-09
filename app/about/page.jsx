export const metadata = { title: 'About us | Jobinfo MP' };

export default function About() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">About Jobinfo MP</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed">
          Jobinfo MP provides fast, rewritten summaries of government job notifications, admit cards, results, and answer keys for Madhya Pradesh job seekers. The site is curated to help users find the most relevant update quickly on mobile first, then desktop and tablet.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Managed by</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">Deepak Meena</p>
            <p className="mt-1 text-xs text-gray-600">Independent publisher focused on job alerts, content clarity, and faster updates.</p>
            <a href="https://www.linkedin.com/in/deepak-meena-b72b97204/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:text-blue-800">
              Connect on LinkedIn
            </a>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Supported by</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">Devidas Arse</p>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed">Full-stack development, SEO, marketing, and data collection support.</p>
            <a href="https://www.linkedin.com/in/devidas-arse-479382264/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:text-blue-800">
              Connect on LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">What users get</p>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">Direct links, important dates, eligibility, vacancies, and official sources in a cleaner format designed for quick reading.</p>
        </div>

        <p className="mt-4 text-sm text-gray-700 leading-relaxed">
          We are not affiliated with any government body. Always verify details on the official website before applying.
        </p>
      </div>
    </main>
  );
}