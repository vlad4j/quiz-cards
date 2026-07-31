"use client";

import { useState } from "react";

const ADD_NEW = "__add_new__";

export function LanguageSelect({
  languages,
  value,
  onValueChange,
}: {
  languages: string[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [addingNew, setAddingNew] = useState(false);

  if (addingNew) {
    return (
      <div className="flex gap-2">
        <input
          name="language"
          autoFocus
          required
          placeholder="e.g. French"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5"
        />
        <button
          type="button"
          onClick={() => {
            setAddingNew(false);
            onValueChange(languages[0]);
          }}
          className="shrink-0 rounded-lg border border-black/15 dark:border-white/20 px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Include the current value even if the server hasn't re-rendered
  // the languages list yet (right after adding a new language)
  const options =
    value && !languages.includes(value)
      ? [...languages, value].sort()
      : languages;

  return (
    <select
      name="language"
      value={value}
      onChange={(e) => {
        if (e.target.value === ADD_NEW) {
          setAddingNew(true);
          onValueChange("");
        } else {
          onValueChange(e.target.value);
        }
      }}
      className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2.5 dark:bg-neutral-900"
    >
      {options.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
      <option value={ADD_NEW}>+ Add new language…</option>
    </select>
  );
}
