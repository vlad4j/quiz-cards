"use client";

import { useState, useTransition } from "react";
import type { Card } from "@/db/schema";
import { deleteCard, updateCard } from "./actions";
import { usePastedImages } from "./use-pasted-images";
import { ImagePreviewList } from "./image-preview-list";

export function CardItem({ card }: { card: Card }) {
  const [editing, setEditing] = useState(false);
  const [keptUrls, setKeptUrls] = useState<string[]>(card.imageUrls);
  const [isPending, startTransition] = useTransition();
  const { images, onPaste, removeImage, clearImages, appendToFormData } =
    usePastedImages();

  function startEditing() {
    setKeptUrls(card.imageUrls);
    setEditing(true);
  }

  function stopEditing() {
    clearImages();
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-indigo-400/50 p-4">
        <form
          onPaste={onPaste}
          action={(formData) => {
            startTransition(async () => {
              appendToFormData(formData, images);
              await updateCard(card.id, formData);
              stopEditing();
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
            <textarea
              name="foreignText"
              defaultValue={card.foreignText}
              required
              rows={2}
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">English text</span>
            <textarea
              name="englishText"
              defaultValue={card.englishText}
              required
              rows={2}
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
            />
          </label>

          {keptUrls.map((url) => (
            <input key={url} type="hidden" name="keepImageUrls" value={url} />
          ))}
          <ImagePreviewList
            items={[...keptUrls, ...images.map((img) => img.previewUrl)]}
            onRemove={(i) => {
              if (i < keptUrls.length) {
                setKeptUrls((prev) => prev.filter((_, j) => j !== i));
              } else {
                removeImage(i - keptUrls.length);
              }
            }}
          />
          <p className="text-xs opacity-50">
            📋 Paste an image from your clipboard to attach it.
          </p>

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
              onClick={stopEditing}
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
    <li className="flex items-start gap-3 rounded-xl border border-black/10 dark:border-white/15 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words whitespace-pre-wrap">
          {card.foreignText}
        </p>
        <p className="text-sm opacity-70 break-words whitespace-pre-wrap">
          {card.englishText}
        </p>
        {card.imageUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {card.imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="h-16 w-16 rounded-lg border border-black/10 dark:border-white/15 object-cover"
              />
            ))}
          </div>
        )}
        <p className="mt-1 text-xs opacity-50">{card.language}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={startEditing}
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
