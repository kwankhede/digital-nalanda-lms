// Static placeholder course list. Will be fetched from /api/courses later.
const courses = [
  { title: "Digital Literacy", level: "Basic", desc: "Basic computer skills and digital tools." },
  { title: "Spoken English", level: "Basic", desc: "Improve your English speaking skills." },
  { title: "Basic Mathematics", level: "Basic", desc: "Learn mathematics from the beginning." },
  { title: "Personality Development", level: "Intermediate", desc: "Build confidence and improve personality." },
];

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">All Courses</h1>
      <p className="mt-2 text-gray-500">Explore our wide range of free courses.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c) => (
          <div
            key={c.title}
            className="flex flex-col rounded-lg border border-gray-100 p-5 shadow-sm"
          >
            <span className="w-fit rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
              {c.level}
            </span>
            <h2 className="mt-3 font-bold text-brand-navy">{c.title}</h2>
            <p className="mt-1 flex-1 text-sm text-gray-500">{c.desc}</p>
            <span className="mt-4 text-sm font-bold text-green-600">Free</span>
          </div>
        ))}
      </div>
    </div>
  );
}
