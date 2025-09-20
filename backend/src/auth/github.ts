import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { buildPkce } from "../utils/auth";
import dotenv from "dotenv";
import { sanitizeRedirect } from "../utils/auth";
dotenv.config();

const GH_AUTH_URL = "https://github.com/login/oauth/authorize";
const COOKIE_STATE = "oauth_state";
const COOKIE_VERIFIER = "oauth_code_verifier";
const COOKIE_REDIRECT = "post_auth_redirect";

// Check path of destonation of redirect, allow only relative begin with "/"

export const githubLoginRoute: FastifyPluginAsync = async (app) => {
  const { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } = process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_REDIRECT_URI) {
    app.log.error("missing GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI");
    throw new Error("github OAuth env variables are missing");
  }

  app.get(
    "/api/auth/github/login",
    async (req: FastifyRequest, rep: FastifyReply) => {
      const redirect_to = sanitizeRedirect((req.query as any)?.redirect_to);
      const { state, code_verifier, code_challenge } = buildPkce();
      const cookie = {
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        secure: true,
        maxAge: 60 * 5,
      };

      rep
        .setCookie(COOKIE_STATE, state, cookie)
        .setCookie(COOKIE_VERIFIER, code_verifier, cookie)
        .setCookie(COOKIE_REDIRECT, redirect_to, cookie);

      const redirectUrl = new URL(GH_AUTH_URL);

      redirectUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
      redirectUrl.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI);
      redirectUrl.searchParams.set("scope", "read:user user:email");
      redirectUrl.searchParams.set("state", state);
      redirectUrl.searchParams.set("code_challenge", code_challenge);
      redirectUrl.searchParams.set("code_challenge_method", "S256");
      return rep.redirect(redirectUrl.toString());
    },
  );
};
