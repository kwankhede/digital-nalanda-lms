export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-100 p-5"
        >
          <div className="h-12 w-12 rounded-lg bg-gray-100" />
          <div className="mt-4 h-4 w-2/3 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-full rounded bg-gray-100" />
          <div className="mt-1 h-3 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
      {message || "Couldn't load this section. Please try again later."}
    </p>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="mt-6 text-sm text-gray-500">{message}</p>;
}
