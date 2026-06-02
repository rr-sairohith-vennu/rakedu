"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = "idle" | "submitting" | "error";
type ErrorType = "format" | "duplicate" | "rate-limited" | null;

export default function VerifyStudentPage() {
  const router = useRouter();
  const [eduEmail, setEduEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);

  function validateEduEmail(email: string): boolean {
    return /^[^@]+@[^@]+\.edu$/i.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateEduEmail(eduEmail)) {
      setFormState("error");
      setErrorType("format");
      setErrorMessage("Please enter a valid .edu email address.");
      return;
    }

    setFormState("submitting");
    setErrorType(null);
    setErrorMessage("");

    try {
      const res = await fetch(
        "/api/student-verification/v1/regions/USA/members/me/student_verifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Agent": "rakedu-web/1.0.0",
          },
          body: JSON.stringify({ edu_email: eduEmail }),
        }
      );

      if (res.status === 201) {
        router.push("/verify-student/confirm");
        return;
      }

      const body = await res.json();

      if (res.status === 429) {
        const retrySeconds = parseInt(res.headers.get("Retry-After") ?? "60", 10);
        setRetryAfter(retrySeconds);
        setFormState("error");
        setErrorType("rate-limited");
        setErrorMessage(`Too many attempts. Please try again in ${retrySeconds} seconds.`);
        return;
      }

      if (res.status === 422) {
        setFormState("error");
        setErrorType("duplicate");
        setErrorMessage("This .edu address is already linked to another account.");
        return;
      }

      setFormState("error");
      setErrorType(null);
      setErrorMessage(body?.errors?.[0]?.message ?? "Something went wrong. Please try again.");
    } catch {
      setFormState("error");
      setErrorType(null);
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify your student status</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your .edu email address to unlock exclusive student cashback deals.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="edu-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              University email address
            </label>
            <input
              id="edu-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={eduEmail}
              onChange={(e) => setEduEmail(e.target.value)}
              placeholder="you@university.edu"
              aria-describedby={formState === "error" ? "email-error" : undefined}
              aria-invalid={formState === "error" ? "true" : "false"}
              disabled={formState === "submitting"}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors ${
                formState === "error"
                  ? "border-red-400 bg-red-50 focus:ring-red-400"
                  : "border-gray-300 bg-white"
              }`}
            />

            {/* Error message */}
            {formState === "error" && errorMessage && (
              <p
                id="email-error"
                role="alert"
                className="mt-2 text-sm text-red-600 flex items-start gap-1.5"
              >
                <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formState === "submitting" || !eduEmail.trim()}
            className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {formState === "submitting" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending code…
              </>
            ) : (
              "Send verification code"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          You'll receive a 6-digit code valid for 15 minutes.
        </p>
      </div>
    </main>
  );
}
