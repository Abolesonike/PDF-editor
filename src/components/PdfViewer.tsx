import { useEffect, useState } from 'react';
import type { EditorMode, FontManifestItem, PageInfo, TextEdit } from '../types';
import { loadPdf, type PdfDocProxy } from '../pdf/render';
import { PageCanvas } from './PageCanvas';
import { LandingContent } from './LandingContent';

const RENDER_SCALE = 1.5;

interface PdfViewerProps {
  bytes: ArrayBuffer | null;
  mode: EditorMode;
  edits: TextEdit[];
  selectedEditId: string | null;
  freshAddId: string | null;
  fontManifest: FontManifestItem[];
  onFile: (file: File) => void;
  onPagesReady: (pages: PageInfo[]) => void;
  onAddEdit: (edit: TextEdit) => void;
  onUpdateEdit: (edit: TextEdit) => void;
  onSelectEdit: (id: string | null) => void;
  onCommitEdit: () => void;
}

export function PdfViewer({
  bytes,
  mode,
  edits,
  selectedEditId,
  freshAddId,
  fontManifest,
  onFile,
  onPagesReady,
  onAddEdit,
  onUpdateEdit,
  onSelectEdit,
  onCommitEdit,
}: PdfViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PdfDocProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageInfos, setPageInfos] = useState<Record<number, PageInfo>>({});

  useEffect(() => {
    setPageInfos({});
    if (!bytes) {
      setPdfDoc(null);
      setNumPages(0);
      return;
    }
    let cancelled = false;
    (async () => {
      const doc = await loadPdf(bytes);
      if (cancelled) return;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
    })();
    return () => {
      cancelled = true;
    };
  }, [bytes]);

  useEffect(() => {
    if (numPages === 0) return;
    const arr: PageInfo[] = [];
    for (let i = 0; i < numPages; i++) {
      if (pageInfos[i]) arr.push(pageInfos[i]);
    }
    if (arr.length === numPages) {
      arr.sort((a, b) => a.pageIndex - b.pageIndex);
      onPagesReady(arr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfos, numPages]);

  if (!bytes) {
    return (
      <div className="viewer">
        <LandingContent onFile={onFile} />
      </div>
    );
  }

  if (!pdfDoc) {
    return (
      <div className="viewer">
        <div className="empty">正在加载 PDF…</div>
      </div>
    );
  }

  return (
    <div className="viewer">
      {Array.from({ length: numPages }, (_, i) => (
        <PageCanvas
          key={i}
          pdfDoc={pdfDoc}
          pageIndex={i}
          scale={RENDER_SCALE}
          mode={mode}
          edits={edits}
          selectedEditId={selectedEditId}
          freshAddId={freshAddId}
          fontManifest={fontManifest}
          onPageReady={(info) =>
            setPageInfos((prev) => ({ ...prev, [info.pageIndex]: info }))
          }
          onAddEdit={onAddEdit}
          onUpdateEdit={onUpdateEdit}
          onSelectEdit={onSelectEdit}
          onCommitEdit={onCommitEdit}
        />
      ))}
    </div>
  );
}
