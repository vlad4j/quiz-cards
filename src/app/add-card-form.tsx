"use client";

import { useRef, useTransition } from "react";
import { createCard } from "./actions";
import { usePastedImages } from "./use-pasted-images";
import { ImagePreviewList } from "./image-preview-list";

export function AddCardForm() {
  const foreignInputRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const { images, onPaste, removeImage, clearImages, appendToFormData } =
    usePastedImages();

  return (
    <form
      onPaste={onPaste}
      action={(formData) => {
        startTransition(async () => {
          appendToFormData(formData, images);
          await createCard(formData);
          clearImages();
          foreignInputRef.current?.focus();
        });
      }}
      className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
        Add a card
      </h2>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Language</span>
        <input
          name="language"
          defaultValue="Luxembourgish"
          required
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Foreign text</span>
        <textarea
          ref={foreignInputRef}
          name="foreignText"
          placeholder="e.g. Moien"
          required
          rows={2}
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">English text</span>
        <textarea
          name="englishText"
          placeholder="e.g. Hello"
          required
          rows={2}
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
      </label>

      <ImagePreviewList
        items={images.map((img) => img.previewUrl)}
        onRemove={removeImage}
      />
      <p className="text-xs opacity-50">
        📋 Paste an image from your clipboard anywhere in this form to attach it.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add card"}
      </button>
    </form>
  );
}
