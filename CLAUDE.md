# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — `tsc -b && vite build` (project references TS build, then bundle)
- `npm run preview` — preview the production build
- `npx tsc --noEmit` — typecheck without emitting (fastest sanity check)

There is no test framework, lint, or formatter configured. Don't add one unless asked.

## One-time setup

A Chinese font file must be placed in `public/fonts/` before exports work — without it, `loadChineseFontBytes` throws. `src/utils/font.ts` searches these candidates in order:

```
/fonts/static/NotoSansSC-Regular.ttf
/fonts/NotoSansSC-Regular.ttf
/fonts/NotoSansSC-Regular.otf
/fonts/NotoSansSC-VariableFont_wght.ttf
```

It validates each response by checking font magic bytes (TTF / OTTO / true / ttcf) so Vite's SPA fallback (returning `index.html` with HTTP 200) is rejected rather than crashing pdf-lib later with "Unknown font format".

## Architecture

### Two coordinate systems

This is the most important thing to internalize. There are two PDF coordinate systems in play:

| System | Origin | Unit | Used by |
|---|---|---|---|
| pdfjs viewport | top-left | CSS pixel | rendering, hit testing, DOM positioning |
| pdf-lib | bottom-left | PDF point (1/72 inch) | export (drawText, drawRectangle) |

Conversion happens **only** in `src/utils/coords.ts` (`cssRectToPdf`, `clickToPdfPoint`, `pdfPointToCss`). All edit data stored in state uses **PDF coordinates** (left-bottom origin, points). The Y-flip formula is `pdfY = (cssHeight - cssTop - height) / scale`. Don't reinvent this elsewhere.

`PageInfo.renderScale` (currently fixed at 1.5 in `PdfViewer.tsx`) is the multiplier between the two units — it's both the on-screen zoom and the CSS↔PDF conversion factor.

### Single source of truth for edits

`App.tsx` owns `EditorState.edits: TextEdit[]`. Every component emits changes via callbacks (`onAddEdit` / `onUpdateEdit` / `onSelectEdit` / `onDelete`); none keep their own copy. When adding new edit-affecting features, follow this pattern — do not introduce parallel state in `PageCanvas` or `NewTextBox`.

`TextEdit` is a discriminated union of `ReplaceEdit` and `AddEdit` (see `src/types.ts`). Note that `ReplaceEdit` has **two** position pairs:
- `bgX/bgY/bgWidth/bgHeight` — the white cover rectangle (frozen at the original textItem bbox, never moves)
- `pdfX/pdfY` — the new text position (draggable by the user; initially aligned with the original baseline)

This separation lets the user drag the replacement text without uncovering the original underneath. `AddEdit` only has `pdfX/pdfY`.

### Render → state → export pipeline

1. **Load** (`PdfViewer`): `loadPdf` calls `pdfjs.getDocument({ data: bytes.slice(0) })`. The `.slice(0)` is mandatory — pdfjs takes ownership of the buffer, and we must keep `originalBytes` intact in App state for export. Don't remove the slice.
2. **Render** (`PageCanvas` → `renderPage` in `src/pdf/render.ts`): renders one page to canvas, extracts `textItems` with pre-computed CSS bboxes. Returns a `CancellableRender` because React 18 StrictMode mounts effects twice — without cancellation, two render tasks race on the same canvas.
3. **Edit overlays** (`PageCanvas`): hit areas from `TextItemOverlay` (transparent divs over original glyphs, hidden once a `ReplaceEdit` exists for that id) + `NewTextBox` per edit (the contenteditable + drag handle, also draws the white cover for replace edits).
4. **Export** (`exportPdf.ts`): loads `originalBytes` *again* into pdf-lib (separate buffer from pdfjs's), embeds the Chinese font, draws white rect + new text for each replace, draws text for each add.

### contentEditable + React

`NewTextBox` is contentEditable. **Do not** render `{edit.text}` as a child while editing — React will rewrite the DOM and eat keystrokes / break the cursor. The current pattern:
- When `editing` is false, render `{edit.text}` (read-only display).
- When `editing` flips to true, a `useEffect` populates `el.innerText`, focuses, and selects. After that point React leaves the DOM alone; updates flow out via `onInput` / `onBlur`.

If you change the editing flow, preserve this invariant.

### Export-time state capture

`App.onExport` does this dance before reading edits:

```ts
if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
await new Promise<void>(r => setTimeout(r, 0));
const s = stateRef.current;  // not the closure-captured `state`
```

Reason: clicking the export button while a contenteditable is focused doesn't fire its blur synchronously, so the latest text hasn't reached state yet. We force the blur, wait one macrotask for React to flush, then read from `stateRef` (synced via effect) rather than the closure. Don't simplify this — the bug it fixes (export missing the user's last keystrokes) is hard to notice.

## Pitfalls already encountered (do not regress)

- **`subset: false` in `embedFont`** (`exportPdf.ts`): fontkit's subsetter drops critical tables from large CJK fonts like NotoSansSC, producing white/invisible glyphs that are still selectable. The cost is ~10MB per exported PDF, but it's required for correctness.
- **pdfjs textItem bbox covers ascent only**, not descent. Replace edits in `PageCanvas.handleClickOriginalText` pad the cover bbox with `PAD_TOP=1`, `PAD_BOTTOM=max(2, cssHeight*0.25)`, `PAD_X=1` (CSS px) and shift `pdfY` up by `PAD_BOTTOM/scale` so the new-text baseline still aligns with the original. If glyph descenders show through the cover, increase PAD_BOTTOM.
- **`bytes.slice(0)` for buffer ownership** — pdfjs and pdf-lib each need their own `ArrayBuffer`.
- **pdfjs worker via `?url`** — `pdfjsSetup.ts` imports `pdf.worker.min.mjs?url` and assigns to `GlobalWorkerOptions.workerSrc`. Required for Vite to bundle the worker as a separate asset. `vite.config.ts` also has `worker: { format: 'es' }` and `optimizeDeps.include: ['pdfjs-dist']`.

## File responsibilities

- `src/App.tsx` — owns `EditorState`, `stateRef`, all dispatch callbacks. Smallest file that's worth understanding before changing anything else.
- `src/pdf/render.ts` — pdfjs side. Adapts pdfjs internals into our `PageInfo` / `OriginalTextItem` shape.
- `src/pdf/exportPdf.ts` — pdf-lib side. The only place `pdf-lib` is touched.
- `src/utils/coords.ts` — coordinate conversions (the only ones).
- `src/components/PageCanvas.tsx` — per-page DOM, decides when to spawn a ReplaceEdit vs select an existing one.
- `src/components/NewTextBox.tsx` — drag + contentEditable + white cover rendering.
