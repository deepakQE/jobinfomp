export default function StickyTelegramButton() {
  return (
    <a
      href="https://t.me/jobinfomp" // ⚠️ REPLACE WITH YOUR ACTUAL TELEGRAM LINK
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 animate-bounce-slow"
      aria-label="Join our Telegram Channel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.623 4.823-4.351c.192-.192-.054-.3-.297-.108l-5.965 3.759-2.568-.802c-.56-.176-.57-.56.117-.828l10.037-3.869c.466-.174.875.108.713.827z"/>
      </svg>
      <span className="font-bold text-sm hidden sm:inline">Join Telegram</span>
    </a>
  );
}