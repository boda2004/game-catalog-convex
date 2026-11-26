import {
  useCompleteChangeEmail,
  useCompletePasswordRecovery,
  useCompleteSignUpWithEmailPassword,
} from "@convex-dev/auth/methods/email-password/react";
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
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-xl border border-border-subtle bg-surface p-6 text-center shadow-xs">
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{message}</p>
        <Button
          variant="primary"
          size="lg"
          className="mt-5 w-full"
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
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <Spinner className="size-8" label={label} />
      <p className="text-sm text-ink-secondary">{label}</p>
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
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-xl border border-border-subtle bg-surface p-6 shadow-xs">
        <h1 className="text-xl font-semibold text-ink">Set a new password</h1>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Choose a new password (at least 10 characters) for your account.
        </p>
        <form
          className="mt-4 flex flex-col gap-3.5"
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
          <input
            className="input-field"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={state.pending}
            required
          />
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
