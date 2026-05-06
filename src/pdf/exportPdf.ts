import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { loadChineseFontBytes } from '../utils/font';
import type { TextEdit } from '../types';

export async function exportPdf(
  originalBytes: ArrayBuffer,
  edits: TextEdit[],
  fileName: string
): Promise<void> {
  const doc = await PDFDocument.load(originalBytes.slice(0));
  doc.registerFontkit(fontkit);

  const fontBytes = await loadChineseFontBytes();
  // 注意:NotoSansSC 等大字体在 fontkit subset 后会丢失关键字体表导致渲染异常,
  // 因此这里 subset: false,代价是每个导出 PDF 多出约 10MB 字体数据。
  const cnFont = await doc.embedFont(fontBytes, { subset: false });

  for (const e of edits) {
    const page = doc.getPage(e.pageIndex);
    const color = rgb(e.color.r, e.color.g, e.color.b);

    if (e.kind === 'replace') {
      // 1. 在原文字 bbox 处铺白底覆盖
      page.drawRectangle({
        x: e.bgX,
        y: e.bgY,
        width: e.bgWidth,
        height: e.bgHeight,
        color: rgb(1, 1, 1),
      });
      // 2. 在新位置(可被拖动)绘制新文字
      if (e.text.length > 0) {
        page.drawText(e.text, {
          x: e.pdfX,
          y: e.pdfY,
          size: e.fontSizePt,
          font: cnFont,
          color,
        });
      }
    } else {
      if (e.text.length > 0) {
        page.drawText(e.text, {
          x: e.pdfX,
          y: e.pdfY,
          size: e.fontSizePt,
          font: cnFont,
          color,
        });
      }
    }
  }

  const out = await doc.save();
  const blob = new Blob([out as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const base = fileName.replace(/\.pdf$/i, '');
  a.download = `${base || 'edited'}_edited.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
