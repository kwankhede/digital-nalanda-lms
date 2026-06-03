export type BlockType =
  | "heading" | "subheading" | "paragraph" | "quote" | "callout" | "divider"
  | "image" | "youtube" | "video" | "pdf" | "file"
  | "quiz";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, string>;
}

export const BLOCK_GROUPS: { group: string; types: { type: BlockType; label: string }[] }[] = [
  {
    group: "Text",
    types: [
      { type: "heading", label: "Heading" },
      { type: "subheading", label: "Subheading" },
      { type: "paragraph", label: "Paragraph" },
      { type: "quote", label: "Quote" },
      { type: "callout", label: "Callout" },
      { type: "divider", label: "Divider" },
    ],
  },
  {
    group: "Media",
    types: [
      { type: "image", label: "Image" },
      { type: "youtube", label: "YouTube" },
      { type: "video", label: "Video" },
      { type: "pdf", label: "PDF" },
      { type: "file", label: "Downloadable file" },
    ],
  },
  {
    group: "Learning",
    types: [{ type: "quiz", label: "Quiz question" }],
  },
];

export function newBlock(type: BlockType): Block {
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, type, data: {} };
}
