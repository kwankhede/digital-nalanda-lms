// Static student dashboard. Real data wires up to /api later.
const stats = [
  { label: "Enrolled Courses", value: 12 },
  { label: "Completed Courses", value: 5 },
  { label: "Certificates Earned", value: 3 },
  { label: "Live Classes Joined", value: 28 },
];

const inProgress = [
  { title: "Digital Literacy", percent: 66 },
  { title: "Spoken English", percent: 40 },
  { title: "Tally Prime Basics", percent: 20 },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-navy">
        Welcome back, Student 👋
      </h1>
      <p className="mt-1 text-gray-500">Keep learning, keep growing.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-100 p-5 shadow-sm"
          >
            <p className="text-3xl font-extrabold text-brand-blue">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-bold text-brand-navy">
        In Progress Courses
      </h2>
      <div className="mt-4 space-y-4">
        {inProgress.map((c) => (
          <div key={c.title} className="rounded-lg border border-gray-100 p-4">
            <div className="flex justify-between text-sm font-medium">
              <span>{c.title}</span>
              <span className="text-gray-500">{c.percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-brand-blue"
                style={{ width: `${c.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
