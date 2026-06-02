// Static login form. Wiring to the auth API comes in a later phase.
export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-extrabold text-brand-navy">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500">Login to continue learning.</p>

      <form className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-blue"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-brand-orange py-2 font-semibold text-white hover:opacity-90"
        >
          Login
        </button>
      </form>
    </div>
  );
}
