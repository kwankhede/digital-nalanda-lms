import type { Block } from "@/lib/blocks";

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="space-y-4">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  const d = block.data || {};
  switch (block.type) {
    case "heading":
      return <h2 className="text-2xl font-extrabold text-brand-navy">{d.text}</h2>;
    case "subheading":
      return <h3 className="text-lg font-bold text-brand-navy">{d.text}</h3>;
    case "paragraph":
      return <p className="whitespace-pre-line leading-relaxed text-gray-700">{d.text}</p>;
    case "quote":
      return <blockquote className="border-l-4 border-brand-orange pl-4 italic text-brand-navy">“{d.text}”</blockquote>;
    case "callout":
      return <div className="rounded-lg bg-blue-50 p-4 text-brand-navy">💡 {d.text}</div>;
    case "divider":
      return <hr className="border-gray-200" />;
    case "image":
      return d.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.url} alt={d.caption || ""} className="w-full rounded-lg" />
      ) : null;
    case "youtube":
      return d.video_id ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${d.video_id}`} title="Video" allowFullScreen />
        </div>
      ) : null;
    case "video":
      return d.url ? <video controls src={d.url} className="w-full rounded-lg" /> : null;
    case "pdf":
    case "file":
      return d.url ? (
        <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-brand-blue hover:bg-gray-50">
          📄 {d.label || (block.type === "pdf" ? "Open PDF" : "Download file")}
        </a>
      ) : null;
    case "quiz":
      return (
        <div className="rounded-lg border border-gray-100 p-4">
          <p className="font-semibold text-brand-navy">❓ {d.question}</p>
          {(d.options || "").split("\n").filter(Boolean).map((opt, i) => (
            <label key={i} className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input type="radio" name={`q-${block.id}`} disabled /> {opt}
            </label>
          ))}
        </div>
      );
    default:
      return null;
  }
}
