import Link from "next/link";

export default function Home() {
  return (
test
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
          Welcome to AB INTERIOR
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Your modern customer payment ledger application.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/customers"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
