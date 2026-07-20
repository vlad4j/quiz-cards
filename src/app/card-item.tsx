"use client";

import { useState, useTransition } from "react";
import type { Card } from "@/db/schema";
import { deleteCard, updateCard } from "./actions";

export function CardItem({ card }: { card: Card }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="rounded-xl border border-indigo-400/50 p-4">
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateCard(card.id, formData);
              setEditing(false);
            });
          }}
          className="flex flex-col gap-2"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Language</span>
            <input
              name="language"
              defaultValue={card.language}
              required
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Foreign text</span>
            <input
              name="foreignText"
              defaultValue={card.foreignText}
              required
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">English text</span>
            <input
              name="englishText"
              defaultValue={card.englishText}
              required
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
            />
          </label>
          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg border border-black/15 dark:border-white/20 px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-black/10 dark:border-white/15 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words">{card.foreignText}</p>
        <p className="text-sm opacity-70 break-words">{card.englishText}</p>
        <p className="mt-1 text-xs opacity-50">{card.language}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit card"
          className="rounded-lg p-2.5 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ✏️
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${card.foreignText}"?`)) {
              startTransition(() => deleteCard(card.id));
            }
          }}
          disabled={isPending}
          aria-label="Delete card"
          className="rounded-lg p-2.5 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
