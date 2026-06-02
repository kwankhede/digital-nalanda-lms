import Link from "next/link";

const highlights = [
  { title: "100% Free", desc: "All courses" },
  { title: "Live Classes", desc: "By experts" },
  { title: "Certificate", desc: "On completion" },
  { title: "Learn Anytime", desc: "Anywhere" },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Free Quality Education
            <br />
            For Everyone, Everywhere
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Empowering rural India with digital learning and skill development.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/courses"
              className="rounded-md bg-brand-orange px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Explore Courses
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Register for Free
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-lg border border-gray-100 p-5 shadow-sm"
            >
              <p className="font-bold text-brand-navy">{h.title}</p>
              <p className="text-sm text-gray-500">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
