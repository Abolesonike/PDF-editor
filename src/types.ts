export interface OriginalTextItem {
  id: string;
  str: string;
  fontName: string;
  cssLeft: number;
  cssTop: number;
  cssWidth: number;
  cssHeight: number;
  fontSizePt: number;
}

export interface PageInfo {
  pageIndex: number;
  pdfWidth: number;
  pdfHeight: number;
  renderScale: number;
  cssWidth: number;
  cssHeight: number;
  textItems: OriginalTextItem[];
}

export type RGB = { r: number; g: number; b: number };

export type ReplaceEdit = {
  kind: 'replace';
  id: string;
  pageIndex: number;
  text: string;
  // 白底覆盖原文字的 bbox（PDF 坐标，初始值 = 原 textItem 位置，不会随拖动变化）
  bgX: number;
  bgY: number;
  bgWidth: number;
  bgHeight: number;
  // 新文字位置（PDF 坐标，可被用户拖动）
  pdfX: number;
  pdfY: number;
  fontSizePt: number;
  color: RGB;
};

export type AddEdit = {
  kind: 'add';
  id: string;
  pageIndex: number;
  text: string;
  pdfX: number;
  pdfY: number;
  fontSizePt: number;
  color: RGB;
};

export type TextEdit = ReplaceEdit | AddEdit;

export type EditorMode = 'idle' | 'addText';

export interface EditorState {
  fileName: string | null;
  originalBytes: ArrayBuffer | null;
  pages: PageInfo[];
  edits: TextEdit[];
  mode: EditorMode;
  selectedEditId: string | null;
}
