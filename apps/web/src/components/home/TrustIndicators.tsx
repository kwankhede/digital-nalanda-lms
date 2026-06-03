import { TRUST_POINTS } from "@/lib/homeData";

export default function TrustIndicators() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {TRUST_POINTS.map((p) => (
          <div key={p.label} className="text-center">
            <p className="text-2xl font-extrabold text-brand-navy">{p.value}</p>
            <p className="mt-1 text-sm text-gray-500">{p.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
