import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion, { type FaqGroup } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ | Digital Nalanda",
  description:
    "Answers to common questions about Digital Nalanda — courses, certificates, live classes, accounts, teaching and donations.",
};

const FAQ: FaqGroup[] = [
  {
    category: "Getting started",
    items: [
      {
        q: "Is Digital Nalanda really free?",
        a: "Yes. Every course, live class and resource on Digital Nalanda is 100% free, forever. We are a not-for-profit education initiative and never charge learners.",
      },
      {
        q: "How do I create an account?",
        a: "Click \"Sign Up\" in the top menu, enter your name, email and a password, and you're in. You can start browsing and enrolling in courses right away.",
      },
      {
        q: "Do I need any special device or software?",
        a: "No. Digital Nalanda works in any modern web browser on a phone, tablet or computer. All you need is an internet connection.",
      },
    ],
  },
  {
    category: "Courses & learning",
    items: [
      {
        q: "How do I enrol in a course?",
        a: "Open the Courses page, choose a course, and click Enrol. The course is added to your dashboard so you can pick up where you left off any time.",
      },
      {
        q: "Can I learn at my own pace?",
        a: "Absolutely. Most courses are self-paced — you can start, pause and resume whenever it suits you. Your progress is saved automatically.",
      },
      {
        q: "In which languages are courses available?",
        a: "Courses are offered in multiple languages depending on the educator. The language is shown on each course card so you can pick what works best for you.",
      },
    ],
  },
  {
    category: "Certificates",
    items: [
      {
        q: "Do I get a certificate after completing a course?",
        a: "Yes. When you complete all required lessons and assignments, a certificate of completion is issued to your account.",
      },
      {
        q: "How can someone verify my certificate?",
        a: "Every certificate has a unique verification code. Anyone can confirm it is genuine using the certificate verification link — no login required.",
      },
    ],
  },
  {
    category: "Live classes & events",
    items: [
      {
        q: "How do I join a live class?",
        a: "Upcoming live classes and events are listed on the Live Classes page. Click Join on a session at its scheduled time to enter.",
      },
      {
        q: "Are live classes recorded?",
        a: "Many sessions are recorded and added to our recordings so you can watch later if you miss the live session.",
      },
    ],
  },
  {
    category: "Account & support",
    items: [
      {
        q: "I forgot my password — what do I do?",
        a: "Use the login page to reset your password via email. If you still can't access your account, reach out through the Need help section and we'll assist you.",
      },
      {
        q: "How do I get help if I'm stuck?",
        a: "Visit the Need help section on our homepage, or chat with our assistant using the chat button in the corner of any page. We're happy to help.",
      },
    ],
  },
  {
    category: "Teaching & contributing",
    items: [
      {
        q: "Can I teach on Digital Nalanda?",
        a: "Yes! We welcome educators and mentors. Apply through the \"Teach on Digital Nalanda\" page and our team will guide you through the next steps.",
      },
      {
        q: "How can I support Digital Nalanda?",
        a: "The best way to support our mission of free education is to donate to Nalanda Academy. Use the Donate button in the menu — every contribution helps us reach more learners.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="parchment min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nal-saffron">
          Help center
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nal-navy md:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-nal-slate">
          Everything you need to know about learning, teaching and contributing at Digital Nalanda.
        </p>

        <FaqAccordion groups={FAQ} />

        <div className="mt-12 rounded-2xl border border-nal-border bg-white p-6 text-center shadow-soft">
          <h2 className="font-display text-xl font-bold text-nal-navy">Still have questions?</h2>
          <p className="mt-2 text-sm text-nal-slate">
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
          </p>
          <Link
            href="/#contact"
            className="mt-4 inline-flex rounded-lg bg-nal-saffron px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}
