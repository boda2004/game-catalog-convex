import {
  useSignInWithEmailPassword,
  useSignUpWithEmailPassword,
  useStartPasswordRecovery,
} from "@convex-dev/auth/methods/email-password/react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
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
  const [showPassword, setShowPassword] = useState(false);
  const [sentNotice, setSentNotice] = useState<{
    kind: "signUp" | "reset";
    email: string;
  } | null>(null);

  const pending = signingIn || signingUp || recovering;
  const isAuthFlow = flow === "signIn" || flow === "signUp";

  if (sentNotice !== null) {
    return (
      <div className="w-full rounded-2xl border border-border-strong/70 bg-surface p-7 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-ink ring-1 ring-inset ring-primary/30">
          <MailCheck className="size-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {sentNotice.kind === "signUp"
            ? `We sent a verification link to ${sentNotice.email}. Open it in this browser to finish creating your account.`
            : `We sent a password reset link to ${sentNotice.email}. Open it in this browser within 10 minutes to set a new password.`}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="mt-6 w-full"
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
    <div className="w-full rounded-2xl border border-border-strong/70 bg-surface p-6 shadow-2xl sm:p-7">
      {isAuthFlow ? (
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="mb-6 grid grid-cols-2 rounded-xl border border-border-subtle bg-surface-subtle p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={flow === "signIn"}
            onClick={() => setFlow("signIn")}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-all",
              flow === "signIn"
                ? "bg-surface-elevated text-ink shadow-xs ring-1 ring-inset ring-border-subtle"
                : "text-ink-muted hover:text-ink",
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={flow === "signUp"}
            onClick={() => setFlow("signUp")}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-all",
              flow === "signUp"
                ? "bg-surface-elevated text-ink shadow-xs ring-1 ring-inset ring-border-subtle"
                : "text-ink-muted hover:text-ink",
            )}
          >
            Create account
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFlow("signIn")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </button>
      )}

      <div className="mb-5">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          {flow === "signIn"
            ? "Welcome back"
            : flow === "signUp"
              ? "Start your library"
              : "Reset your password"}
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {flow === "signIn"
            ? "Sign in with your email and password."
            : flow === "signUp"
              ? "Use a strong password of at least 10 characters."
              : "We'll email you a 10-minute recovery link."}
        </p>
      </div>

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
        <label className="space-y-1.5">
          <span className="block text-xs font-semibold text-ink-secondary">
            Email address
          </span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              className="input-field pl-10"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              required
            />
          </div>
        </label>

        {isAuthFlow && (
          <label className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-secondary">
                Password
              </span>
              {flow === "signIn" && (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary-soft-ink transition-colors hover:underline"
                  onClick={() => setFlow("reset")}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                className="input-field pl-10 pr-10"
                type={showPassword ? "text" : "password"}
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
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
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
      </form>
    </div>
  );
}
