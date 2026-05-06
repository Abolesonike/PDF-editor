import { useEffect, useRef, useState } from 'react';
import type { PageInfo, TextEdit } from '../types';
import { pdfPointToCss, clickToPdfPoint } from '../utils/coords';

interface NewTextBoxProps {
  edit: TextEdit;
  page: PageInfo;
  isSelected: boolean;
  isFresh: boolean;
  onChange: (edit: TextEdit) => void;
  onSelect: () => void;
}

export function NewTextBox({
  edit,
  page,
  isSelected,
  isFresh,
  onChange,
  onSelect,
}: NewTextBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(isFresh);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );

  // 文字基线位置 (pdfX, pdfY) → CSS 左上角
  const fontPx = edit.fontSizePt * page.renderScale;
  const baseline = pdfPointToCss(edit.pdfX, edit.pdfY, page);
  const cssLeft = baseline.cssX;
  const cssTop = baseline.cssY - fontPx;

  // 进入编辑态：把当前 edit.text 放进 DOM，并 focus + 全选
  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.innerText = edit.text;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (editing) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    onSelect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: edit.pdfX,
      origY: edit.pdfY,
    };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const orig = pdfPointToCss(dragRef.current.origX, dragRef.current.origY, page);
      const next = clickToPdfPoint(orig.cssX + dx, orig.cssY + dy, page);
      onChange({ ...edit, pdfX: next.pdfX, pdfY: next.pdfY } as TextEdit);
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  const finishEditing = () => {
    const el = ref.current;
    const newText = el?.innerText ?? '';
    if (newText !== edit.text) {
      onChange({ ...edit, text: newText } as TextEdit);
    }
    setEditing(false);
  };

  // 替换原文字时,在原 bbox 位置渲染白底覆盖原 PDF 内容
  const cover =
    edit.kind === 'replace'
      ? {
          left: edit.bgX * page.renderScale,
          top: page.cssHeight - (edit.bgY + edit.bgHeight) * page.renderScale,
          width: edit.bgWidth * page.renderScale,
          height: edit.bgHeight * page.renderScale,
        }
      : null;

  return (
    <>
      {cover && (
        <div
          className="replace-cover"
          style={{
            position: 'absolute',
            left: cover.left,
            top: cover.top,
            width: cover.width,
            height: cover.height,
            background: '#ffffff',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        ref={ref}
        className={`new-text-box ${isSelected ? 'selected' : ''}`}
        contentEditable={editing}
        suppressContentEditableWarning
        style={{
          left: cssLeft,
          top: cssTop,
          fontSize: fontPx,
          lineHeight: `${fontPx}px`,
          color: `rgb(${edit.color.r * 255}, ${edit.color.g * 255}, ${edit.color.b * 255})`,
        }}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onInput={(e) => {
          if (!editing) return;
          const newText = (e.currentTarget as HTMLDivElement).innerText;
          if (newText !== edit.text) {
            onChange({ ...edit, text: newText } as TextEdit);
          }
        }}
        onBlur={finishEditing}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            (e.target as HTMLDivElement).blur();
          }
        }}
      >
        {editing ? null : edit.text}
      </div>
    </>
  );
}
