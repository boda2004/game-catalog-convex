# Game Catalog Project
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`woozy-iguana-894`](https://dashboard.convex.dev/d/woozy-iguana-894).
  
## Project structure
  
The frontend code is in the `src` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

The app uses [Convex Auth v2](https://docs.convex.dev/auth/convex-auth) with the Email + Password method and `@convex-dev/resend` for email verification and password recovery links.

### Email & URL setup (required)

Configure these environment variables on your Convex deployment (locally and in production):
- `RESEND_API_KEY`: Resend API key from https://resend.com/
- `EMAIL_FROM`: Verified sender address (e.g. `"Game Catalog <no-reply@example.com>"`)
- `SITE_URL`: Public frontend base URL for emailed links (defaults to `http://localhost:5173`; for GitHub Pages set e.g. `https://<user>.github.io/<repo>`)

Notes:
- New accounts must verify their email via the emailed link in the same browser before signing in.
- Password recovery sends a 10-minute reset link to the verified email address.
- New passwords must be at least 10 characters long.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve your app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.


## Release Please demo

- Added this section to test automated release notes and versioning.

