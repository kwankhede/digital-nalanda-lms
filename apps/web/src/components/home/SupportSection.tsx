import { DONATION_TIERS, SUPPORT_URL } from "@/lib/homeData";
import SectionHeading from "./SectionHeading";

const IMPACT = [
  "A team of 20+ educators and 300+ mentors",
  "Successfully trained 600+ students",
  "Teaching over 5,000 students online",
  "14 rural community libraries",
  "Arts & Science Lab for school children",
  "All facilities and training free of cost",
];

export default function SupportSection() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          center
          eyebrow="Support"
          title="Support Nalanda"
          subtitle="100% of education stays free. Your contribution directly funds students, libraries and community learning."
        />

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {/* What your support powers */}
          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy">
              What your support powers
            </h3>
            <ul className="mt-4 space-y-3">
              {IMPACT.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="mt-0.5 text-brand-orange">✓</span>
                  {point}
                </li>
              ))}
            </ul>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Support us financially
            </a>
          </div>

          {/* Donation tiers */}
          <div className="grid gap-4 sm:grid-cols-1">
            {DONATION_TIERS.map((t) => (
              <a
                key={t.amount}
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-brand-orange hover:shadow-md"
              >
                <div>
                  <p className="text-2xl font-extrabold text-brand-navy">{t.amount}</p>
                  <p className="mt-1 text-sm text-gray-500">{t.impact}</p>
                </div>
                <span className="ml-4 rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold text-white group-hover:opacity-90">
                  Donate
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Donations are processed securely on the official Nalanda Academy site ·
          50% tax exemption under Section 80G (Indian citizens).
        </p>
      </div>
    </section>
  );
}
