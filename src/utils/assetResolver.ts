/**
 * Driver Dost - Public Emblem & Static Icon Resolver
 *
 * Keeps existing protected PNG files in /public completely untouched while preparing
 * code paths for a zero-downtime filename swap:
 * - Neutral filenames (`doc-official-icon.png`, `doc-icon.png`) are checked FIRST.
 * - Automatically falls back to legacy filenames (`bilty-official-icon.png`, `bilty-icon.png`).
 */

export const NEUTRAL_OFFICIAL_EMBLEM_FILE = 'doc-official-icon.png';
export const NEUTRAL_ICON_FILE = 'doc-icon.png';
export const LEGACY_OFFICIAL_EMBLEM_FILE = 'bilty-official-icon.png';
export const LEGACY_ICON_FILE = 'bilty-icon.png';

export function buildPublicEmblemCandidates(baseUrl: string = './', origin: string = ''): string[] {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const files = [
    NEUTRAL_OFFICIAL_EMBLEM_FILE,
    NEUTRAL_ICON_FILE,
    LEGACY_OFFICIAL_EMBLEM_FILE,
    LEGACY_ICON_FILE
  ];

  const urls: string[] = [];
  for (const file of files) {
    urls.push(`${cleanBase}${file}`);
    urls.push(`./${file}`);
    urls.push(`/${file}`);
    if (origin && origin !== 'null') {
      urls.push(`${origin}/${file}`);
    }
  }
  return Array.from(new Set(urls));
}

export const PRIMARY_EMBLEM_FALLBACK_ORDER: readonly string[] = [
  `./${NEUTRAL_OFFICIAL_EMBLEM_FILE}`,
  `./${NEUTRAL_ICON_FILE}`,
  `./${LEGACY_OFFICIAL_EMBLEM_FILE}`,
  `./${LEGACY_ICON_FILE}`
];

let cachedPreferredEmblemUrl: string | null = null;
let preferredEmblemProbePromise: Promise<string> | null = null;

/**
 * Probes neutral emblem filenames once via HEAD; falls back immediately to legacy emblem.
 * Avoids repeated 404 requests across renders while seamlessly switching once neutral assets exist.
 */
export async function resolvePublicEmblemUrl(): Promise<string> {
  if (cachedPreferredEmblemUrl) return cachedPreferredEmblemUrl;
  if (preferredEmblemProbePromise) return preferredEmblemProbePromise;

  preferredEmblemProbePromise = (async () => {
    const fallback = `./${LEGACY_OFFICIAL_EMBLEM_FILE}`;
    if (typeof window === 'undefined' || typeof fetch !== 'function') {
      cachedPreferredEmblemUrl = fallback;
      return fallback;
    }

    for (const candidate of [`./${NEUTRAL_OFFICIAL_EMBLEM_FILE}`, `./${NEUTRAL_ICON_FILE}`]) {
      try {
        const res = await fetch(candidate, { method: 'HEAD', cache: 'force-cache' });
        if (res.ok) {
          cachedPreferredEmblemUrl = candidate;
          return candidate;
        }
      } catch {
        // Ignore offline/network probe errors and fall back cleanly
      }
    }

    cachedPreferredEmblemUrl = fallback;
    return fallback;
  })();

  return preferredEmblemProbePromise;
}

/**
 * Returns an img `onError` handler that steps cleanly through fallback emblem filenames.
 */
export function handleEmblemImgError(imgEl: HTMLImageElement | null, onExhausted?: () => void): void {
  if (!imgEl) return;
  const step = Number(imgEl.dataset.emblemStep || '0');
  if (step === 0) {
    imgEl.dataset.emblemStep = '1';
    imgEl.src = `./${LEGACY_OFFICIAL_EMBLEM_FILE}`;
  } else if (step === 1) {
    imgEl.dataset.emblemStep = '2';
    imgEl.src = `./${LEGACY_ICON_FILE}`;
  } else {
    onExhausted?.();
  }
}

export function resetEmblemResolverCacheForTests(): void {
  cachedPreferredEmblemUrl = null;
  preferredEmblemProbePromise = null;
}
