"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { deleteImages, uploadImage } from "@/lib/storage";

function requireField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing field: ${name}`);
  }
  return value.trim();
}

async function uploadNewImages(formData: FormData): Promise<string[]> {
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  return Promise.all(files.map(uploadImage));
}

export async function createCard(formData: FormData) {
  await db.insert(cards).values({
    language: requireField(formData, "language"),
    foreignText: requireField(formData, "foreignText"),
    englishText: requireField(formData, "englishText"),
    imageUrls: await uploadNewImages(formData),
  });
  revalidatePath("/");
}

export async function updateCard(id: string, formData: FormData) {
  const [existing] = await db
    .select({ imageUrls: cards.imageUrls })
    .from(cards)
    .where(eq(cards.id, id));
  if (!existing) throw new Error("Card not found");

  const kept = formData
    .getAll("keepImageUrls")
    .filter((v): v is string => typeof v === "string");
  const removed = existing.imageUrls.filter((u) => !kept.includes(u));

  await db
    .update(cards)
    .set({
      language: requireField(formData, "language"),
      foreignText: requireField(formData, "foreignText"),
      englishText: requireField(formData, "englishText"),
      imageUrls: [...kept, ...(await uploadNewImages(formData))],
    })
    .where(eq(cards.id, id));

  await deleteImages(removed);
  revalidatePath("/");
}

export async function deleteCard(id: string) {
  const [existing] = await db
    .select({ imageUrls: cards.imageUrls })
    .from(cards)
    .where(eq(cards.id, id));

  await db.delete(cards).where(eq(cards.id, id));
  if (existing) await deleteImages(existing.imageUrls);
  revalidatePath("/");
}
