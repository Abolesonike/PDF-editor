import type { EditorMode } from '../types';

interface ToolbarProps {
  fileName: string | null;
  mode: EditorMode;
  hasPdf: boolean;
  busy: boolean;
  onFile: (file: File) => void;
  onToggleAdd: () => void;
  onExport: () => void;
}

export function Toolbar({
  fileName,
  mode,
  hasPdf,
  busy,
  onFile,
  onToggleAdd,
  onExport,
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
      <div className="spacer" />
      {fileName && <span className="file-name" title={fileName}>{fileName}</span>}
    </div>
  );
}
