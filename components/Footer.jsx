export default function Footer() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/jobinfomp';

  return (
    <footer className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-left text-gray-700">
        <p className="text-sm font-semibold text-gray-900">Get instant alerts</p>
        <p className="mt-1 text-xs leading-relaxed">Follow Telegram for daily job updates, results, and answer keys as soon as they are published.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700">
            Join Telegram
          </a>
          <a href="/about" className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
            About us
          </a>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-600">
          Managed by Deepak Meena and supported by Devidas Arse for full-stack development, SEO, marketing, and data collection.
        </p>
      </div>
      <p>Jobinfo MP is not affiliated with any government body. All information is compiled from official notifications for reference only. Always verify on the official website before applying.</p>
    </footer>
  );
}
