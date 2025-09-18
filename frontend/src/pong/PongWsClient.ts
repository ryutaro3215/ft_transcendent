import type { RenderState, ClientMsg, ServerMsg } from "../types/pong";
import { buildWsUrl } from "../utils/pong";
import type { InputState } from "./InputTracker";

type Options = {
  apiOrigin: string;
  path?: string;
  onState?: (s: RenderState) => void;
  onOpen?: () => void;
  onClose?: () => void;
  room?: string;
};

export class PongWsClient {
  private ws: WebSocket | null = null;
  private opts: Required<Options>;
  private seq: number = 0;
  private lastSent: InputState = { up: false, down: false };
  private want: InputState = { up: false, down: false };
  private sending: boolean = false;
  private closed: boolean = false;
  private backoff: number = 500;

  constructor(opts: Options) {
    this.opts = {
      path: "/ws/pong",
      onState: () => {},
      onClose: () => {},
      onOpen: () => {},
      ...opts,
    } as Required<Options>;
  }

  connect() {
    this.closed = false;
    const url = buildWsUrl(this.opts.path, this.opts.apiOrigin);
    console.log(url);
    console.log("Connect to server");
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    ws.onopen = () => {
      console.log("onopen event");
      this.backoff = 500;
      this.opts.onOpen();
      const join: ClientMsg = { type: "join", room: this.opts.room };
      ws.send(JSON.stringify(join));
      this.pump();
    };

    ws.onmessage = (ev) => {
      console.log("onmessage event");
      try {
        const msg: ServerMsg = JSON.parse(
          typeof ev.data === "string"
            ? ev.data
            : new TextDecoder().decode(ev.data),
        );
        if (msg.type === "state") this.opts.onState(msg.state);
      } catch {}
    };

    ws.onclose = (ev) => {
      console.log("onclose event", ev.code, ev.reason);
      console.log("onclose event");
      this.opts.onClose();
      this.ws = null;
      if (!this.closed) this.scheduleReconnect();
    };

    ws.onerror = (ev) => {
      console.error("onerror event", ev);
    };
  }

  disconnect() {
    this.closed = true;
    this.ws?.close();
    this.ws = null;
  }

  setInput(up: boolean, down: boolean) {
    this.want.up = up;
    this.want.down = down;
  }

  startGame() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const msg: ClientMsg = { type: "start" };
    try {
      this.ws.send(JSON.stringify(msg));
    } catch {}
  }

  private scheduleReconnect() {
    const t = this.backoff;
    this.backoff = Math.min(this.backoff * 1.7, 8000);
    setTimeout(() => {
      if (!this.closed) this.connect();
    }, t);
  }

  private pump() {
    if (this.sending === true) return;
    this.sending = true;

    const tick = () => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.sending = false;
        return;
      }

      const diff: boolean =
        this.want.up !== this.lastSent.up ||
        this.want.down !== this.lastSent.down;

      if (diff) {
        const msg: ClientMsg = {
          type: "input",
          seq: ++this.seq,
          up: this.want.up,
          down: this.want.down,
        };
        try {
          this.ws.send(JSON.stringify(msg));
        } catch {}
        this.lastSent = { ...this.want };
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
