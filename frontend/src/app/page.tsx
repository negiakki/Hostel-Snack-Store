import { getBackendHealth } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const backendHealth = await getBackendHealth();
  const isBackendOnline = backendHealth.status === "online";

  return (
    <main className="flex flex-1 items-center justify-center bg-white px-6 py-16 text-black sm:px-12">
      <section aria-labelledby="setup-title" className="w-full max-w-xl">
        <p className="text-xs font-normal uppercase tracking-[0.12em] text-zinc-600">
          Project setup
        </p>
        <h1
          id="setup-title"
          className="mt-4 text-4xl font-light tracking-tight sm:text-5xl"
        >
          Hostel Snack Store
        </h1>
        <p className="mt-6 text-base leading-6 text-zinc-600">
          The frontend foundation is ready to communicate with the backend API.
        </p>
        <dl className="mt-10 border-y border-zinc-200 py-5">
          <div className="flex items-center justify-between gap-6">
            <dt className="text-sm font-medium">Backend connection</dt>
            <dd aria-live="polite" className="text-sm text-zinc-600">
              {isBackendOnline ? "Online" : "Unavailable"}
            </dd>
          </div>
          <div className="mt-4 flex items-center justify-between gap-6">
            <dt className="text-sm font-medium">Last checked</dt>
            <dd className="font-mono text-xs text-zinc-600">
              {new Date(backendHealth.checkedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
