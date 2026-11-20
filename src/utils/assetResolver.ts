/**
 * Driver Dost - Public Emblem & Static Icon Resolver
 *
 * Resolves the authoritative icon assets directly without issuing 404 requests
 * for nonexistent placeholder filenames.
 */

export const NEUTRAL_OFFICIAL_EMBLEM_FILE = 'doc-official-icon.png';
export const NEUTRAL_ICON_FILE = 'doc-icon.png';
export const LEGACY_OFFICIAL_EMBLEM_FILE = 'bilty-official-icon.png';
export const LEGACY_ICON_FILE = 'bilty-icon.png';

export function buildPublicEmblemCandidates(baseUrl: string = './', origin: string = ''): string[] {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const files = [
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
  `./${LEGACY_OFFICIAL_EMBLEM_FILE}`,
  `./${LEGACY_ICON_FILE}`
];

let cachedPreferredEmblemUrl: string | null = null;

/**
 * Resolves the active emblem URL directly to avoid redundant 404 HEAD network requests.
 */
export async function resolvePublicEmblemUrl(): Promise<string> {
  if (cachedPreferredEmblemUrl) return cachedPreferredEmblemUrl;
  cachedPreferredEmblemUrl = `./${LEGACY_OFFICIAL_EMBLEM_FILE}`;
  return cachedPreferredEmblemUrl;
}

/**
 * Returns an img `onError` handler that steps cleanly through fallback emblem filenames.
 */
export function handleEmblemImgError(imgEl: HTMLImageElement | null, onExhausted?: () => void): void {
  if (!imgEl) return;
  const step = Number(imgEl.dataset.emblemStep || '0');
  if (step === 0) {
    imgEl.dataset.emblemStep = '1';
    imgEl.src = `./${LEGACY_ICON_FILE}`;
  } else if (step === 1) {
    imgEl.dataset.emblemStep = '2';
    imgEl.src = './logo.png';
  } else {
    onExhausted?.();
  }
}

export function resetEmblemResolverCacheForTests(): void {
  cachedPreferredEmblemUrl = null;
}
