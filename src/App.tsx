import { useEffect, useMemo, useRef, useState } from 'react';
import type { EditorState, PageInfo, TextEdit } from './types';
import { Toolbar } from './components/Toolbar';
import { PdfViewer } from './components/PdfViewer';
import { EditPropertiesPanel } from './components/EditPropertiesPanel';
import { exportPdf } from './pdf/exportPdf';

export default function App() {
  const [state, setState] = useState<EditorState>({
    fileName: null,
    originalBytes: null,
    pages: [],
    edits: [],
    mode: 'idle',
    selectedEditId: null,
  });
  const [busy, setBusy] = useState(false);
  const [freshAddId, setFreshAddId] = useState<string | null>(null);

  // 用 ref 跟最新 state,避免 onExport 中读到闭包旧值
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    setState({
      fileName: file.name,
      originalBytes: buf,
      pages: [],
      edits: [],
      mode: 'idle',
      selectedEditId: null,
    });
    setFreshAddId(null);
  };

  const upsertEdit = (edit: TextEdit) => {
    setState((s) => {
      const exists = s.edits.findIndex((e) => e.id === edit.id);
      const next = [...s.edits];
      if (exists >= 0) next[exists] = edit;
      else next.push(edit);
      return { ...s, edits: next, selectedEditId: edit.id };
    });
    // 新建的 edit(无论 add 还是 replace)都让文本框首次进入编辑态
    setFreshAddId(edit.id);
    setTimeout(() => setFreshAddId(null), 100);
  };

  const updateEdit = (edit: TextEdit) => {
    setState((s) => {
      const idx = s.edits.findIndex((e) => e.id === edit.id);
      if (idx < 0) return s;
      const next = [...s.edits];
      next[idx] = edit;
      return { ...s, edits: next };
    });
  };

  const deleteEdit = (id: string) => {
    setState((s) => ({
      ...s,
      edits: s.edits.filter((e) => e.id !== id),
      selectedEditId: s.selectedEditId === id ? null : s.selectedEditId,
    }));
  };

  const selectEdit = (id: string | null) => {
    setState((s) => ({ ...s, selectedEditId: id }));
  };

  const toggleAddMode = () => {
    setState((s) => ({
      ...s,
      mode: s.mode === 'addText' ? 'idle' : 'addText',
      selectedEditId: null,
    }));
  };

  const onExport = async () => {
    // 让当前正在编辑的 contenteditable 失焦,触发 onBlur 同步内容到 state
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // 等一帧让 React flush 所有 setState
    await new Promise<void>((r) => setTimeout(r, 0));
    const s = stateRef.current;
    if (!s.originalBytes) return;
    setBusy(true);
    try {
      await exportPdf(s.originalBytes, s.edits, s.fileName ?? 'document.pdf');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`导出失败:${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const selectedEdit = useMemo(
    () => state.edits.find((e) => e.id === state.selectedEditId) ?? null,
    [state.edits, state.selectedEditId]
  );

  const onPagesReady = (pages: PageInfo[]) => {
    setState((s) => ({ ...s, pages }));
  };

  return (
    <div className="app">
      <Toolbar
        fileName={state.fileName}
        mode={state.mode}
        hasPdf={!!state.originalBytes}
        busy={busy}
        onFile={onFile}
        onToggleAdd={toggleAddMode}
        onExport={onExport}
      />
      <PdfViewer
        bytes={state.originalBytes}
        mode={state.mode}
        edits={state.edits}
        selectedEditId={state.selectedEditId}
        freshAddId={freshAddId}
        onPagesReady={onPagesReady}
        onAddEdit={upsertEdit}
        onUpdateEdit={updateEdit}
        onSelectEdit={selectEdit}
      />
      {selectedEdit && (
        <EditPropertiesPanel
          edit={selectedEdit}
          onChange={updateEdit}
          onDelete={() => deleteEdit(selectedEdit.id)}
          onClose={() => selectEdit(null)}
        />
      )}
    </div>
  );
}
