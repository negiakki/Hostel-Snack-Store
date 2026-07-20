export default function AdminDashboardPage() {
  return (
    <main className="min-h-[100dvh] bg-canvas-night px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl border-b border-white/15 pb-7">
        <h1 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-zinc-400">
          Use the navigation to manage products, inventory, and tonight&apos;s store status.
        </p>
      </div>
    </main>
  );
}
