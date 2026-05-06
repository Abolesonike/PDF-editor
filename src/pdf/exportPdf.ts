import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { loadFontBytes, loadChineseFontBytes, DEFAULT_FONT_NAME } from '../utils/font';
import type { TextEdit, FontManifestItem } from '../types';

export async function exportPdf(
  originalBytes: ArrayBuffer,
  edits: TextEdit[],
  fontManifest: FontManifestItem[],
  fileName: string
): Promise<void> {
  const doc = await PDFDocument.load(originalBytes.slice(0));
  doc.registerFontkit(fontkit);

  const embeddedFonts = new Map<string, import('pdf-lib').PDFFont>();

  for (const e of edits) {
    const fontName = e.fontName;
    if (embeddedFonts.has(fontName)) continue;
    const entry = fontManifest.find((f) => f.name === fontName);
    const bytes = entry ? await loadFontBytes(entry.path) : await loadChineseFontBytes();
    const font = await doc.embedFont(bytes, { subset: false });
    embeddedFonts.set(fontName, font);
  }

  for (const e of edits) {
    const page = doc.getPage(e.pageIndex);
    const color = rgb(e.color.r, e.color.g, e.color.b);
    const font = embeddedFonts.get(e.fontName)!;

    if (e.kind === 'replace') {
      page.drawRectangle({
        x: e.bgX,
        y: e.bgY,
        width: e.bgWidth,
        height: e.bgHeight,
        color: rgb(1, 1, 1),
      });
      if (e.text.length > 0) {
        page.drawText(e.text, {
          x: e.pdfX,
          y: e.pdfY,
          size: e.fontSizePt,
          font,
          color,
        });
      }
    } else {
      if (e.text.length > 0) {
        page.drawText(e.text, {
          x: e.pdfX,
          y: e.pdfY,
          size: e.fontSizePt,
          font,
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
