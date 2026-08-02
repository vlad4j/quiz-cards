"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Card } from "@/db/schema";
import { LodAudioButton } from "../../lod-audio-button";

export type Direction = "foreign-to-english" | "english-to-foreign" | "mixed";

type PromptSide = "foreign" | "english";

function QuizImages({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2">
      {urls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt=""
          className="max-h-96 w-full max-w-full rounded-lg border border-black/10 dark:border-white/15 object-contain"
        />
      ))}
    </div>
  );
}

export function QuizSession({
  cards,
  direction,
}: {
  cards: Card[];
  direction: Direction;
}) {
  const router = useRouter();
  // Pick each card's prompt side once per session
  const promptSides = useMemo<PromptSide[]>(
    () =>
      cards.map(() => {
        if (direction === "foreign-to-english") return "foreign";
        if (direction === "english-to-foreign") return "english";
        return Math.random() < 0.5 ? "foreign" : "english";
      }),
    [cards, direction]
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const finished = index >= cards.length;

  if (finished) {
    const correct = results.filter(Boolean).length;
    const missed = cards.filter((_, i) => !results[i]);
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-black/10 dark:border-white/15 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-60">
            Quiz complete
          </p>
          <p className="mt-2 text-4xl font-bold">
            {correct} / {cards.length}
          </p>
          <p className="mt-1 text-sm opacity-70">
            {correct === cards.length
              ? "Perfect score! 🎉"
              : `${cards.length - correct} to review`}
          </p>
        </div>

        {missed.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-60">
              Missed cards
            </h2>
            <ul className="flex flex-col gap-2">
              {missed.map((card) => (
                <li
                  key={card.id}
                  className="rounded-xl border border-red-400/40 p-4"
                >
                  <p className="font-medium break-words whitespace-pre-wrap">
                    {card.foreignText}
                  </p>
                  <p className="text-sm opacity-70 break-words whitespace-pre-wrap">
                    {card.englishText}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.refresh()}
            className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Quiz again
          </button>
          <Link
            href="/quiz"
            className="rounded-lg border border-black/15 dark:border-white/20 px-4 py-3 text-center font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Change settings
          </Link>
          <Link
            href="/"
            className="rounded-lg px-4 py-3 text-center font-medium opacity-70 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Back to cards
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const promptSide = promptSides[index];
  const prompt = promptSide === "foreign" ? card.foreignText : card.englishText;
  const answer = promptSide === "foreign" ? card.englishText : card.foreignText;
  const promptImages =
    promptSide === "foreign" ? card.foreignImageUrls : card.englishImageUrls;
  const answerImages =
    promptSide === "foreign" ? card.englishImageUrls : card.foreignImageUrls;

  function grade(correct: boolean) {
    setResults((prev) => [...prev, correct]);
    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm opacity-70">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>{card.language}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-black/10 dark:border-white/15 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
          {promptSide === "foreign" ? card.language : "English"}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold break-words whitespace-pre-wrap">
            {prompt}
          </p>
          {promptSide === "foreign" && (
            <LodAudioButton urls={card.lodAudioUrls} />
          )}
        </div>
        <QuizImages urls={promptImages} />
        {revealed && (
          <>
            <hr className="w-16 border-black/15 dark:border-white/20" />
            <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
              {promptSide === "foreign" ? "English" : card.language}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold break-words whitespace-pre-wrap text-indigo-600 dark:text-indigo-400">
                {answer}
              </p>
              {promptSide === "english" && (
                <LodAudioButton urls={card.lodAudioUrls} />
              )}
            </div>
            <QuizImages urls={answerImages} />
          </>
        )}
      </div>

      {revealed ? (
        <div className="flex gap-2">
          <button
            onClick={() => grade(false)}
            className="flex-1 rounded-lg bg-red-600 px-4 py-4 font-medium text-white hover:bg-red-500"
          >
            ✗ Missed it
          </button>
          <button
            onClick={() => grade(true)}
            className="flex-1 rounded-lg bg-green-600 px-4 py-4 font-medium text-white hover:bg-green-500"
          >
            ✓ Got it
          </button>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-lg bg-indigo-600 px-4 py-4 font-medium text-white hover:bg-indigo-500"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
