import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { sanitizeRedirect } from "../utils/auth";

const GH_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GH_API_USER = "https://api.github.com/user";
const GH_API_EMAILS = "https://api.github.com/user/emails";
const COOKIE_STATE = "oauth_state";
const COOKIE_VERIFIER = "oauth_code_verifier";
const COOKIE_REDIRECT = "/";
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;

export const githubCallbackRoute: FastifyPluginAsync = async (app) => {
  const {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI,
    FRONT_ORIGIN = "https://localhost:5173",
  } = process.env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_REDIRECT_URI) {
    app.log.error("missing Github OAuth env");
    throw new Error("github OAuth env variables are missing");
  }

  app.get(
    "/api/auth/github/callback",
    async (req: FastifyRequest, rep: FastifyReply) => {
      const query = req.query as any;
      const code = query?.code as string;
      const state = query?.state as string;

      const stateCookie = req.cookies[COOKIE_STATE];
      const verifier = req.cookies[COOKIE_VERIFIER];
      const postAuth = sanitizeRedirect(req.cookies[COOKIE_REDIRECT]);

      rep
        .clearCookie(COOKIE_STATE, { path: "/" })
        .clearCookie(COOKIE_VERIFIER, { path: "/" })
        .clearCookie(COOKIE_REDIRECT, { path: "/" });

      if (!code || !state || !stateCookie || !verifier || state !== stateCookie)
        return rep.code(400).send({ ok: false, error: "invalid_oauth_state" });

      const exchangeToken = await fetch(GH_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
          grant_type: "authorization_code",
          code_verifier: verifier,
        }),
      });

      if (!exchangeToken.ok) {
        app.log.error(
          { status: exchangeToken.status },
          "Github token exchange failed",
        );
        return rep.code(502).send({ ok: false, error: "no access token" });
      }

      const returnData: any = await exchangeToken.json();
      const accessToken: string | undefined = returnData.access_token;
      if (!accessToken) {
        app.log.error({ accessToken }, "no access_token from github");
        return rep.code(502).send({ ok: false, error: "no_access_token" });
      }
      const githubHeaders = {
        "User-Agent": "pong-oauth-app",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      };

      const ghUserRes = await fetch(GH_API_USER, { headers: githubHeaders });
      if (!ghUserRes.ok) {
        app.log.error({ status: ghUserRes.status }, "/user failed");
        return rep.code(502).send({ ok: false, error: "github_user_failed" });
      }

      const ghUserData: any = await ghUserRes.json();

      let email: string | null = null;
      try {
        const emailRes = await fetch(GH_API_EMAILS, { headers: githubHeaders });
        if (emailRes.ok) {
          const arr: any[] = await emailRes.json();
          const primary =
            arr.find((e) => e.primary && e.verified) ??
            arr.find((e) => e.verified);
          email = primary?.email ?? null;
        }
      } catch {}

      const now = new Date().toISOString();
      const prov = app.db
        .prepare(
          `SELECT user_id FROM auth_providers WHERE provider = 'github' AND provider_user_id = ?`,
        )
        .get(String(ghUserData.id)) as { user_id: number } | undefined;

      let userId: number;
      if (prov?.user_id) {
        userId = prov.user_id;
        app.db
          .prepare(
            `UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), updated_at = ? WHERE id = ?`,
          )
          .run(
            ghUserData.name ?? ghUserData.login ?? null,
            ghUserData.avatar_url ?? null,
            now,
            userId,
          );
      } else {
        let existing: { id: number } | undefined;
        if (email) {
          existing = app.db
            .prepare(`SELECT id FROM users WHERE email = ?`)
            .get(email) as any;
        }
        if (existing?.id) {
          userId = existing.id;
          app.db
            .prepare(
              `UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), updated_at = ? WHERE id = ?`,
            )
            .run(
              ghUserData.name ?? ghUserData.login ?? null,
              ghUserData.avatar_url ?? null,
              now,
              userId,
            );
        } else {
          const insertedData = app.db
            .prepare(
              `INSERT INTO users(name, email, password, avatar_url, created_at, updated_at) VALUES(?, ?, NULL, ?, ?, ?)`,
            )
            .run(
              ghUserData.name ?? ghUserData.login ?? null,
              email,
              ghUserData.avatar_url ?? null,
              now,
              now,
            );
          userId = Number(insertedData.lastInsertRowid);
        }

        app.db
          .prepare(
            `INSERT OR IGNORE INTO auth_providers (user_id, provider, provider_user_id, provider_login, provider_email, created_at) VALUES (?, 'github', ?, ?, ?, ?)`,
          )
          .run(
            userId,
            String(ghUserData.id),
            ghUserData.login ?? null,
            email,
            now,
          );
      }

      const token = await rep.jwtSign(
        {
          sub: String(userId),
          name: ghUserData.name ?? ghUserData.login ?? "",
          avatarUrl: ghUserData.avatar_url ?? "",
        },
        { expiresIn: "15m" },
      );

      rep.setCookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      // Set Refresh token into Cookie
      const jti = randomUUID();
      const r_now = Date.now();
      const expMs = r_now + REFRESH_TTL_SEC * 1000;

      const insertRefresh = app.db.prepare(`
  INSERT INTO refresh_tokens
    (jti, user_id, expires_at, revoked, replaced_by, created_at, user_agent, ip)
  VALUES
    (@jti, @user_id, @expires_at, @revoked, @replaced_by, @created_at, @user_agent, @ip)
`);

      const params = {
        jti,
        user_id: Number(userId), // number に正規化
        expires_at: Math.floor(expMs / 1000),
        revoked: 0,
        replaced_by: null,
        created_at: Math.floor(Date.now() / 1000),
        user_agent: req.headers["user-agent"] ?? null,
        ip: req.ip ?? null,
      };

      insertRefresh.run(params);

      const refreshToken = await rep.jwtSign(
        {
          sub: String(userId),
          jti,
        },
        { expiresIn: REFRESH_TTL_SEC },
      );

      rep.setCookie("refresh", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/auth",
        maxAge: REFRESH_TTL_SEC,
      });

      return rep.redirect(`${FRONT_ORIGIN}${postAuth}`);
    },
  );
};
