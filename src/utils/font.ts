import type { FontManifestItem } from '../types';

// 字体魔数: TTF/OpenType-CFF/TTC 的前 4 字节
const FONT_MAGICS = [
  [0x00, 0x01, 0x00, 0x00], // TrueType
  [0x4f, 0x54, 0x54, 0x4f], // 'OTTO' (CFF/OpenType)
  [0x74, 0x72, 0x75, 0x65], // 'true'
  [0x74, 0x74, 0x63, 0x66], // 'ttcf' (TrueType collection)
];

function looksLikeFont(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 4) return false;
  const head = new Uint8Array(buf, 0, 4);
  return FONT_MAGICS.some((m) => m.every((v, i) => head[i] === v));
}

// 全局缓存：路径 -> ArrayBuffer
const fontBytesCache = new Map<string, ArrayBuffer>();

export async function loadFontBytes(path: string): Promise<ArrayBuffer> {
  if (fontBytesCache.has(path)) return fontBytesCache.get(path)!;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`字体加载失败: ${path} (${res.status})`);
  const buf = await res.arrayBuffer();
  if (!looksLikeFont(buf)) throw new Error(`文件不是有效字体: ${path}`);
  fontBytesCache.set(path, buf);
  return buf;
}

// 获取字体清单
export async function fetchFontManifest(): Promise<FontManifestItem[]> {
  const res = await fetch('/fonts/fonts.json');
  if (!res.ok) throw new Error('字体清单加载失败');
  return res.json();
}

export const DEFAULT_FONT_NAME = 'NotoSansSC-Regular';

// 动态注入 @font-face CSS
const injectedSet = new Set<string>();

export function injectFontFaces(manifest: FontManifestItem[]) {
  const styleId = 'dynamic-font-faces';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const newRules: string[] = [];
  for (const f of manifest) {
    if (injectedSet.has(f.name)) continue;
    injectedSet.add(f.name);
    const format = f.path.endsWith('.woff2')
      ? 'woff2'
      : f.path.endsWith('.woff')
      ? 'woff'
      : f.path.endsWith('.otf')
      ? 'opentype'
      : 'truetype';
    newRules.push(
      `@font-face { font-family: '${f.name}'; src: url('${f.path}') format('${format}'); }`
    );
  }

  if (newRules.length > 0) {
    styleEl.textContent += '\n' + newRules.join('\n');
  }
}

// 兼容性保留：原有单字体加载（内部走 loadFontBytes）
const FONT_CANDIDATES = [
  '/fonts/static/NotoSansSC-Regular.ttf',
  '/fonts/NotoSansSC-Regular.ttf',
  '/fonts/NotoSansSC-Regular.otf',
  '/fonts/NotoSansSC-VariableFont_wght.ttf',
];

export async function loadChineseFontBytes(): Promise<ArrayBuffer> {
  for (const path of FONT_CANDIDATES) {
    try {
      return await loadFontBytes(path);
    } catch {
      continue;
    }
  }
  throw new Error(
    '中文字体文件未找到。请把 NotoSansSC-Regular.ttf(或 .otf)放到 public/fonts/。'
  );
}
