import type { FastifyInstance } from "fastify";
import type { IncomingMessage } from "http";
import type { Socket } from "node:net";
import { WebSocketServer, WebSocket } from "ws";
import { GameSession } from "./pong/GameSession";
import { FastifyPluginAsync } from "fastify";

const ALLOW_ORIGIN = process.env.FRONT_ORIGIN ?? "https://localhost:5173";

export const registerPongWs: FastifyPluginAsync = async (
  app: FastifyInstance,
) => {
  const wss = new WebSocketServer({ noServer: true });

  const session = new GameSession();
  session.start();

  app.server.on(
    "upgrade",
    (req: IncomingMessage, socket: Socket, head: Buffer) => {
      console.log("[upgrade] url=", req.url, "origin=", req.headers.origin);
      try {
        const url = req.url || "";
        if (!url.startsWith("/ws/pong")) {
          socket.destroy();
          return;
        }

        const origin = (req.headers.origin || "").toString();
        if (ALLOW_ORIGIN && origin && origin !== ALLOW_ORIGIN) {
          socket.destroy();
          return;
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit("connection", ws, req);
        });
      } catch {
        socket.destroy();
      }
    },
  );

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    console.log(
      "[wss] connection origin=%s url=%s",
      (req.headers.origin || "").toString(),
      req.url,
    );
    if (!session.left) {
      session.left = ws;
    } else {
      session.spectators.add(ws);
    }

    safeSend(ws, { type: "hello" });

    ws.on("message", (data) => {
      let text: string;
      if (typeof data === "string") text = data;
      else if (Buffer.isBuffer(data)) text = data.toString("utf-8");
      else text = String(data);

      try {
        const msg = JSON.parse(text) as
          | { type: "join"; room?: string }
          | { type: "input"; seq: number; up: boolean; down: boolean };

        if (msg.type === "input") {
          if (ws === session.left) {
            session.setLeftInput(!!msg.up, !!msg.down);
          }
        }
      } catch {
        safeSend(ws, { type: "error", message: "bad message" });
      }
    });

    ws.on("close", (code, reason) => {
      console.log(
        "[wss] close code=%d reason=%s",
        code,
        reason instanceof Buffer ? reason.toString() : String(reason),
      ); // ★ 追記
      if (ws === session.left) {
        session.left = undefined;
        session.setLeftInput(false, false);
      } else {
        session.spectators.delete(ws);
      }
    });

    ws.on("error", (err) => {
      console.error("[wss] error:", err);
    });

    app.addHook("onClose", (_app, done) => {
      try {
        session.stop();
        wss.clients.forEach((c) => c.close());
        wss.close();
      } finally {
        done();
      }
    });
  });

  function safeSend(ws: WebSocket, obj: unknown) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }
};
