"use client";
import {
  useCompleteChangeEmail,
  useCompletePasswordRecovery,
  useCompleteSignUpWithEmailPassword,
} from "@convex-dev/auth/methods/email-password/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import type { AuthLinkRoute } from "./lib/authLinkRoute";

function formatLinkError(userError: {
  error: string;
  minimumLength?: number;
  maximumLength?: number;
}): string {
  switch (userError.error) {
    case "MISSING_SECRET":
      return "Please open this link in the same browser where you started the request.";
    case "INVALID_CHALLENGE":
      return "This link has expired or was already used. Please request a new one.";
    case "INCORRECT_CODE":
      return "This link is no longer valid. Please open the most recent email you received.";
    case "EMAIL_TAKEN":
      return "This email address is already linked to another account.";
    case "WRONG_USER":
      return "Please sign in with the account that requested this email change.";
    case "NOT_LOGGED_IN":
      return "Please sign in to complete this email change.";
    case "PASSWORD_TOO_SHORT":
      return `Password must be at least ${userError.minimumLength ?? 10} characters long.`;
    case "PASSWORD_TOO_LONG":
      return `Password must be at most ${userError.maximumLength ?? 100} characters long.`;
    case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
      return "Password cannot start or end with whitespace.";
    case "PASSWORD_TOO_COMMON":
      return "That password is too common. Please choose a stronger password.";
    default:
      return "This link could not be processed. Please try again.";
  }
}

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
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-container border border-[#dbd9e1] bg-white p-6 text-center shadow-xs">
        <h1 className="mb-2 text-xl font-semibold text-[#1b1b21]">{title}</h1>
        <p className="mb-4 text-sm text-secondary">{message}</p>
        <button type="button" className="auth-button" onClick={onDone}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function LoadingView({ label }: { label: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="text-sm text-secondary">{label}</p>
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
      message={formatLinkError(state.userError)}
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
        message={formatLinkError(state.userError)}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-container border border-[#dbd9e1] bg-white p-6 shadow-xs">
        <h1 className="mb-2 text-xl font-semibold text-[#1b1b21]">
          Set a new password
        </h1>
        <p className="mb-4 text-sm text-secondary">
          Choose a new password (at least 10 characters) for your account.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const result = await state.completePasswordRecovery({
                newPassword,
              });
              if (result.status === "error") {
                toast.error(formatLinkError(result.userError));
              }
            })();
          }}
        >
          <input
            className="auth-input-field"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={state.pending}
            required
          />
          <button
            className="auth-button"
            type="submit"
            disabled={state.pending}
          >
            Reset password and sign in
          </button>
          <button
            type="button"
            className="cursor-pointer text-sm font-medium text-primary hover:text-primary-hover hover:underline"
            onClick={onDone}
          >
            Back to sign in
          </button>
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
      message={formatLinkError(state.userError)}
      onDone={onDone}
      buttonLabel="Back to app"
    />
  );
}
