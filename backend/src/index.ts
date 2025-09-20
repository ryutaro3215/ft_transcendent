import Fastify from "fastify";
import fs from "node:fs";
import { userRoutes } from "./auth/auth";
import sqlitePlugin from "./database/sqlite";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import csrf from "@fastify/csrf-protection";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import { registerPongWs } from "./pong";
import { githubLoginRoute } from "./auth/github";
import { githubCallbackRoute } from "./auth/githubRedirect";
dotenv.config();

const app = Fastify({
  logger: true,
  // http2: true,
  https: {
    key: fs.readFileSync("./localhost+2-key.pem"),
    cert: fs.readFileSync("./localhost+2.pem"),
    // allowHTTP1: true,
  },
});

await app.register(cors, {
  origin: "https://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
await app.register(sqlitePlugin);
await app.register(cookie);
await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  cookie: { cookieName: "token", signed: false },
});

app.register(csrf, {
  cookieOpts: {
    path: "/",
    sameSite: "lax",
    secure: true,
    signed: false,
    httpOnly: false,
  },
});

await app.register(userRoutes);
await app.register(registerPongWs);
await app.register(githubLoginRoute);
await app.register(githubCallbackRoute);

// app.get("/", () => {
//   console.log("API server connection is running");
// });
//
// app.get("/health", async (req, res) => {
//   const row = app.db.prepare("SELECT COUNT(*) AS c FROM users").get();
//   return { ok: true, users: (row as any).c };
// });

await app.listen({ port: 3443, host: "0.0.0.0" });
console.log("listening on https://localhost:3443");
