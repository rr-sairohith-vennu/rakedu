import Link from "next/link";
import { getServerSession } from "next-auth";

interface StudentStatus {
  is_verified: boolean;
  status: "none" | "pending" | "verified" | "expired" | "revoked";
  expires_at: string | null;
  days_until_expiry: number | null;
}

async function fetchStudentStatus(): Promise<StudentStatus | null> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/student-verification/v1/regions/USA/members/me/student_status`,
      {
        headers: { "Client-Agent": "rakedu-web/1.0.0" },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data ?? null;
  } catch {
    return null;
  }
}

// Skeleton shown while server component loads
export function StudentVerificationBannerSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-xl bg-gray-100 px-6 py-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>
      <div className="h-9 w-32 rounded-lg bg-gray-200" />
    </div>
  );
}

export default async function StudentVerificationBanner() {
  const session = await getServerSession();

  // Anonymous visitor
  if (!session?.user) {
    return (
      <div className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Are you a student? Get exclusive deals.</p>
            <p className="text-xs text-purple-200">Verify with your .edu email to unlock boosted cashback rates.</p>
          </div>
        </div>
        <Link
          href="/api/auth/signin?callbackUrl=/verify-student"
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors"
        >
          Verify your student status
        </Link>
      </div>
    );
  }

  const status = await fetchStudentStatus();

  // Verified + expiring soon (1–7 days)
  if (
    status?.is_verified &&
    status.days_until_expiry !== null &&
    status.days_until_expiry >= 0 &&
    status.days_until_expiry <= 7
  ) {
    return (
      <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Your student access expires in {status.days_until_expiry === 0 ? "less than a day" : `${status.days_until_expiry} day${status.days_until_expiry === 1 ? "" : "s"}`}.
            </p>
            <p className="text-xs text-amber-600">Re-verify your .edu email to keep your access.</p>
          </div>
        </div>
        <Link
          href="/verify-student"
          className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
        >
          Re-verify student status
        </Link>
      </div>
    );
  }

  // Expired
  if (
    status?.status === "expired" ||
    (status?.days_until_expiry !== null && status.days_until_expiry !== undefined && status.days_until_expiry < 0)
  ) {
    return (
      <div className="w-full rounded-xl bg-red-50 border border-red-200 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">Your student access has expired.</p>
            <p className="text-xs text-red-600">Re-verify your .edu email to regain access to student deals.</p>
          </div>
        </div>
        <Link
          href="/verify-student"
          className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Re-verify student status
        </Link>
      </div>
    );
  }

  // Verified and active
  if (status?.is_verified) {
    return (
      <div className="w-full rounded-xl bg-green-50 border border-green-200 px-6 py-4 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
          <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm text-green-800">
          <span className="font-semibold">You're verified ✓</span>{" "}
          <Link href="/student-deals" className="underline underline-offset-2 hover:text-green-900">
            Browse your student deals
          </Link>
        </p>
      </div>
    );
  }

  // Logged in but not verified (status = none, pending, or null)
  return (
    <div className="w-full rounded-xl bg-purple-50 border border-purple-200 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
          <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-900">Unlock exclusive student deals.</p>
          <p className="text-xs text-purple-600">Verify with your .edu email to access boosted cashback rates.</p>
        </div>
      </div>
      <Link
        href="/verify-student"
        className="shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
      >
        Get student deals
      </Link>
    </div>
  );
}
