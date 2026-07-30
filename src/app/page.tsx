import { desc } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { AddCardForm } from "./add-card-form";
import { CardItem } from "./card-item";
import { DbUnavailable } from "./db-unavailable";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  let allCards;
  try {
    allCards = await db.select().from(cards).orderBy(desc(cards.createdAt));
  } catch {
    return <DbUnavailable />;
  }

  return (
    <div className="flex flex-col gap-6">
      <AddCardForm />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-60">
          Your cards ({allCards.length})
        </h2>
        {allCards.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/20 dark:border-white/25 p-6 text-center text-sm opacity-70">
            No cards yet. Add your first card above, then start a quiz!
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {allCards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
