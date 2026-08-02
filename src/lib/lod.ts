// Parses LOD.lu (Lëtzebuerger Online Dictionnaire) article links and looks up
// the pronunciation audio for that entry via the site's JSON API.

function parseLodId(lodUrl: string): string {
  const match = lodUrl.match(/\/(?:artikel|entry)\/([^/?#]+)/);
  if (!match) {
    throw new Error(`Not a recognized LOD.lu article link: ${lodUrl}`);
  }
  return match[1];
}

export async function fetchLodAudioUrls(lodUrl: string): Promise<string[]> {
  const id = parseLodId(lodUrl);
  const res = await fetch(`https://lod.lu/api/lb/entry/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`LOD.lu lookup failed for "${id}": ${res.status}`);
  }
  const data = await res.json();
  const audioFiles = data?.entry?.audioFiles as
    | { ogg?: string; aac?: string }
    | undefined;
  return [audioFiles?.aac, audioFiles?.ogg].filter(
    (url): url is string => typeof url === "string"
  );
}
