"use client";

import { useRef, useState, useTransition } from "react";
import type { Card } from "@/db/schema";
import { createCard, updateCard } from "./actions";
import { usePastedImages } from "./use-pasted-images";
import { ImagePreviewList } from "./image-preview-list";
import { LanguageSelect } from "./language-select";

function useSideImages(existingUrls: string[]) {
  const pasted = usePastedImages();
  const [keptUrls, setKeptUrls] = useState<string[]>(existingUrls);
  return {
    ...pasted,
    keptUrls,
    previews: [...keptUrls, ...pasted.images.map((img) => img.previewUrl)],
    removeAt(index: number) {
      if (index < keptUrls.length) {
        setKeptUrls((prev) => prev.filter((_, i) => i !== index));
      } else {
        pasted.removeImage(index - keptUrls.length);
      }
    },
    reset(urls: string[]) {
      pasted.clearImages();
      setKeptUrls(urls);
    },
  };
}

type SideImages = ReturnType<typeof useSideImages>;

function SideField({
  label,
  textName,
  keepName,
  placeholder,
  defaultValue,
  side,
  textareaRef,
}: {
  label: string;
  textName: string;
  keepName: string;
  placeholder?: string;
  defaultValue?: string;
  side: SideImages;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div onPaste={side.onPaste} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{label}</span>
        <textarea
          ref={textareaRef}
          name={textName}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required
          rows={2}
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
      </label>
      {side.keptUrls.map((url) => (
        <input key={url} type="hidden" name={keepName} value={url} />
      ))}
      <ImagePreviewList items={side.previews} onRemove={side.removeAt} />
    </div>
  );
}

export function CardForm({
  card,
  languages,
  onDone,
}: {
  card?: Card;
  languages: string[];
  onDone?: () => void;
}) {
  const foreignInputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState(
    card?.language ?? languages[0] ?? "Luxembourgish"
  );
  // Bumped after a successful create to collapse the add-new-language input
  const [formEpoch, setFormEpoch] = useState(0);
  const foreign = useSideImages(card?.foreignImageUrls ?? []);
  const english = useSideImages(card?.englishImageUrls ?? []);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          foreign.appendToFormData(formData, foreign.images, "foreignImages");
          english.appendToFormData(formData, english.images, "englishImages");
          if (card) {
            await updateCard(card.id, formData);
            onDone?.();
          } else {
            await createCard(formData);
            foreign.reset([]);
            english.reset([]);
            formRef.current?.reset();
            setFormEpoch((e) => e + 1);
            foreignInputRef.current?.focus();
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Language</span>
        <LanguageSelect
          key={formEpoch}
          languages={languages}
          value={language}
          onValueChange={setLanguage}
        />
      </label>

      <SideField
        label="Foreign text"
        textName="foreignText"
        keepName="keepForeignImageUrls"
        placeholder="e.g. Moien"
        defaultValue={card?.foreignText}
        side={foreign}
        textareaRef={foreignInputRef}
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">LOD.lu link (optional)</span>
        <input
          type="url"
          name="lodUrl"
          placeholder="https://lod.lu/artikel/..."
          defaultValue={card?.lodUrl ?? ""}
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
      </label>
      <SideField
        label="English text"
        textName="englishText"
        keepName="keepEnglishImageUrls"
        placeholder="e.g. Hello"
        defaultValue={card?.englishText}
        side={english}
      />

      <p className="text-xs opacity-50">
        📋 Paste an image while in a text field to attach it to that side.
      </p>

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending
            ? card
              ? "Saving…"
              : "Adding…"
            : card
              ? "Save"
              : "Add card"}
        </button>
        {card && (
          <button
            type="button"
            onClick={onDone}
            className="flex-1 rounded-lg border border-black/15 dark:border-white/20 px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
