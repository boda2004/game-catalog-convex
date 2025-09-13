"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<
    "signIn" | "signUp" | "reset" | "reset-verification"
  >("signIn");
  const [submitting, setSubmitting] = useState(false);

  const isAuthFlow = flow === "signIn" || flow === "signUp";

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          formData.set("flow", flow);

          // Map UI flows to provider flows
          if (flow === "reset-verification") {
            // Provider expects `newPassword` when verifying reset code
            const newPassword = (formData.get("newPassword") as string) ?? "";
            if (!newPassword || newPassword.length < 8) {
              toast.error("Password must be at least 8 characters long.");
              setSubmitting(false);
              return;
            }
          }

          void signIn("password", formData)
            .then(() => {
              if (flow === "reset") {
                toast.success(
                  "If an account exists for that email, we've sent a reset code."
                );
                setFlow("reset-verification");
                setSubmitting(false);
                return;
              }
              if (flow === "reset-verification") {
                toast.success("Password updated. You can now sign in.");
                setFlow("signIn");
              }
              setSubmitting(false);
            })
            .catch((error: any) => {
              let toastTitle = "";
              if (
                typeof error?.message === "string" &&
                error.message.includes("Invalid password")
              ) {
                toastTitle = "Invalid password. Please try again.";
              } else if (
                typeof error?.message === "string" &&
                error.message.includes("Invalid code")
              ) {
                toastTitle =
                  "Invalid code. Please check your email and try again.";
              } else {
                toastTitle =
                  flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : flow === "signUp"
                    ? "Could not sign up, did you mean to sign in?"
                    : flow === "reset"
                    ? "Could not start password reset. Please try again."
                    : "Could not reset password. Please try again.";
              }
              toast.error(toastTitle);
              setSubmitting(false);
            });
        }}
      >
        {/* Email is needed for all flows */}
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />

        {isAuthFlow && (
          <input
            className="auth-input-field"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        )}

        {flow === "reset" && (
          <p className="text-sm text-secondary">
            Enter your email and we'll send you a reset code.
          </p>
        )}

        {flow === "reset-verification" && (
          <>
            <input
              className="auth-input-field"
              type="text"
              name="code"
              placeholder="Reset code"
              required
            />
            <input
              className="auth-input-field"
              type="password"
              name="newPassword"
              placeholder="New password"
              required
            />
          </>
        )}

        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn"
            ? "Sign in"
            : flow === "signUp"
            ? "Sign up"
            : flow === "reset"
            ? "Send reset code"
            : "Set new password"}
        </button>

        <div className="text-center text-sm text-secondary">
          {isAuthFlow ? (
            <>
              <div className="mb-2">
                <button
                  type="button"
                  className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
                  onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                >
                  {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
                </button>
              </div>
              <button
                type="button"
                className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
                onClick={() => setFlow("reset")}
              >
                Forgot your password?
              </button>
            </>
          ) : (
            <button
              type="button"
              className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
              onClick={() => setFlow("signIn")}
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <button className="auth-button" onClick={() => void signIn("anonymous")}>
        Sign in anonymously
      </button>
    </div>
  );
}
