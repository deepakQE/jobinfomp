export default function SearchForm({ value = '', action = '/', placeholder = 'Search jobs, exam names, or departments' }) {
  return (
    <form method="get" action={action} className="mb-4">
      <label htmlFor="site-search" className="sr-only">
        Search jobs
      </label>
      <div className="flex gap-2">
        <input
          id="site-search"
          name="q"
          type="search"
          defaultValue={value}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
        {value ? (
          <a
            href={action}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Clear
          </a>
        ) : null}
      </div>
    </form>
  );
}