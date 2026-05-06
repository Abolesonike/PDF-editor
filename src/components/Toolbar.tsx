import type { EditorMode } from '../types';

interface ToolbarProps {
  fileName: string | null;
  mode: EditorMode;
  hasPdf: boolean;
  busy: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onFile: (file: File) => void;
  onToggleAdd: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function Toolbar({
  fileName,
  mode,
  hasPdf,
  busy,
  canUndo,
  canRedo,
  onFile,
  onToggleAdd,
  onExport,
  onUndo,
  onRedo,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <h1>PDF 编辑器</h1>
      <label className="btn">
        上传 PDF
        <input
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
      </label>
      <button
        type="button"
        disabled={!hasPdf}
        className={mode === 'addText' ? 'active' : ''}
        onClick={onToggleAdd}
      >
        {mode === 'addText' ? '退出添加' : '添加文字'}
      </button>
      <button type="button" disabled={!hasPdf || busy} onClick={onExport}>
        {busy ? '导出中…' : '导出 PDF'}
      </button>
      <button type="button" disabled={!canUndo} onClick={onUndo}>
        撤销
      </button>
      <button type="button" disabled={!canRedo} onClick={onRedo}>
        重做
      </button>
      <div className="spacer" />
      {fileName && <span className="file-name" title={fileName}>{fileName}</span>}
    </div>
  );
}
