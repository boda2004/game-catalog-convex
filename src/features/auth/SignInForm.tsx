import {
  useSignInWithEmailPassword,
  useSignUpWithEmailPassword,
  useStartPasswordRecovery,
} from "@convex-dev/auth/methods/email-password/react";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { formatAuthError } from "./authErrors";

type AuthFlow = "signIn" | "signUp" | "reset";

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
      <div className="w-full rounded-xl border border-border-subtle bg-surface p-6 text-center shadow-xs">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-ink">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Check your email</h2>
        <p className="mt-2 text-sm text-ink-secondary">
          {sentNotice.kind === "signUp"
            ? `We sent a verification link to ${sentNotice.email}. Open it in this browser to finish creating your account.`
            : `We sent a password reset link to ${sentNotice.email}. Open it in this browser within 10 minutes to set a new password.`}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="mt-5 w-full"
          onClick={() => {
            setSentNotice(null);
            setPassword("");
            setFlow("signIn");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface p-6 shadow-xs">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink">
          {flow === "signIn"
            ? "Sign in to your library"
            : flow === "signUp"
              ? "Create your account"
              : "Reset your password"}
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {flow === "signIn"
            ? "Enter your email and password to continue."
            : flow === "signUp"
              ? "Passwords must be at least 10 characters."
              : "We will send a 10-minute reset link to your verified email."}
        </p>
      </div>

      <form
        className="flex flex-col gap-3.5"
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
        <label className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Email
          </span>
          <input
            className="input-field"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
        </label>

        {isAuthFlow && (
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Password
            </span>
            <input
              className="input-field"
              type="password"
              name="password"
              autoComplete={
                flow === "signUp" ? "new-password" : "current-password"
              }
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              required
            />
          </label>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={pending}
          className="mt-1 w-full"
        >
          {pending
            ? "Please wait..."
            : flow === "signIn"
              ? "Sign in"
              : flow === "signUp"
                ? "Create account"
                : "Send reset link"}
        </Button>

        <div className="mt-2 flex flex-col items-center gap-2 text-sm text-ink-secondary">
          {isAuthFlow ? (
            <>
              <button
                type="button"
                className="font-medium text-primary hover:text-primary-hover hover:underline"
                onClick={() =>
                  setFlow(flow === "signIn" ? "signUp" : "signIn")
                }
              >
                {flow === "signIn"
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
              <button
                type="button"
                className="text-xs font-medium text-ink-muted hover:text-primary hover:underline"
                onClick={() => setFlow("reset")}
              >
                Forgot your password?
              </button>
            </>
          ) : (
            <button
              type="button"
              className="font-medium text-primary hover:text-primary-hover hover:underline"
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
