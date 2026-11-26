import { useStartChangeEmail } from "@convex-dev/auth/methods/email-password/react";
import { useMutation } from "convex/react";
import { KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import { formatAuthError } from "./authErrors";

type Tab = "password" | "email";

export function AccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>("password");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const changePassword = useMutation(api.auth.changePassword);
  const { startChangeEmail, pending: changingEmail } = useStartChangeEmail(
    api.auth,
  );

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewEmail("");
    setEmailPassword("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-ink">
            Account Security
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-ink-secondary">
            Update your password or request an email address change.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 rounded-lg border border-border-subtle bg-surface-subtle p-1">
            <button
              type="button"
              onClick={() => setTab("password")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors",
                tab === "password"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              <KeyRound className="size-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => setTab("email")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors",
                tab === "email"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              <Mail className="size-3.5" />
              Email
            </button>
          </div>

          {tab === "password" ? (
            <form
              id="change-password-form"
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setChangingPassword(true);
                  try {
                    const result = await changePassword({
                      currentPassword,
                      newPassword,
                      signOutOtherSessions: signOutOthers,
                    });
                    if (result.success) {
                      toast.success("Password updated.");
                      reset();
                      onOpenChange(false);
                    } else {
                      toast.error(formatAuthError(result.userError));
                    }
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Failed to change password",
                    );
                  } finally {
                    setChangingPassword(false);
                  }
                })();
              }}
            >
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-ink-muted">
                  Current password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-ink-muted">
                  New password (min 10 characters)
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={signOutOthers}
                  onChange={(e) => setSignOutOthers(e.target.checked)}
                  className="rounded border-border-strong"
                />
                Sign out other devices
              </label>
            </form>
          ) : (
            <form
              id="change-email-form"
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  const result = await startChangeEmail({
                    newEmail,
                    currentPassword: emailPassword,
                  });
                  if (result.success) {
                    toast.success(
                      "Confirmation link sent to your new email. Open it in this browser.",
                    );
                    reset();
                    onOpenChange(false);
                  } else {
                    toast.error(formatAuthError(result.userError));
                  }
                })();
              }}
            >
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-ink-muted">
                  New email address
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className="input-field"
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-ink-muted">
                  Current password
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </label>
            </form>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {tab === "password" ? (
            <Button
              type="submit"
              form="change-password-form"
              variant="primary"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Update password"}
            </Button>
          ) : (
            <Button
              type="submit"
              form="change-email-form"
              variant="primary"
              disabled={changingEmail}
            >
              {changingEmail ? "Sending..." : "Send verification link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
