import { useStartChangeEmail } from "@convex-dev/auth/methods/email-password/react";
import * as Tabs from "@radix-ui/react-tabs";
import { useMutation } from "convex/react";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);

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
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-ink ring-1 ring-inset ring-primary/25">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-ink">
                Account Security
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-secondary">
                Update your password or change your login email.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <Tabs.Root
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="space-y-5"
          >
            <Tabs.List className="grid grid-cols-2 rounded-xl border border-border-subtle bg-surface-subtle p-1">
              <Tabs.Trigger
                value="password"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-ink-muted transition-all data-[state=active]:bg-surface-elevated data-[state=active]:text-ink data-[state=active]:shadow-xs data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-border-subtle"
              >
                <KeyRound className="size-3.5" />
                Password
              </Tabs.Trigger>
              <Tabs.Trigger
                value="email"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-ink-muted transition-all data-[state=active]:bg-surface-elevated data-[state=active]:text-ink data-[state=active]:shadow-xs data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-border-subtle"
              >
                <Mail className="size-3.5" />
                Email
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="password" className="outline-hidden">
              <form
                id="change-password-form"
                className="space-y-3.5"
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
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-ink-secondary">
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
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-ink-secondary">
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
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-subtle/60 px-3.5 py-2.5 text-xs font-medium text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={signOutOthers}
                    onChange={(e) => setSignOutOthers(e.target.checked)}
                    className="size-4 rounded accent-primary"
                  />
                  Sign out all other active devices
                </label>
              </form>
            </Tabs.Content>

            <Tabs.Content value="email" className="outline-hidden">
              <form
                id="change-email-form"
                className="space-y-3.5"
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
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-ink-secondary">
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
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-ink-secondary">
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
            </Tabs.Content>
          </Tabs.Root>
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
