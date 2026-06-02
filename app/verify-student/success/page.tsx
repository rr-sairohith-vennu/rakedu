import Link from "next/link";

export default function VerifyStudentSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">You're verified!</h1>
        <p className="mt-3 text-sm text-gray-500">
          Your student status has been confirmed. You now have access to exclusive
          student cashback deals for the next 12 months.
        </p>

        {/* Expiry note */}
        <div className="mt-4 rounded-lg bg-purple-50 px-4 py-3 text-xs text-purple-700">
          Your student access will renew annually. We'll remind you 7 days before it expires.
        </div>

        {/* CTA */}
        <Link
          href="/student-deals"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          Explore student deals
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </Link>

        <Link href="/" className="mt-3 block text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
