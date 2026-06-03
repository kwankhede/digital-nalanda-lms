import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEducator } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const e = await getEducator(params.slug);
  if (!e) return { title: "Mentor | Digital Nalanda" };
  return { title: `${e.name} | Digital Nalanda`, description: e.bio || e.expertise };
}

export default async function EducatorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const e = await getEducator(params.slug);
  if (!e) notFound();

  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <Link href="/educators" className="text-sm font-semibold text-nal-saffron hover:underline">
          ← All educators
        </Link>

        <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {e.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.photo_url}
              alt={e.name}
              className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-2 ring-nal-parchment"
            />
          ) : (
            <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-nal-navy text-4xl font-bold text-white">
              {e.name.charAt(0)}
            </span>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-nal-navy">{e.name}</h1>
            {e.title && <p className="text-nal-slate">{e.title}</p>}
            {e.expertise && <p className="mt-1 font-semibold text-nal-saffron">{e.expertise}</p>}
            {e.school && (
              <span className="mt-3 inline-block rounded-full bg-nal-parchment px-3 py-1 text-xs font-semibold text-nal-navy">
                {e.school}
              </span>
            )}
          </div>
        </div>

        {(e.long_bio || e.bio) && (
          <div className="mt-8 rounded-2xl border border-nal-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-nal-navy">About</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-nal-slate">
              {e.long_bio || e.bio}
            </p>
          </div>
        )}

        {(e.linkedin_url || e.website_url) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {e.linkedin_url && (
              <a href={e.linkedin_url} target="_blank" rel="noopener noreferrer"
                 className="rounded-md border border-nal-border bg-white px-4 py-2 text-sm font-semibold text-nal-navy transition hover:border-nal-saffron hover:text-nal-saffron">
                LinkedIn ↗
              </a>
            )}
            {e.website_url && (
              <a href={e.website_url} target="_blank" rel="noopener noreferrer"
                 className="rounded-md border border-nal-border bg-white px-4 py-2 text-sm font-semibold text-nal-navy transition hover:border-nal-saffron hover:text-nal-saffron">
                Website ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
