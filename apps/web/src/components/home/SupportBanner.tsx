import { SUPPORT_URL } from "@/lib/homeData";

export default function SupportBanner() {
  return (
    <section className="bg-brand-navy">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid items-center gap-8 rounded-3xl bg-gradient-to-br from-brand-blue/25 via-brand-navy to-brand-navy p-8 ring-1 ring-white/10 md:grid-cols-[260px_1fr] md:p-12">
          <div className="mx-auto w-44 md:w-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/support-mitra.svg"
              alt="Open hands offering a bodhi leaf with a dharma wheel"
              className="w-full"
            />
          </div>

          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
              Become a Nalanda Mitra
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
              Keep education free for every student
            </h2>
            <p className="mt-4 max-w-2xl text-white/80">
              Nalanda provides all its training and facilities completely free of
              cost. It costs around{" "}
              <span className="font-semibold text-white">₹4 lakhs every month</span>{" "}
              to support food, accommodation, libraries and labs for students from
              rural and marginalised communities. Your contribution keeps this
              mission alive.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-brand-orange px-8 py-3 text-lg font-semibold text-white hover:opacity-90"
              >
                Donate Now
              </a>
              <span className="text-sm text-white/60">
                50% tax exemption under Section 80G · for Indian citizens
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
