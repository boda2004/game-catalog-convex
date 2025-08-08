/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as games from "../games.js";
import type * as gamesInternal from "../gamesInternal.js";
import type * as http from "../http.js";
import type * as rawg from "../rawg.js";
import type * as rawgClient from "../rawgClient.js";
import type * as router from "../router.js";
import type * as steam from "../steam.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  games: typeof games;
  gamesInternal: typeof gamesInternal;
  http: typeof http;
  rawg: typeof rawg;
  rawgClient: typeof rawgClient;
  router: typeof router;
  steam: typeof steam;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
