export const metadata = { title: 'Contact us | Jobinfo MP' };

export default function Contact() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Contact us</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed">
          For corrections, feedback, partnership queries, or content updates, use the links below to reach Jobinfo MP directly.
        </p>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Deepak Meena</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            Jobinfo MP is maintained as an independent job-alert site focused on faster notification delivery, cleaner summaries, and easier mobile browsing.
          </p>
          <a href="https://www.linkedin.com/in/deepak-meena-b72b97204/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:text-blue-800">
            Connect on LinkedIn
          </a>
        </div>

        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Devidas Arse</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            Full-stack developer support, SEO, marketing, and data collection coordination for the website.
          </p>
          <a href="https://www.linkedin.com/in/devidas-arse-479382264/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:text-blue-800">
            Connect on LinkedIn
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://t.me/jobinfomp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Telegram Channel
          </a>
          <a
            href="https://www.linkedin.com/in/deepak-meena-b72b97204/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            LinkedIn Profile
          </a>
        </div>

        <div className="mt-4 text-xs text-gray-500 leading-relaxed">
          Best way to contact: Telegram for daily updates, LinkedIn for profile verification, and this page for feedback or corrections.
        </div>
      </div>
    </main>
  );
}