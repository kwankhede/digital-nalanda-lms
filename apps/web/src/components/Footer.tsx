export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-brand-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm">
        <p className="font-semibold">Digital Nalanda LMS</p>
        <p className="mt-1 text-white/70">
          Free quality education for everyone, everywhere.
        </p>
        <p className="mt-4 text-white/50">
          © {new Date().getFullYear()} Digital Nalanda. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
