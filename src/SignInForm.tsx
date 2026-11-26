"use client";
import {
  useSignInWithEmailPassword,
  useSignUpWithEmailPassword,
  useStartPasswordRecovery,
} from "@convex-dev/auth/methods/email-password/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";

type AuthFlow = "signIn" | "signUp" | "reset";

function formatAuthError(userError: {
  error: string;
  minimumLength?: number;
  maximumLength?: number;
  retryAfterMs?: number;
}): string {
  switch (userError.error) {
    case "USER_NOT_FOUND":
    case "INVALID_CREDENTIALS":
      return "Invalid email or password.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "EMAIL_TAKEN":
      return "An account with this email already exists.";
    case "EMAIL_NOT_FOUND":
      return "No verified account was found for that email.";
    case "PASSWORD_TOO_SHORT":
      return `Password must be at least ${userError.minimumLength ?? 10} characters long.`;
    case "PASSWORD_TOO_LONG":
      return `Password must be at most ${userError.maximumLength ?? 100} characters long.`;
    case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
      return "Password cannot start or end with whitespace.";
    case "PASSWORD_TOO_COMMON":
      return "That password is too common. Please choose a stronger password.";
    case "RATE_LIMITED": {
      const seconds = Math.max(
        1,
        Math.ceil((userError.retryAfterMs ?? 60000) / 1000),
      );
      return `Too many attempts. Please try again in ${seconds}s.`;
    }
    default:
      return "Something went wrong. Please try again.";
  }
}

export function SignInForm() {
  const { signIn, pending: signingIn } = useSignInWithEmailPassword(api.auth);
  const { signUp, pending: signingUp } = useSignUpWithEmailPassword(api.auth);
  const { startPasswordRecovery, pending: recovering } =
    useStartPasswordRecovery(api.auth);

  const [flow, setFlow] = useState<AuthFlow>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sentNotice, setSentNotice] = useState<{
    kind: "signUp" | "reset";
    email: string;
  } | null>(null);

  const pending = signingIn || signingUp || recovering;
  const isAuthFlow = flow === "signIn" || flow === "signUp";

  if (sentNotice !== null) {
    return (
      <div className="w-full rounded-container border border-[#dbd9e1] bg-white p-6 text-center shadow-xs">
        <h2 className="mb-2 text-lg font-semibold text-[#1b1b21]">
          Check your email
        </h2>
        <p className="mb-4 text-sm text-secondary">
          {sentNotice.kind === "signUp"
            ? `We sent a verification link to ${sentNotice.email}. Open it in this browser to finish creating your account.`
            : `We sent a password reset link to ${sentNotice.email}. Open it in this browser within 10 minutes to set a new password.`}
        </p>
        <button
          type="button"
          className="auth-button"
          onClick={() => {
            setSentNotice(null);
            setPassword("");
            setFlow("signIn");
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void (async () => {
            if (flow === "signIn") {
              const result = await signIn({ email, password });
              if (result.status === "error") {
                toast.error(formatAuthError(result.userError));
              }
              return;
            }

            if (flow === "signUp") {
              const result = await signUp({ email, password });
              if (result.success) {
                toast.success("Verification email sent.");
                setSentNotice({ kind: "signUp", email });
              } else {
                toast.error(formatAuthError(result.userError));
              }
              return;
            }

            const result = await startPasswordRecovery({ email });
            if (result.success) {
              toast.success("Password reset email sent.");
              setSentNotice({ kind: "reset", email: result.sentTo });
            } else {
              toast.error(formatAuthError(result.userError));
            }
          })();
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          required
        />

        {isAuthFlow && (
          <input
            className="auth-input-field"
            type="password"
            name="password"
            autoComplete={
              flow === "signUp" ? "new-password" : "current-password"
            }
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            required
          />
        )}

        {flow === "reset" && (
          <p className="text-sm text-secondary">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        )}

        <button className="auth-button" type="submit" disabled={pending}>
          {flow === "signIn"
            ? "Sign in"
            : flow === "signUp"
              ? "Sign up"
              : "Send reset link"}
        </button>

        <div className="text-center text-sm text-secondary">
          {isAuthFlow ? (
            <>
              <div className="mb-2">
                <button
                  type="button"
                  className="cursor-pointer font-medium text-primary hover:text-primary-hover hover:underline"
                  onClick={() =>
                    setFlow(flow === "signIn" ? "signUp" : "signIn")
                  }
                >
                  {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
                </button>
              </div>
              <button
                type="button"
                className="cursor-pointer font-medium text-primary hover:text-primary-hover hover:underline"
                onClick={() => setFlow("reset")}
              >
                Forgot your password?
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cursor-pointer font-medium text-primary hover:text-primary-hover hover:underline"
              onClick={() => setFlow("signIn")}
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
