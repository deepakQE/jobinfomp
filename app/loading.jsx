export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="container-editorial py-4">
        <div className="h-20 rounded-card bg-card-bg border hairline-border mb-6 animate-pulse" />
        <div className="h-28 rounded-card bg-ink-navy mb-6 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 rounded-card bg-card-bg border hairline-border animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}