"use client";

import { useState, useTransition } from "react";
import type { Card } from "@/db/schema";
import { deleteCard } from "./actions";
import { CardForm } from "./card-form";

function SideImages({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {urls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt=""
          className="h-16 w-16 rounded-lg border border-black/10 dark:border-white/15 object-cover"
        />
      ))}
    </div>
  );
}

export function CardItem({
  card,
  languages,
}: {
  card: Card;
  languages: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="rounded-xl border border-indigo-400/50 p-4">
        <CardForm
          card={card}
          languages={languages}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-xl border border-black/10 dark:border-white/15 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words whitespace-pre-wrap">
          {card.foreignText}
        </p>
        <SideImages urls={card.foreignImageUrls} />
        <p className="mt-1 text-sm opacity-70 break-words whitespace-pre-wrap">
          {card.englishText}
        </p>
        <SideImages urls={card.englishImageUrls} />
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
