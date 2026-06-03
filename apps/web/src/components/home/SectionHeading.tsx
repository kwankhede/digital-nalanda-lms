export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-gray-500 ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
