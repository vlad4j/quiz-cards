"use client";

import { CardForm } from "./card-form";

export function AddCardForm({ languages }: { languages: string[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
        Add a card
      </h2>
      <CardForm languages={languages} />
    </section>
  );
}
