import type { TextEdit, RGB } from '../types';

interface EditPropertiesPanelProps {
  edit: TextEdit;
  onChange: (edit: TextEdit) => void;
  onDelete: () => void;
  onClose: () => void;
}

function rgbToHex(c: RGB): string {
  const toH = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toH(c.r)}${toH(c.g)}${toH(c.b)}`;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return { r, g, b };
}

export function EditPropertiesPanel({
  edit,
  onChange,
  onDelete,
  onClose,
}: EditPropertiesPanelProps) {
  return (
    <div className="props-panel">
      <h3>{edit.kind === 'add' ? '新增文字' : '替换文字'}</h3>
      <div className="row">
        <label>字号 (pt)</label>
        <input
          type="number"
          min={4}
          max={200}
          step={0.5}
          value={Math.round(edit.fontSizePt * 10) / 10}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isFinite(v) || v <= 0) return;
            onChange({ ...edit, fontSizePt: v });
          }}
        />
      </div>
      <div className="row">
        <label>颜色</label>
        <input
          type="color"
          value={rgbToHex(edit.color)}
          onChange={(e) => onChange({ ...edit, color: hexToRgb(e.target.value) })}
        />
      </div>
      <button type="button" className="delete" onClick={onDelete}>
        删除此编辑
      </button>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <button
          type="button"
          style={{ padding: '4px 10px', fontSize: 12 }}
          onClick={onClose}
        >
          取消选择
        </button>
      </div>
    </div>
  );
}
