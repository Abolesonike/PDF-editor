import type { EditorMode, OriginalTextItem } from '../types';

interface TextItemOverlayProps {
  items: OriginalTextItem[];
  replacedItemIds: Set<string>;
  mode: EditorMode;
  onClickItem: (item: OriginalTextItem) => void;
}

export function TextItemOverlay({
  items,
  replacedItemIds,
  mode,
  onClickItem,
}: TextItemOverlayProps) {
  const isAdd = mode === 'addText';
  return (
    <>
      {items.map((it) => {
        if (replacedItemIds.has(it.id)) return null;
        return (
          <div
            key={it.id}
            className="text-hit"
            style={{
              left: it.cssLeft,
              top: it.cssTop,
              width: it.cssWidth,
              height: it.cssHeight,
              pointerEvents: isAdd ? 'none' : 'auto',
            }}
            onMouseDown={(e) => {
              if (isAdd) return;
              e.stopPropagation();
              onClickItem(it);
            }}
            title={it.str}
          />
        );
      })}
    </>
  );
}
