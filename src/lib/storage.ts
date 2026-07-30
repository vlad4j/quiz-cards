const BUCKET = "card-images";

function config() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { url, key };
}

export async function uploadImage(file: File): Promise<string> {
  const { url, key } = config();
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": file.type,
    },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!res.ok) {
    throw new Error(`Image upload failed: ${res.status} ${await res.text()}`);
  }
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

// Best-effort: a failed storage delete only leaks an orphaned file
export async function deleteImages(urls: string[]): Promise<void> {
  const { url, key } = config();
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  await Promise.allSettled(
    urls
      .filter((u) => u.includes(marker))
      .map((u) =>
        fetch(`${url}/storage/v1/object/${BUCKET}/${u.split(marker)[1]}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${key}` },
        })
      )
  );
}
