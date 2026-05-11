import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import type { EditorState, PageInfo, TextEdit, FontManifestItem } from './types';
import { Toolbar } from './components/Toolbar';
import { PdfViewer } from './components/PdfViewer';
import { EditPropertiesPanel } from './components/EditPropertiesPanel';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { exportPdf } from './pdf/exportPdf';
import { fetchFontManifest, injectFontFaces } from './utils/font';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

function HomePage() {
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
  const [fontManifest, setFontManifest] = useState<FontManifestItem[]>([]);
  const [history, setHistory] = useState<{ past: EditorState[]; future: EditorState[] }>({
    past: [],
    future: [],
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function snapshot(s: EditorState): EditorState {
    return {
      ...s,
      edits: s.edits.map((e) => ({ ...e })),
    };
  }

  const commit = useCallback(() => {
    setHistory((h) => ({
      past: [...h.past, snapshot(stateRef.current)],
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      const current = snapshot(stateRef.current);
      setState(previous);
      return { past: newPast, future: [current, ...h.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      const current = snapshot(stateRef.current);
      setState(next);
      return { past: [...h.past, current], future: newFuture };
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active?.getAttribute('contenteditable') === 'true') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  useEffect(() => {
    fetchFontManifest()
      .then((m) => {
        setFontManifest(m);
        injectFontFaces(m);
      })
      .catch((err) => console.error('加载字体清单失败:', err));
  }, []);

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
    commit();
    setState((s) => {
      const exists = s.edits.findIndex((e) => e.id === edit.id);
      const next = [...s.edits];
      if (exists >= 0) next[exists] = edit;
      else next.push(edit);
      return { ...s, edits: next, selectedEditId: edit.id };
    });
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
    commit();
    setState((s) => ({
      ...s,
      edits: s.edits.filter((e) => e.id !== id),
      selectedEditId: s.selectedEditId === id ? null : s.selectedEditId,
    }));
  };

  const onCommitEdit = useCallback(() => {
    setTimeout(() => commit(), 0);
  }, [commit]);

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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await new Promise<void>((r) => setTimeout(r, 0));
    const s = stateRef.current;
    if (!s.originalBytes) return;
    setBusy(true);
    try {
      await exportPdf(s.originalBytes, s.edits, fontManifest, s.fileName ?? 'document.pdf');
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
    <>
      <Toolbar
        fileName={state.fileName}
        mode={state.mode}
        hasPdf={!!state.originalBytes}
        busy={busy}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        onFile={onFile}
        onToggleAdd={toggleAddMode}
        onExport={onExport}
        onUndo={undo}
        onRedo={redo}
      />
      <PdfViewer
        bytes={state.originalBytes}
        mode={state.mode}
        edits={state.edits}
        selectedEditId={state.selectedEditId}
        freshAddId={freshAddId}
        fontManifest={fontManifest}
        onPagesReady={onPagesReady}
        onAddEdit={upsertEdit}
        onUpdateEdit={updateEdit}
        onSelectEdit={selectEdit}
        onCommitEdit={onCommitEdit}
      />
      {selectedEdit && (
        <EditPropertiesPanel
          edit={selectedEdit}
          manifest={fontManifest}
          onChange={updateEdit}
          onCommit={onCommitEdit}
          onDelete={() => deleteEdit(selectedEdit.id)}
          onClose={() => selectEdit(null)}
        />
      )}
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isLegalPage = location.pathname !== '/';

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      {!isLegalPage && <CookieConsent />}
      <Footer />
    </div>
  );
}
