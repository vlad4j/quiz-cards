import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function QuizSetupPage() {
  const languages = await db
    .select({
      language: cards.language,
      count: sql<number>`count(*)::int`,
    })
    .from(cards)
    .groupBy(cards.language);

  const total = languages.reduce((sum, l) => sum + l.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">No cards to quiz yet</p>
        <p className="text-sm opacity-70">Add some cards first, then come back.</p>
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Go to cards
        </Link>
      </div>
    );
  }

  return (
    <form
      action="/quiz/play"
      method="GET"
      className="flex flex-col gap-5 rounded-xl border border-black/10 dark:border-white/15 p-4"
    >
      <h1 className="text-lg font-bold">Start a quiz</h1>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Number of cards</span>
        <input
          type="number"
          name="count"
          min={1}
          max={total}
          defaultValue={Math.min(10, total)}
          required
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
        <span className="text-xs opacity-60">{total} cards available</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Language</span>
        <select
          name="language"
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5 dark:bg-neutral-900"
        >
          <option value="">All languages ({total})</option>
          {languages.map((l) => (
            <option key={l.language} value={l.language}>
              {l.language} ({l.count})
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 font-medium">Quiz direction</legend>
        {[
          { value: "foreign-to-english", label: "Foreign → English" },
          { value: "english-to-foreign", label: "English → Foreign" },
          { value: "mixed", label: "Mixed" },
        ].map((option, i) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-lg border border-black/15 dark:border-white/20 px-3 py-2.5"
          >
            <input
              type="radio"
              name="direction"
              value={option.value}
              defaultChecked={i === 0}
              className="accent-indigo-600"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
      >
        Start quiz
      </button>
    </form>
  );
}
