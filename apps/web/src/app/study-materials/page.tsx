import type { Metadata } from "next";
import { getStudyMaterials, type StudyMaterialDTO } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Study Materials | Digital Nalanda",
  description:
    "Free study materials, notes, worksheets and resources from Digital Nalanda — open to every learner.",
};

const TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  doc: "Document",
  slides: "Slides",
  video: "Video",
  link: "Link",
  other: "Resource",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="shrink-0 rounded-full bg-nal-saffron/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-nal-saffron">
      {TYPE_LABEL[type] ?? "Resource"}
    </span>
  );
}

function Card({ m }: { m: StudyMaterialDTO }) {
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-nal-border bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-nal-saffron/50 hover:shadow-lift"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold text-nal-navy">{m.title}</h3>
          <TypeBadge type={m.resource_type} />
        </div>
        {m.description && <p className="mt-1 text-sm text-nal-slate">{m.description}</p>}
      </div>
      <span
        aria-hidden
        className="mt-1 shrink-0 text-nal-saffron transition-transform duration-300 group-hover:translate-x-0.5"
      >
        ↗
      </span>
    </a>
  );
}

export default async function StudyMaterialsPage() {
  const materials = await getStudyMaterials();

  // Group by category, preserving the API's ordering.
  const groups = new Map<string, StudyMaterialDTO[]>();
  for (const m of materials) {
    const key = m.category?.trim() || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">Resources</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">
          Study Materials
        </h1>
        <p className="mt-3 max-w-2xl text-nal-slate">
          Free notes, worksheets, slides and resources to support your learning — open to everyone.
        </p>

        {materials.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-nal-border bg-white/50 p-8 text-center text-nal-slate">
            Study materials will appear here soon — check back shortly.
          </p>
        ) : (
          <div className="mt-10 space-y-10">
            {Array.from(groups.entries()).map(([category, items]) => (
              <section key={category}>
                <div className="flex items-baseline justify-between border-b border-nal-border pb-2">
                  <h2 className="font-display text-xl font-bold text-nal-navy md:text-2xl">{category}</h2>
                  <span className="text-sm text-nal-slate">{items.length}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {items.map((m) => <Card key={m.id} m={m} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
