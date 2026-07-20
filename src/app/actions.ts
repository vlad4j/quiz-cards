"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";

function requireField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing field: ${name}`);
  }
  return value.trim();
}

export async function createCard(formData: FormData) {
  await db.insert(cards).values({
    language: requireField(formData, "language"),
    foreignText: requireField(formData, "foreignText"),
    englishText: requireField(formData, "englishText"),
  });
  revalidatePath("/");
}

export async function updateCard(id: string, formData: FormData) {
  await db
    .update(cards)
    .set({
      language: requireField(formData, "language"),
      foreignText: requireField(formData, "foreignText"),
      englishText: requireField(formData, "englishText"),
    })
    .where(eq(cards.id, id));
  revalidatePath("/");
}

export async function deleteCard(id: string) {
  await db.delete(cards).where(eq(cards.id, id));
  revalidatePath("/");
}
