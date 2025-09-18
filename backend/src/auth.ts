import { FastifyPluginAsync } from "fastify";
import { RegisterSchema, LoginSchema } from "./schemas/auth";
import bcrypt from "bcrypt";
import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
  }
}

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.decorate(
    "authenticate",
    async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        await req.jwtVerify();
      } catch {
        return rep.code(401).send({ ok: false, error: "Unauthorized" });
      }
    },
  );

  app.post(
    "/api/auth/register",
    async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        const { name, email, password } = RegisterSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = app.db.prepare(
          `INSERT INTO users (name, email, password)
					 VALUES (@name, @email, @password)`,
        );

        const info = stmt.run({
          name: name,
          email: email,
          password: hashedPassword,
        });

        return rep.code(201).send({
          ok: true,
        });
      } catch (e) {
        rep.log.error({ err: e }, "register failed");
        return rep.code(400).send({
          ok: false,
          error: e?.message ?? "Bad request",
        });
      }
    },
  );

  app.post(
    "/api/auth/login",
    async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        const { email, password } = LoginSchema.parse(req.body);

        const user = app.db
          .prepare(
            "SELECT id, email, password, name FROM users WHERE email = ?",
          )
          .get(email) as
          | { id: number; email: string; password: string; name: string }
          | undefined;

        if (!user) {
          return rep
            .code(401)
            .send({ ok: false, error: "Invalid email or password" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return rep
            .code(401)
            .send({ ok: false, error: "Invalid email or password" });
        }

        // Set Access token into Cookie
        const accessToken = await rep.jwtSign(
          {
            sub: String(user.id),
            email: user.email,
            name: user.name,
          },
          { expiresIn: "15m" },
        );

        rep.setCookie("token", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });

        // Set Refresh token into Cookie
        const jti = randomUUID();
        const now = Date.now();
        const expMs = now + REFRESH_TTL_SEC * 1000;

        const insertRefresh = app.db.prepare(`
  INSERT INTO refresh_tokens
    (jti, user_id, expires_at, revoked, replaced_by, created_at, user_agent, ip)
  VALUES
    (@jti, @user_id, @expires_at, @revoked, @replaced_by, @created_at, @user_agent, @ip)
`);

        const params = {
          jti,
          user_id: Number(user.id), // number に正規化
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
            sub: String(user.id),
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

        // // Set CSRF token into Cookie
        // const csrfToken = rep.generateCsrf();

        return rep.send({
          ok: true,
          // csrfToken,
        });
      } catch (e: any) {
        rep.log.error({ err: e }, "login failed");
        return rep.code(400).send({
          ok: false,
          error: e?.message ?? "Bad request",
        });
      }
    },
  );

  app.get(
    "/api/auth/logout",
    {
      preHandler: [app.authenticate],
      // onRequest: app.csrfProtection,
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const refreshCookie = req.cookies.refresh;

      if (refreshCookie) {
        try {
          const payload = req.server.jwt.verify(refreshCookie) as {
            sub: string;
            jti: string;
          };
          req.server.db
            .prepare("UPDATE refresh_tokens SET revoked = 1 WHERE jti = ?")
            .run(payload.jti);
        } catch {}
      }

      rep.clearCookie("token", { path: "/" });
      rep.clearCookie("refresh", { path: "/api/auth" });
      return rep.send({ ok: true });
    },
  );

  app.get(
    "/api/auth/me",
    { preHandler: [app.authenticate] },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const { sub } = req.user as { sub: string };
      const row = app.db
        .prepare("SELECT id, name, email FROM users WHERE id = ?")
        .get(Number(sub)) as
        | { id: number; name: string; email: string }
        | undefined;
      if (!row)
        return rep.code(404).send({ ok: false, error: "User not found" });
      return rep.send({
        ok: true,
        id: row.id,
        name: row.name,
        email: row.email,
      });
    },
  );
};
