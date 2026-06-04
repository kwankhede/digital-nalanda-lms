import Link from "next/link";
import SectionHeading from "./SectionHeading";
import OpenChatButton from "./OpenChatButton";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const CHANNELS = [
  {
    title: "Ask the Nalanda Assistant",
    desc: "Get instant answers about courses, schools and how to start learning.",
    cta: "Open chat",
    href: "#",
    chat: true,
    icon: (<svg className="h-6 w-6" viewBox="0 0 24 24" {...S}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></svg>),
  },
  {
    title: "Email us",
    desc: "Questions, partnerships or support — we usually reply within a day.",
    cta: "info@nalanda-academy.org",
    href: "mailto:info@nalanda-academy.org",
    external: true,
    icon: (<svg className="h-6 w-6" viewBox="0 0 24 24" {...S}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>),
  },
  {
    title: "Call us",
    desc: "Speak with the Nalanda Academy team in Wardha, Maharashtra.",
    cta: "+91 70285 56406",
    href: "tel:+917028556406",
    external: true,
    icon: (<svg className="h-6 w-6" viewBox="0 0 24 24" {...S}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>),
  },
];

export default function ContactHelp() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHeading
        center
        eyebrow="Need help?"
        title="We're here to help you learn"
        subtitle="Reach the Nalanda team however suits you best — our assistant is available around the clock."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {CHANNELS.map((ch) => (
          <div
            key={ch.title}
            className="group flex h-full flex-col rounded-2xl border border-nal-border bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/50 hover:shadow-lift"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nal-navy text-white transition-colors group-hover:bg-nal-saffron">
              {ch.icon}
            </span>
            <h3 className="mt-5 font-display text-lg font-bold text-nal-navy">{ch.title}</h3>
            <p className="mt-2 flex-1 text-sm text-nal-slate">{ch.desc}</p>
            {ch.chat ? (
              <OpenChatButton className="mt-5 text-sm font-semibold text-nal-saffron hover:underline">
                {ch.cta} →
              </OpenChatButton>
            ) : ch.external ? (
              <a href={ch.href} className="mt-5 break-words text-sm font-semibold text-nal-saffron hover:underline">
                {ch.cta}
              </a>
            ) : (
              <Link href={ch.href} className="mt-5 inline-flex items-center justify-center gap-1 text-sm font-semibold text-nal-saffron hover:underline">
                {ch.cta} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
