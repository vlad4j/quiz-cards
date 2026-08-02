"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { deleteImages, uploadImage } from "@/lib/storage";
import { fetchLodAudioUrls } from "@/lib/lod";

function requireField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing field: ${name}`);
  }
  return value.trim();
}

function optionalField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function uploadNewImages(
  formData: FormData,
  field: string
): Promise<string[]> {
  const files = formData
    .getAll(field)
    .filter((f): f is File => f instanceof File && f.size > 0);
  return Promise.all(files.map(uploadImage));
}

function keptUrls(formData: FormData, field: string): string[] {
  return formData
    .getAll(field)
    .filter((v): v is string => typeof v === "string");
}

export async function createCard(formData: FormData) {
  const lodUrl = optionalField(formData, "lodUrl");
  await db.insert(cards).values({
    language: requireField(formData, "language"),
    foreignText: requireField(formData, "foreignText"),
    englishText: requireField(formData, "englishText"),
    foreignImageUrls: await uploadNewImages(formData, "foreignImages"),
    englishImageUrls: await uploadNewImages(formData, "englishImages"),
    lodUrl: lodUrl || null,
    lodAudioUrls: lodUrl ? await fetchLodAudioUrls(lodUrl) : [],
  });
  revalidatePath("/");
}

export async function updateCard(id: string, formData: FormData) {
  const [existing] = await db
    .select({
      foreignImageUrls: cards.foreignImageUrls,
      englishImageUrls: cards.englishImageUrls,
      lodUrl: cards.lodUrl,
      lodAudioUrls: cards.lodAudioUrls,
    })
    .from(cards)
    .where(eq(cards.id, id));
  if (!existing) throw new Error("Card not found");

  const keptForeign = keptUrls(formData, "keepForeignImageUrls");
  const keptEnglish = keptUrls(formData, "keepEnglishImageUrls");
  const removed = [
    ...existing.foreignImageUrls.filter((u) => !keptForeign.includes(u)),
    ...existing.englishImageUrls.filter((u) => !keptEnglish.includes(u)),
  ];

  const lodUrl = optionalField(formData, "lodUrl");
  const lodAudioUrls = !lodUrl
    ? []
    : lodUrl === existing.lodUrl
      ? existing.lodAudioUrls
      : await fetchLodAudioUrls(lodUrl);

  await db
    .update(cards)
    .set({
      language: requireField(formData, "language"),
      foreignText: requireField(formData, "foreignText"),
      englishText: requireField(formData, "englishText"),
      foreignImageUrls: [
        ...keptForeign,
        ...(await uploadNewImages(formData, "foreignImages")),
      ],
      englishImageUrls: [
        ...keptEnglish,
        ...(await uploadNewImages(formData, "englishImages")),
      ],
      lodUrl: lodUrl || null,
      lodAudioUrls,
    })
    .where(eq(cards.id, id));

  await deleteImages(removed);
  revalidatePath("/");
}

export async function deleteCard(id: string) {
  const [existing] = await db
    .select({
      foreignImageUrls: cards.foreignImageUrls,
      englishImageUrls: cards.englishImageUrls,
    })
    .from(cards)
    .where(eq(cards.id, id));

  await db.delete(cards).where(eq(cards.id, id));
  if (existing) {
    await deleteImages([
      ...existing.foreignImageUrls,
      ...existing.englishImageUrls,
    ]);
  }
  revalidatePath("/");
}
