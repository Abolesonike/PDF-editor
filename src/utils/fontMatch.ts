import type { FontManifestItem } from '../types';

export interface ResolvedFont {
  psName?: string;
  family?: string;
  bold?: boolean;
  italic?: boolean;
}

const SUBSET_PREFIX_RE = /^[A-Z]{6}\+/;

const WEIGHT_KEYWORDS = [
  'ExtraBlack',
  'Black',
  'ExtraBold',
  'SemiBold',
  'Bold',
  'Medium',
  'Regular',
  'ExtraLight',
  'SemiLight',
  'Light',
  'Thin',
  'Heavy',
] as const;

const STYLE_KEYWORDS = ['Italic', 'Oblique'] as const;

const GENERIC_CSS_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
]);

export interface NormalizedName {
  family: string;
  weight?: string;
  italic: boolean;
}

export function normalizePsName(raw: string): NormalizedName {
  let name = raw.replace(SUBSET_PREFIX_RE, '');
  name = name.replace(/,/g, '-');

  let italic = false;
  for (const s of STYLE_KEYWORDS) {
    const re = new RegExp(`[-_\\s]?${s}\\b`, 'i');
    if (re.test(name)) {
      italic = true;
      name = name.replace(re, '');
    }
  }

  let weight: string | undefined;
  for (const w of WEIGHT_KEYWORDS) {
    const re = new RegExp(`[-_\\s]${w}\\b`, 'i');
    if (re.test(name)) {
      weight = w;
      name = name.replace(re, '');
      break;
    }
  }

  return { family: name.trim().replace(/[-_\s]+$/, ''), weight, italic };
}

function inferWeightKeyword(bold: boolean | undefined): string {
  return bold ? 'Bold' : 'Regular';
}

function isGenericCssFamily(name: string | undefined): boolean {
  if (!name) return true;
  return GENERIC_CSS_FAMILIES.has(name.toLowerCase().trim());
}

export function matchFontInManifest(
  resolved: ResolvedFont,
  manifest: FontManifestItem[]
): string | null {
  if (manifest.length === 0) return null;

  const ps = resolved.psName?.replace(SUBSET_PREFIX_RE, '');

  if (ps) {
    const exact = manifest.find((m) => m.name === ps);
    if (exact) return exact.name;
  }

  const fromPs = ps ? normalizePsName(ps) : { family: '', weight: undefined, italic: false };
  const family = isGenericCssFamily(resolved.family) ? fromPs.family : resolved.family!;
  if (!family) return null;

  const italic = fromPs.italic || resolved.italic === true;
  const weight = fromPs.weight ?? inferWeightKeyword(resolved.bold);

  const candidates = [
    italic ? `${family}-${weight}Italic` : null,
    `${family}-${weight}`,
    italic ? `${family}-Italic` : null,
    `${family}-Regular`,
  ].filter((x): x is string => !!x);

  for (const c of candidates) {
    const hit = manifest.find((m) => m.name === c);
    if (hit) return hit.name;
  }

  const familyHit = manifest.find(
    (m) => m.name === family || m.name.startsWith(`${family}-`)
  );
  if (familyHit) return familyHit.name;

  return null;
}
