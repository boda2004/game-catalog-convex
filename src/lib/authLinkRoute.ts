export type AuthLinkRoute =
  | { kind: "validate-email"; emailCode: string }
  | { kind: "reset-password"; emailCode: string }
  | { kind: "confirm-email-change"; emailCode: string };

export function getAuthLinkRoute(): AuthLinkRoute | null {
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  let pathname = window.location.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const emailCode =
    new URLSearchParams(window.location.search).get("code") ?? "";

  if (normalizedPath === "/validate-email") {
    return { kind: "validate-email", emailCode };
  }
  if (normalizedPath === "/reset-password") {
    return { kind: "reset-password", emailCode };
  }
  if (normalizedPath === "/confirm-email-change") {
    return { kind: "confirm-email-change", emailCode };
  }
  return null;
}
