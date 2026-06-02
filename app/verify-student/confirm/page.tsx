"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type FormState = "idle" | "submitting" | "resending" | "error";

type ErrorKind =
  | "invalid-code"
  | "max-attempts"
  | "expired"
  | "generic"
  | null;

export default function VerifyStudentConfirmPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [otp, setOtp] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown timer for OTP expiry display
  useEffect(() => {
    if (!otpExpiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((otpExpiresAt.getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return;

    setFormState("submitting");
    setErrorKind(null);
    setErrorMessage("");
    setResendSuccess(false);

    try {
      const res = await fetch(
        "/api/student-verification/v1/regions/USA/members/me/student_verifications/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Agent": "rakedu-web/1.0.0",
          },
          body: JSON.stringify({ otp_code: otp }),
        }
      );

      if (res.status === 200) {
        router.push("/verify-student/success");
        return;
      }

      const body = await res.json();
      const code = body?.errors?.[0]?.code ?? "";
      const msg = body?.errors?.[0]?.message ?? "Something went wrong.";

      if (code === "OTP_MAX_ATTEMPTS" || res.status === 422 && msg.includes("attempt")) {
        setErrorKind("max-attempts");
        setErrorMessage("Too many incorrect attempts. Please request a new code.");
      } else if (code === "OTP_EXPIRED" || res.status === 422 && msg.includes("expired")) {
        setErrorKind("expired");
        setErrorMessage("Your code has expired. Please request a new one.");
      } else if (res.status === 422) {
        // Extract attempt count from message if present
        const attemptsMatch = msg.match(/(\d+)\s+attempt/);
        const remaining = attemptsMatch ? attemptsMatch[1] : "";
        setErrorKind("invalid-code");
        setErrorMessage(
          remaining
            ? `Incorrect code. ${remaining} attempt${remaining === "1" ? "" : "s"} remaining.`
            : "Incorrect code. Please try again."
        );
      } else {
        setErrorKind("generic");
        setErrorMessage(msg);
      }

      setFormState("error");
      setOtp("");
      inputRef.current?.focus();
    } catch {
      setFormState("error");
      setErrorKind("generic");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || formState === "resending") return;

    setFormState("resending");
    setResendSuccess(false);
    setErrorKind(null);
    setErrorMessage("");

    try {
      const res = await fetch(
        "/api/student-verification/v1/regions/USA/members/me/student_verifications/resend",
        {
          method: "POST",
          headers: { "Client-Agent": "rakedu-web/1.0.0" },
        }
      );

      if (res.status === 200) {
        const body = await res.json();
        if (body?.data?.otp_expires_at) {
          setOtpExpiresAt(new Date(body.data.otp_expires_at));
        }
        setResendSuccess(true);
        setResendCooldown(60);
        setOtp("");
        setFormState("idle");
        inputRef.current?.focus();
        return;
      }

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "60", 10);
        setResendCooldown(retryAfter);
        setFormState("error");
        setErrorKind("generic");
        setErrorMessage(`Please wait ${retryAfter} seconds before requesting a new code.`);
        return;
      }

      setFormState("error");
      setErrorKind("generic");
      setErrorMessage("Failed to resend code. Please try again.");
    } catch {
      setFormState("error");
      setErrorKind("generic");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const needsNewCode = errorKind === "max-attempts" || errorKind === "expired";
  const isSubmitting = formState === "submitting";
  const isResending = formState === "resending";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent a 6-digit code to your .edu address. Enter it below to verify.
          </p>
          {otpExpiresAt && secondsLeft > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Code expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Resend success toast */}
        {resendSuccess && (
          <div role="alert" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            New code sent! Check your inbox.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} noValidate>
          <div className="mb-4">
            <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-1.5">
              Verification code
            </label>
            <input
              ref={inputRef}
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              aria-label="Verification code"
              aria-describedby={formState === "error" ? "otp-error" : undefined}
              aria-invalid={formState === "error" ? "true" : "false"}
              disabled={isSubmitting || isResending || needsNewCode}
              className={`w-full rounded-lg border px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors ${
                formState === "error"
                  ? "border-red-400 bg-red-50 focus:ring-red-400"
                  : "border-gray-300 bg-white"
              }`}
            />

            {/* Error message */}
            {formState === "error" && errorMessage && (
              <p
                id="otp-error"
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

          {/* Verify button — hidden when new code is needed */}
          {!needsNewCode && (
            <button
              type="submit"
              disabled={otp.length !== 6 || isSubmitting || isResending}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                "Verify code"
              )}
            </button>
          )}
        </form>

        {/* Resend section */}
        <div className="mt-4 text-center">
          {needsNewCode ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full rounded-lg border border-purple-300 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isResending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending new code…
                </>
              ) : (
                "Request a new code"
              )}
            </button>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending || isSubmitting}
              className="text-sm text-purple-600 hover:text-purple-800 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
            >
              {isResending
                ? "Sending…"
                : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
