let cache: ArrayBuffer | null = null;

const FONT_CANDIDATES = [
  '/fonts/static/NotoSansSC-Regular.ttf',
  '/fonts/NotoSansSC-Regular.ttf',
  '/fonts/NotoSansSC-Regular.otf',
  '/fonts/NotoSansSC-VariableFont_wght.ttf',
];

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

export async function loadChineseFontBytes(): Promise<ArrayBuffer> {
  if (cache) return cache;
  const tried: string[] = [];
  for (const path of FONT_CANDIDATES) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        tried.push(`${path} (HTTP ${res.status})`);
        continue;
      }
      const buf = await res.arrayBuffer();
      if (!looksLikeFont(buf)) {
        // Vite 等 dev server 对找不到的路径会回退返回 index.html;过滤掉
        tried.push(`${path} (内容不是字体,可能文件不存在)`);
        continue;
      }
      cache = buf;
      return cache;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      tried.push(`${path} (${msg})`);
    }
  }
  throw new Error(
    `中文字体文件未找到。请把 NotoSansSC-Regular.ttf(或 .otf)放到 public/fonts/。\n已尝试:\n- ${tried.join(
      '\n- '
    )}`
  );
}
