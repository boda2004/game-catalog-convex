export interface AuthUserError {
  error: string;
  minimumLength?: number;
  maximumLength?: number;
  retryAfterMs?: number;
}

export function formatAuthError(userError: AuthUserError): string {
  switch (userError.error) {
    case "USER_NOT_FOUND":
    case "INVALID_CREDENTIALS":
      return "Invalid email or password.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "EMAIL_TAKEN":
      return "An account with this email already exists.";
    case "EMAIL_NOT_FOUND":
      return "No verified account was found for that email.";
    case "PASSWORD_TOO_SHORT":
      return `Password must be at least ${userError.minimumLength ?? 10} characters long.`;
    case "PASSWORD_TOO_LONG":
      return `Password must be at most ${userError.maximumLength ?? 100} characters long.`;
    case "PASSWORD_HAS_SURROUNDING_WHITESPACE":
      return "Password cannot start or end with whitespace.";
    case "PASSWORD_TOO_COMMON":
      return "That password is too common. Please choose a stronger password.";
    case "MISSING_SECRET":
      return "Please open this link in the same browser where you started the request.";
    case "INVALID_CHALLENGE":
      return "This link has expired or was already used. Please request a new one.";
    case "INCORRECT_CODE":
      return "This link is no longer valid. Please open the most recent email you received.";
    case "WRONG_USER":
      return "Please sign in with the account that requested this email change.";
    case "NOT_LOGGED_IN":
      return "Please sign in to complete this action.";
    case "RATE_LIMITED": {
      const seconds = Math.max(
        1,
        Math.ceil((userError.retryAfterMs ?? 60_000) / 1000),
      );
      return `Too many attempts. Please try again in ${seconds}s.`;
    }
    default:
      return "Something went wrong. Please try again.";
  }
}
