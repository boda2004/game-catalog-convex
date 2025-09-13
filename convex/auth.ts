import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: "password",
      // Enable password reset using a simple email OTP. Do not log the reset code.
      // In production, replace `sendVerificationRequest` with your email provider integration.
      reset: {
        id: "password-reset",
        name: "Password Reset",
        type: "email",
        maxAge: 60 * 30, // 30 minutes
        async sendVerificationRequest({ identifier, /* token, url, */ expires }) {
          // SECURITY: Do not log the reset code or URL to avoid leaking secrets.
          // Integrate with your email provider here to deliver the code/link to the user.
          console.info(
            "[Password Reset] Verification requested for:", identifier,
            "\nExpires:", expires.toISOString()
          );
        },
      },
    }),
    Anonymous,
  ],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
