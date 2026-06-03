import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-navy">Access denied</h1>
      <p className="mt-2 text-gray-500">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-brand-orange px-6 py-3 font-semibold text-white">
        Back to home
      </Link>
    </div>
  );
}
