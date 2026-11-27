import {
  useCompleteChangeEmail,
  useCompletePasswordRecovery,
  useCompleteSignUpWithEmailPassword,
} from "@convex-dev/auth/methods/email-password/react";
import { AlertCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { AuthLinkRoute } from "@/lib/urlState";
import { formatAuthError } from "./authErrors";

export function AuthLinkView({
  route,
  onDone,
}: {
  route: AuthLinkRoute;
  onDone: () => void;
}) {
  if (!route.emailCode) {
    return (
      <LinkCard
        title="Invalid link"
        message="This link is missing its verification code. Please open the full link from your email."
        onDone={onDone}
      />
    );
  }

  switch (route.kind) {
    case "validate-email":
      return <ValidateEmailView emailCode={route.emailCode} onDone={onDone} />;
    case "reset-password":
      return <ResetPasswordView emailCode={route.emailCode} onDone={onDone} />;
    case "confirm-email-change":
      return (
        <ConfirmEmailChangeView emailCode={route.emailCode} onDone={onDone} />
      );
  }
}

function LinkCard({
  title,
  message,
  onDone,
  buttonLabel = "Back to sign in",
}: {
  title: string;
  message: string;
  onDone: () => void;
  buttonLabel?: string;
}) {
  return (
    <div className="mx-auto flex flex-1 w-full max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border-strong/70 bg-surface p-7 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex size-13 items-center justify-center rounded-2xl bg-danger-soft text-danger ring-1 ring-inset ring-danger/30">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {message}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="mt-6 w-full"
          onClick={onDone}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

function LoadingView({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
      <Spinner className="size-8" label={label} />
      <p className="text-sm font-medium text-ink-secondary">{label}</p>
    </div>
  );
}

function ValidateEmailView({
  emailCode,
  onDone,
}: {
  emailCode: string;
  onDone: () => void;
}) {
  const state = useCompleteSignUpWithEmailPassword(api.auth, { emailCode });

  useEffect(() => {
    if (state.status === "complete") {
      toast.success("Email verified! You are now signed in.");
      onDone();
    }
  }, [state.status, onDone]);

  if (state.status === "loading" || state.status === "complete") {
    return <LoadingView label="Verifying your email..." />;
  }

  return (
    <LinkCard
      title="Could not verify email"
      message={formatAuthError(state.userError)}
      onDone={onDone}
    />
  );
}

function ResetPasswordView({
  emailCode,
  onDone,
}: {
  emailCode: string;
  onDone: () => void;
}) {
  const state = useCompletePasswordRecovery(api.auth, { emailCode });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.status === "complete") {
      toast.success("Password updated! You are now signed in.");
      onDone();
    }
  }, [state.status, onDone]);

  if (state.status === "loading" || state.status === "complete") {
    return <LoadingView label="Checking reset link..." />;
  }

  if (state.status === "error") {
    return (
      <LinkCard
        title="Reset link unavailable"
        message={formatAuthError(state.userError)}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border-strong/70 bg-surface p-7 shadow-2xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-ink ring-1 ring-inset ring-primary/30">
          <KeyRound className="size-6" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink">
          Set a new password
        </h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Choose a new password (at least 10 characters) for your account.
        </p>
        <form
          className="mt-5 flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const result = await state.completePasswordRecovery({
                newPassword,
              });
              if (result.status === "error") {
                toast.error(formatAuthError(result.userError));
              }
            })();
          }}
        >
          <div className="relative">
            <input
              className="input-field pr-10"
              type={showPassword ? "text" : "password"}
              name="newPassword"
              autoComplete="new-password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={state.pending}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={state.pending}
            className="w-full"
          >
            {state.pending ? "Updating..." : "Reset password and sign in"}
          </Button>
          <Button variant="ghost" onClick={onDone} className="w-full">
            Back to sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

function ConfirmEmailChangeView({
  emailCode,
  onDone,
}: {
  emailCode: string;
  onDone: () => void;
}) {
  const state = useCompleteChangeEmail(api.auth, { emailCode });

  useEffect(() => {
    if (state.status === "complete") {
      toast.success("Email address updated.");
      onDone();
    }
  }, [state.status, onDone]);

  if (state.status === "loading" || state.status === "complete") {
    return <LoadingView label="Confirming email change..." />;
  }

  return (
    <LinkCard
      title="Could not update email"
      message={formatAuthError(state.userError)}
      onDone={onDone}
      buttonLabel="Back to app"
    />
  );
}
