export function DbUnavailable() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-400/10 p-6 text-center">
      <p className="text-lg font-medium">Database unavailable</p>
      <p className="text-sm opacity-70">
        The Supabase project may be paused (free-tier projects pause after 7
        days of inactivity). Restore it from the Supabase dashboard, then
        reload this page.
      </p>
    </div>
  );
}
