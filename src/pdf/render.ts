import { pdfjsLib } from './pdfjsSetup';
import type { PageInfo, OriginalTextItem } from '../types';

export type PdfDocProxy = Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>;

export async function loadPdf(bytes: ArrayBuffer): Promise<PdfDocProxy> {
  // 复制一份给 pdfjs，原始 bytes 留给 pdf-lib 导出时使用
  const copy = bytes.slice(0);
  return pdfjsLib.getDocument({ data: copy }).promise;
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

    const textItems: OriginalTextItem[] = tc.items
      .map((raw, idx) => {
        const it: any = raw;
        if (typeof it.str !== 'string') return null;
        const tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
        const fontHeightPx = Math.hypot(tx[1], tx[3]) || Math.abs(tx[3]);
        const widthPx = (it.width ?? 0) * scale;
        if (widthPx <= 0 || fontHeightPx <= 0) return null;
        const item: OriginalTextItem = {
          id: `${pageIndex}-${idx}`,
          str: it.str,
          fontName: it.fontName ?? '',
          cssLeft: tx[4],
          cssTop: tx[5] - fontHeightPx,
          cssWidth: widthPx,
          cssHeight: fontHeightPx,
          fontSizePt: fontHeightPx / scale,
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
