import type { PageInfo } from '../types';

export function cssRectToPdf(
  rect: { left: number; top: number; width: number; height: number },
  page: PageInfo
) {
  const s = page.renderScale;
  return {
    pdfX: rect.left / s,
    pdfY: (page.cssHeight - rect.top - rect.height) / s,
    pdfWidth: rect.width / s,
    pdfHeight: rect.height / s,
  };
}

export function clickToPdfPoint(cssX: number, cssY: number, page: PageInfo) {
  const s = page.renderScale;
  return { pdfX: cssX / s, pdfY: (page.cssHeight - cssY) / s };
}

export function pdfPointToCss(pdfX: number, pdfY: number, page: PageInfo) {
  const s = page.renderScale;
  return { cssX: pdfX * s, cssY: page.cssHeight - pdfY * s };
}
