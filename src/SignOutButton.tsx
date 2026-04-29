"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="rounded-lg border border-[#c6c5d3] bg-white px-3 py-1.5 text-sm font-semibold text-[#454651] transition-colors hover:bg-[#f5f2fa]"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
