"use client";

import { useState } from "react";
import { BLOCK_GROUPS, newBlock, type Block, type BlockType } from "@/lib/blocks";

const LABEL: Record<string, string> = {};
BLOCK_GROUPS.forEach((g) => g.types.forEach((t) => { LABEL[t.type] = t.label; }));

function moveItem<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const [adding, setAdding] = useState(false);

  function add(type: BlockType) {
    onChange([...(blocks || []), newBlock(type)]);
    setAdding(false);
  }
  function update(id: string, data: Record<string, string>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...data } } : b)));
  }
  function remove(id: string) { onChange(blocks.filter((b) => b.id !== id)); }
  function reorder(i: number, dir: -1 | 1) { onChange(moveItem(blocks, i, dir)); }

  return (
    <div className="space-y-3">
      {(blocks || []).map((b, i) => (
        <div key={b.id} className="rounded-lg border border-gray-100 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{LABEL[b.type] ?? b.type}</span>
            <div className="flex gap-1 text-gray-400">
              <button onClick={() => reorder(i, -1)} title="Up">↑</button>
              <button onClick={() => reorder(i, 1)} title="Down">↓</button>
              <button onClick={() => remove(b.id)} title="Delete" className="text-red-500">🗑</button>
            </div>
          </div>
          <BlockFields block={b} onUpdate={(d) => update(b.id, d)} />
        </div>
      ))}

      {adding ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-3">
          {BLOCK_GROUPS.map((g) => (
            <div key={g.group} className="mb-2">
              <p className="text-xs font-semibold uppercase text-gray-400">{g.group}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {g.types.map((t) => (
                  <button key={t.type} onClick={() => add(t.type)} className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:border-brand-blue hover:text-brand-blue">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setAdding(false)} className="mt-1 text-xs text-gray-400">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-blue hover:text-brand-blue">
          + Add Block
        </button>
      )}
    </div>
  );
}

function Field({ ph, value, onChange, area }: { ph: string; value?: string; onChange: (v: string) => void; area?: boolean }) {
  return area ? (
    <textarea placeholder={ph} defaultValue={value} onBlur={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm" />
  ) : (
    <input placeholder={ph} defaultValue={value} onBlur={(e) => onChange(e.target.value)} className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm" />
  );
}

function BlockFields({ block, onUpdate }: { block: Block; onUpdate: (d: Record<string, string>) => void }) {
  const d = block.data || {};
  switch (block.type) {
    case "heading":
    case "subheading":
      return <Field ph="Heading text" value={d.text} onChange={(v) => onUpdate({ text: v })} />;
    case "paragraph":
    case "quote":
    case "callout":
      return <Field ph="Text" value={d.text} onChange={(v) => onUpdate({ text: v })} area />;
    case "divider":
      return <p className="text-xs text-gray-400">A horizontal divider.</p>;
    case "image":
      return (
        <div className="space-y-2">
          <Field ph="Image URL" value={d.url} onChange={(v) => onUpdate({ url: v })} />
          <Field ph="Caption (optional)" value={d.caption} onChange={(v) => onUpdate({ caption: v })} />
        </div>
      );
    case "youtube":
      return <Field ph="YouTube video ID" value={d.video_id} onChange={(v) => onUpdate({ video_id: v })} />;
    case "video":
      return <Field ph="Video file URL" value={d.url} onChange={(v) => onUpdate({ url: v })} />;
    case "pdf":
    case "file":
      return (
        <div className="space-y-2">
          <Field ph="File URL" value={d.url} onChange={(v) => onUpdate({ url: v })} />
          <Field ph="Label (optional)" value={d.label} onChange={(v) => onUpdate({ label: v })} />
        </div>
      );
    case "quiz":
      return (
        <div className="space-y-2">
          <Field ph="Question" value={d.question} onChange={(v) => onUpdate({ question: v })} />
          <Field ph="Options (one per line)" value={d.options} onChange={(v) => onUpdate({ options: v })} area />
        </div>
      );
    default:
      return null;
  }
}
