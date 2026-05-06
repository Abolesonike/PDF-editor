import { useEffect, useRef, useState } from 'react';
import type {
  AddEdit,
  EditorMode,
  OriginalTextItem,
  PageInfo,
  ReplaceEdit,
  TextEdit,
} from '../types';
import type { PdfDocProxy } from '../pdf/render';
import { renderPage } from '../pdf/render';
import { clickToPdfPoint, cssRectToPdf } from '../utils/coords';
import { uid } from '../utils/id';
import { DEFAULT_FONT_NAME } from '../utils/font';
import { TextItemOverlay } from './TextItemOverlay';
import { NewTextBox } from './NewTextBox';

interface PageCanvasProps {
  pdfDoc: PdfDocProxy;
  pageIndex: number;
  scale: number;
  mode: EditorMode;
  edits: TextEdit[];
  selectedEditId: string | null;
  freshAddId: string | null;
  onPageReady: (info: PageInfo) => void;
  onAddEdit: (edit: TextEdit) => void;
  onUpdateEdit: (edit: TextEdit) => void;
  onSelectEdit: (id: string | null) => void;
  onCommitEdit: () => void;
}

export function PageCanvas({
  pdfDoc,
  pageIndex,
  scale,
  mode,
  edits,
  selectedEditId,
  freshAddId,
  onPageReady,
  onAddEdit,
  onUpdateEdit,
  onSelectEdit,
  onCommitEdit,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState<PageInfo | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const task = renderPage(pdfDoc, pageIndex, scale, canvas);
    task.promise
      .then((info) => {
        if (info) {
          setPage(info);
          onPageReady(info);
        }
      })
      .catch((err) => {
        console.error(`渲染第 ${pageIndex + 1} 页失败:`, err);
      });
    return () => {
      task.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageIndex, scale]);

  const replacedIds = new Set<string>();
  const pageEdits: TextEdit[] = [];
  for (const e of edits) {
    if (e.pageIndex !== pageIndex) continue;
    pageEdits.push(e);
    if (e.kind === 'replace') replacedIds.add(e.id);
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!page) return;
    if (mode === 'addText') {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;
      const pt = clickToPdfPoint(cssX, cssY, page);
      const newEdit: AddEdit = {
        kind: 'add',
        id: uid(),
        pageIndex,
        text: '点击编辑',
        pdfX: pt.pdfX,
        pdfY: pt.pdfY,
        fontSizePt: 14,
        color: { r: 0, g: 0, b: 0 },
        fontName: DEFAULT_FONT_NAME,
      };
      onAddEdit(newEdit);
    } else {
      onSelectEdit(null);
    }
  };

  const handleClickOriginalText = (item: OriginalTextItem) => {
    if (!page) return;
    if (mode === 'addText') return;
    // 已有对应的 ReplaceEdit:仅选中,不重置内容/位置
    const existing = pageEdits.find((e) => e.id === item.id);
    if (existing) {
      onSelectEdit(existing.id);
      return;
    }
    // pdfjs 报的 textItem 高度只覆盖 ascent,需向四周加 padding 才能盖住 descent 与 hinting 残影
    const PAD_X = 1;
    const PAD_TOP = 1;
    const PAD_BOTTOM = Math.max(2, item.cssHeight * 0.25);
    const rect = cssRectToPdf(
      {
        left: item.cssLeft - PAD_X,
        top: item.cssTop - PAD_TOP,
        width: item.cssWidth + 2 * PAD_X,
        height: item.cssHeight + PAD_TOP + PAD_BOTTOM,
      },
      page
    );
    const newEdit: ReplaceEdit = {
      kind: 'replace',
      id: item.id,
      pageIndex,
      text: item.str,
      bgX: rect.pdfX,
      bgY: rect.pdfY,
      bgWidth: rect.pdfWidth,
      bgHeight: rect.pdfHeight,
      pdfX: rect.pdfX + PAD_X / page.renderScale,
      pdfY: rect.pdfY + PAD_BOTTOM / page.renderScale,
      fontSizePt: item.fontSizePt,
      color: { r: 0, g: 0, b: 0 },
      fontName: DEFAULT_FONT_NAME,
    };
    onAddEdit(newEdit);
  };

  return (
    <div
      className="page-wrapper"
      style={{ width: page?.cssWidth, height: page?.cssHeight }}
    >
      <canvas ref={canvasRef} />
      {page && (
        <div
          className={`overlay ${mode === 'addText' ? 'add-mode' : ''}`}
          onMouseDown={handleOverlayClick}
        >
          <TextItemOverlay
            items={page.textItems}
            replacedItemIds={replacedIds}
            mode={mode}
            onClickItem={handleClickOriginalText}
          />
          {pageEdits.map((ed) => (
            <NewTextBox
              key={ed.id}
              edit={ed}
              page={page}
              isSelected={selectedEditId === ed.id}
              isFresh={freshAddId === ed.id}
              onChange={onUpdateEdit}
              onCommit={onCommitEdit}
              onSelect={() => onSelectEdit(ed.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
