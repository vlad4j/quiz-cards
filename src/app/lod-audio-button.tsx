"use client";

import { useRef, useState } from "react";

export function LodAudioButton({ urls }: { urls: string[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (urls.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => audioRef.current?.play()}
      aria-label="Play pronunciation"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400"
    >
      {playing ? "❚❚" : "▶"}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      >
        {urls.map((url) => (
          <source key={url} src={url} />
        ))}
      </audio>
    </button>
  );
}
