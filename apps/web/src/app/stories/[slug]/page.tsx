import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStory } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const story = await getStory(params.slug).catch(() => null);
  if (!story) return { title: "Story | Digital Nalanda" };
  return {
    title: `${story.title} | Digital Nalanda Stories`,
    description: story.summary || story.quote?.slice(0, 150),
    openGraph: {
      title: story.title,
      description: story.summary,
      images: story.featured_image ? [story.featured_image] : [],
      type: "article",
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const story = await getStory(params.slug);
  if (!story) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/stories" className="text-sm text-brand-blue hover:underline">
        ← All stories
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-brand-navy">{story.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {story.student_name}
        {story.institution ? ` · ${story.institution}` : ""}
        {story.graduation_year ? ` · ${story.graduation_year}` : ""}
      </p>

      {story.featured_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.featured_image}
          alt={story.student_name}
          className="mt-6 h-64 w-full rounded-xl object-cover"
        />
      )}

      {story.quote && (
        <blockquote className="mt-6 border-l-4 border-brand-orange pl-4 text-lg italic text-brand-navy">
          “{story.quote}”
        </blockquote>
      )}

      {story.content && (
        <div className="mt-6 whitespace-pre-line text-gray-700">
          {story.content}
        </div>
      )}
    </article>
  );
}
