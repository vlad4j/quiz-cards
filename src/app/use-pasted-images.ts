"use client";

import { useCallback, useState, type ClipboardEvent } from "react";

export type PastedImage = { file: File; previewUrl: string };

const MAX_DIMENSION = 1600;

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85)
  );
  if (!blob) return file;
  return new File([blob], "pasted.webp", { type: "image/webp" });
}

export function usePastedImages() {
  const [images, setImages] = useState<PastedImage[]>([]);

  const onPaste = useCallback(async (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files).filter((f) =>
      f.type.startsWith("image/")
    );
    for (const file of files) {
      const compressed = await compressImage(file);
      setImages((prev) => [
        ...prev,
        { file: compressed, previewUrl: URL.createObjectURL(compressed) },
      ]);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
  }, []);

  const appendToFormData = useCallback(
    (formData: FormData, current: PastedImage[]) => {
      current.forEach((img) => formData.append("images", img.file));
    },
    []
  );

  return { images, onPaste, removeImage, clearImages, appendToFormData };
}
