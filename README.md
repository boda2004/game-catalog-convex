# Game Catalog Project
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`woozy-iguana-894`](https://dashboard.convex.dev/d/woozy-iguana-894).
  
## Project structure
  
The frontend code is in the `src` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign-in. You may wish to change this before deploying your app.

### Lost password (password reset)

The app supports password reset for accounts created with the password provider.

How it works:
- On the sign-in form, click "Forgot your password?".
- Enter your email to request a reset code.
- Check your email for the code. The server sends the code via the Resend email API (see `convex/auth.ts`).
- Enter the code and your new password in the form to complete the reset.

Email setup (required):
- Create a Resend account and get an API key: https://resend.com/
- Configure these environment variables for Convex (locally and in production):
  - RESEND_API_KEY
  - EMAIL_FROM (e.g. "Game Catalog <no-reply@example.com>")
  - EMAIL_SUBJECT (optional, default: "Your password reset code")
  - EMAIL_REPLY_TO (optional)

Notes:
- Passwords must be at least 8 characters long.
- Reset codes and links are not logged anywhere by the server.
- If email is not configured, starting a password reset will fail with a clear error.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve your app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.


## Release Please demo

- Added this section to test automated release notes and versioning.

