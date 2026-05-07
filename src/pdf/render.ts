import { pdfjsLib } from './pdfjsSetup';
import type { PageInfo, OriginalTextItem, RGB } from '../types';

export type PdfDocProxy = Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>;

interface ResolvedFontInfo {
  psName?: string;
  family?: string;
  bold?: boolean;
  italic?: boolean;
}

async function resolveFontInfo(
  commonObjs: any,
  id: string
): Promise<ResolvedFontInfo | null> {
  if (!id) return null;
  try {
    const font: any = commonObjs.has(id)
      ? commonObjs.get(id)
      : await new Promise((resolve) => commonObjs.get(id, resolve));
    if (!font) return null;
    return {
      psName: font.name || font.fallbackName || undefined,
      family: font.cssFontInfo?.fontFamily || undefined,
      bold: font.bold === true,
      italic: font.italic === true,
    };
  } catch {
    return null;
  }
}

/**
 * 在 textItem 的 bbox 内采样一个最像"墨水"的像素作为文字颜色。
 * 思路: 字符的 anti-aliased 边缘会向背景色混合,真正的笔画核心保留原色;
 * 因此用"离白色最远 + 亮度低于白底阈值"的像素近似文字颜色。
 * 背景为彩色或黑色文字反白显示等场景会失真,但对常见白底 PDF 足够。
 */
function sampleTextColor(
  imageData: ImageData,
  cssLeft: number,
  cssTop: number,
  cssWidth: number,
  cssHeight: number
): RGB | null {
  const { data, width: imgW, height: imgH } = imageData;
  const left = Math.max(0, Math.floor(cssLeft));
  const top = Math.max(0, Math.floor(cssTop));
  const right = Math.min(imgW, Math.ceil(cssLeft + cssWidth));
  const bottom = Math.min(imgH, Math.ceil(cssTop + cssHeight));
  if (right <= left || bottom <= top) return null;

  let bestR = 0,
    bestG = 0,
    bestB = 0,
    bestScore = -1;

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const idx = (y * imgW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a === 0) continue;
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luma > 240) continue;
      const dist = 255 - r + (255 - g) + (255 - b);
      if (dist > bestScore) {
        bestScore = dist;
        bestR = r;
        bestG = g;
        bestB = b;
      }
    }
  }

  if (bestScore < 0) return null;
  return { r: bestR / 255, g: bestG / 255, b: bestB / 255 };
}

export async function loadPdf(bytes: ArrayBuffer): Promise<PdfDocProxy> {
  // 复制一份给 pdfjs，原始 bytes 留给 pdf-lib 导出时使用
  const copy = bytes.slice(0);
  // fontExtraProperties:true 让 worker 把真实 PostScript 名等元数据导出到 commonObjs,
  // 是字体识别功能的前置条件
  return pdfjsLib.getDocument({ data: copy, fontExtraProperties: true }).promise;
}

export interface CancellableRender {
  promise: Promise<PageInfo | null>;
  cancel: () => void;
}

/**
 * 返回可取消的渲染任务，避免同一 canvas 在 React StrictMode 下被并发 render
 */
export function renderPage(
  pdfDoc: PdfDocProxy,
  pageIndex: number,
  scale: number,
  canvas: HTMLCanvasElement
): CancellableRender {
  let cancelled = false;
  let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

  const promise = (async (): Promise<PageInfo | null> => {
    const page = await pdfDoc.getPage(pageIndex + 1);
    if (cancelled) return null;

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 canvas 2d 上下文');

    renderTask = page.render({ canvasContext: ctx, viewport });
    try {
      await renderTask!.promise;
    } catch (e: any) {
      if (e?.name === 'RenderingCancelledException' || cancelled) return null;
      throw e;
    }
    if (cancelled) return null;

    const tc = await page.getTextContent();
    if (cancelled) return null;

    // 解析每个内部字体 ID 对应的真实字体信息(并行,失败不阻塞)
    const fontIds = new Set<string>();
    for (const raw of tc.items) {
      const fid = (raw as any).fontName;
      if (typeof fid === 'string' && fid) fontIds.add(fid);
    }
    const fontInfoMap = new Map<string, ResolvedFontInfo>();
    await Promise.all(
      Array.from(fontIds).map(async (id) => {
        const info = await resolveFontInfo((page as any).commonObjs, id);
        if (info) fontInfoMap.set(id, info);
      })
    );
    if (cancelled) return null;

    // 一次性读出整页像素数据用于颜色采样;读取失败则跳过颜色识别
    let imageData: ImageData | null = null;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch {
      imageData = null;
    }

    const textItems: OriginalTextItem[] = tc.items
      .map((raw, idx) => {
        const it: any = raw;
        if (typeof it.str !== 'string') return null;
        const tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
        const fontHeightPx = Math.hypot(tx[1], tx[3]) || Math.abs(tx[3]);
        const widthPx = (it.width ?? 0) * scale;
        if (widthPx <= 0 || fontHeightPx <= 0) return null;
        const cssLeft = tx[4];
        const cssTop = tx[5] - fontHeightPx;
        const fid = typeof it.fontName === 'string' ? it.fontName : '';
        const fontInfo = fid ? fontInfoMap.get(fid) : undefined;
        const color = imageData
          ? sampleTextColor(imageData, cssLeft, cssTop, widthPx, fontHeightPx) ?? undefined
          : undefined;
        const item: OriginalTextItem = {
          id: `${pageIndex}-${idx}`,
          str: it.str,
          fontName: fid,
          cssLeft,
          cssTop,
          cssWidth: widthPx,
          cssHeight: fontHeightPx,
          fontSizePt: fontHeightPx / scale,
          ...(fontInfo ?? {}),
          color,
        };
        return item;
      })
      .filter((x): x is OriginalTextItem => x !== null && x.str.trim().length > 0);

    const native = page.getViewport({ scale: 1 });

    return {
      pageIndex,
      renderScale: scale,
      pdfWidth: native.width,
      pdfHeight: native.height,
      cssWidth: viewport.width,
      cssHeight: viewport.height,
      textItems,
    };
  })();

  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    },
  };
}
