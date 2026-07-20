import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { QuizSession, type Direction } from "./session";

export const dynamic = "force-dynamic";

const DIRECTIONS: Direction[] = [
  "foreign-to-english",
  "english-to-foreign",
  "mixed",
];

export default async function QuizPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const count = Math.max(1, Math.min(100, Number(params.count) || 10));
  const language = typeof params.language === "string" ? params.language : "";
  const direction: Direction = DIRECTIONS.includes(params.direction as Direction)
    ? (params.direction as Direction)
    : "foreign-to-english";

  const quizCards = await db
    .select()
    .from(cards)
    .where(language ? eq(cards.language, language) : undefined)
    .orderBy(sql`random()`)
    .limit(count);

  if (quizCards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">No cards match this quiz</p>
        <Link
          href="/quiz"
          className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Back to quiz setup
        </Link>
      </div>
    );
  }

  // Key by request so "Quiz again" (router.refresh) remounts with fresh state
  return (
    <QuizSession key={Date.now()} cards={quizCards} direction={direction} />
  );
}
