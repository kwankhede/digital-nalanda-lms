import Link from "next/link";
import Image from "next/image";
import SectionHeading from "./SectionHeading";
import FadeInSection from "@/components/anim/FadeInSection";

interface EcoItem {
  title: string;
  desc: string;
  img: string;
  href: string;
  external?: boolean;
}

const ITEMS: EcoItem[] = [
  { title: "Nalanda Academy", desc: "Residential programs for meritorious rural students from class 6 to 12.", img: "/images/home/eco-academy.webp", href: "https://nalanda-academy.org/our-initiatives/#nalandaacademy", external: true },
  { title: "Digital Nalanda", desc: "Free online education for learners across India and the world.", img: "/images/home/eco-digital.webp", href: "/courses" },
  { title: "Abhiyan Libraries", desc: "Community libraries as centers of learning and transformation.", img: "/images/home/eco-libraries.webp", href: "https://nalanda-academy.org/our-initiatives/#abhiyanlibraries", external: true },
  { title: "Nalanda Labs", desc: "Research, innovation and experimentation for social impact.", img: "/images/home/eco-labs.webp", href: "https://nalanda-academy.org/our-initiatives/#nalandaabhiyanlabs", external: true },
  { title: "Nalanda Campus", desc: "A new centre for learning, dialogue and social change.", img: "/images/home/eco-campus.webp", href: "https://nalanda-academy.org/nalanda-abhiyan-campus/", external: true },
  { title: "The Path", desc: "Guidance, mentorship and fellowships for a life of purpose.", img: "/images/home/eco-path.webp", href: "/#newsletter" },
];

function CardInner({ item }: { item: EcoItem }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nal-parchment bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-nal-saffron/50 hover:shadow-lift">
      <div className="relative h-44 w-full overflow-hidden bg-nal-parchment/40">
        <Image
          src={item.img}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold text-nal-navy">{item.title}</h3>
        <p className="mt-2 flex-1 text-sm text-nal-slate">{item.desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-nal-saffron">
          Learn more
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </div>
  );
}

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionHeading center eyebrow="The Nalanda Ecosystem" title="Different paths. One mission." />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item, i) => (
          <FadeInSection key={item.title} delayMs={i * 70}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                <CardInner item={item} />
              </a>
            ) : (
              <Link href={item.href} className="block h-full">
                <CardInner item={item} />
              </Link>
            )}
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}
