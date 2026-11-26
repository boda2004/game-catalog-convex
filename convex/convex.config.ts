import { defineApp } from "convex/server";
import auth from "@convex-dev/auth/convex.config.js";
import authEmail from "@convex-dev/auth/components/email/convex.config.js";
import authPassword from "@convex-dev/auth/components/password/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp();
app.use(auth);
app.use(authEmail);
app.use(authPassword);
app.use(resend);

export default app;
