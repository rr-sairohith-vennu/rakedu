import Image from "next/image";
import Link from "next/link";

interface CashbackRate {
  value: number;
  scale: number;
}

interface StudentDeal {
  id: string;
  merchant_name: string;
  logo_url: string;
  cashback_rate: CashbackRate;
  display_order: number;
}

interface StudentDealsResponse {
  data: StudentDeal[];
  pagination: { next?: string };
  meta: { status: { code: string }; operation: { request_id: string } };
}

function formatCashbackRate(rate: CashbackRate): string {
  const decimal = rate.value / Math.pow(10, rate.scale);
  return `${decimal.toFixed(rate.scale)}%`;
}

async function fetchStudentDeals(): Promise<
  { deals: StudentDeal[]; next?: string } | { error: string }
> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/student-verification/v1/student_deals?limit=20`,
      {
        headers: { "Client-Agent": "rakedu-web/1.0.0" },
        cache: "no-store",
      }
    );

    if (res.status === 403) {
      return { error: "access-denied" };
    }

    if (!res.ok) {
      return { error: "api-error" };
    }

    const body: StudentDealsResponse = await res.json();
    return { deals: body.data, next: body.pagination?.next };
  } catch {
    return { error: "network-error" };
  }
}

// Skeleton card
function DealCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white ring-1 ring-gray-200 p-5 flex flex-col gap-4">
      <div className="h-12 w-12 rounded-lg bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-6 w-20 rounded bg-gray-200" />
      </div>
    </div>
  );
}

// Deal card
function DealCard({ deal }: { deal: StudentDeal }) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-gray-200 p-5 flex flex-col gap-3 hover:ring-purple-300 hover:shadow-sm transition-all">
      {/* Logo */}
      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100">
        <Image
          src={deal.logo_url}
          alt={`${deal.merchant_name} logo`}
          fill
          className="object-contain p-1"
          onError={() => {}}
        />
      </div>

      {/* Merchant name */}
      <div>
        <p className="text-sm font-medium text-gray-900">{deal.merchant_name}</p>
        {/* Cashback rate — screen-reader accessible */}
        <p
          className="text-2xl font-bold text-purple-600 mt-1"
          aria-label={`${formatCashbackRate(deal.cashback_rate)} cash back`}
        >
          {formatCashbackRate(deal.cashback_rate)}
          <span className="ml-1 text-sm font-normal text-gray-500">cash back</span>
        </p>
      </div>

      <Link
        href={`/student-deals/${deal.id}`}
        className="mt-auto rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-center"
      >
        Shop now
      </Link>
    </div>
  );
}

export default async function StudentDealsPage() {
  const result = await fetchStudentDeals();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Student Exclusive Deals</h1>
              <p className="text-sm text-gray-500">Boosted cashback rates — just for verified students.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {"error" in result ? (
          result.error === "access-denied" ? (
            // Access denied — not verified
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Student verification required</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-sm">
                Verify your student status with your .edu email to unlock these exclusive deals.
              </p>
              <Link
                href="/verify-student"
                className="mt-6 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                Verify your student status
              </Link>
            </div>
          ) : (
            // Generic API / network error
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-sm text-gray-500">
                We couldn't load student deals. Please try again.
              </p>
              <form action="" method="get">
                <button
                  type="submit"
                  className="mt-6 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                >
                  Retry
                </button>
              </form>
            </div>
          )
        ) : result.deals.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No deals available right now</h2>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon — new student exclusive deals are added regularly.
            </p>
          </div>
        ) : (
          // Loaded — deals grid
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Loading skeleton export for Suspense boundaries
export function StudentDealsPageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-64 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
