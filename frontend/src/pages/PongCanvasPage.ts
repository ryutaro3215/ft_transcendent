// src/pages/PongCanvasPage.ts
import type { Component } from "../types/component";
import { h } from "../ui/h";
import { PongCanvasView } from "../components/pong/PongCanvasView";
import { InputTracker } from "../pong/InputTracker";
import { PongWsClient } from "../pong/PongWsClient";

const API_ORIGIN =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_ORIGIN) ||
  "https://localhost:3443";

export class PongCanvasPage implements Component {
  private root!: HTMLElement;
  private statusEl!: HTMLElement;
  private view = new PongCanvasView({ width: 720, height: 420 });
  private client: PongWsClient | null = null;
  private tracker = new InputTracker(
    (s) => this.client?.setInput(s.up, s.down),
    () => this.client?.togglePause(),
  );

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      {
        className: "w-full max-w-5xl mx-auto px-4 py-6 md:py-8 text-slate-100",
      },
      h(
        "div",
        { className: "flex items-center justify-between mb-4" },
        h(
          "h2",
          { className: "text-lg md:text-xl font-semibold" },
          "Pong Online",
        ),
        (this.statusEl = h(
          "span",
          { className: "text-xs px-2 py-1 rounded bg-slate-700/70" },
          "connecting…",
        ) as HTMLElement),
      ),
      h("div", { className: "flex justify-center" }),
      h(
        "p",
        { className: "mt-3 text-xs text-slate-400" },
        "操作: when you push ↑/W, paddle is up, when you push ↓/S, paddle is down",
      ),
    );
    container.append(this.root);

    // mounting canvas
    const host = this.root.querySelector(
      "div.flex.justify-center",
    ) as HTMLElement;
    this.view.mount(host);

    //Start Tracking input
    this.tracker.start();

    // Make PongWsClient
    this.client = new PongWsClient({
      apiOrigin: API_ORIGIN,
      path: "/ws/pong",
      onState: (state) => this.view.render(state),
      onOpen: () => this.setStatus("connected", "bg-emerald-700/70"),
      onClose: () => this.setStatus("disconnected", "bg-rose-700/70"),
      room: undefined,
    });

    //connecting to server
    this.client.connect();
    this.setStatus("connecting…", "bg-slate-700/70");
  }

  unmount() {
    this.tracker.stop();
    this.client?.disconnect();
    this.view.unmount();
    this.root.remove();
  }

  private setStatus(text: string, cls: string) {
    if (!this.statusEl) return;
    this.statusEl.className = `text-xs px-2 py-1 rounded ${cls}`;
    this.statusEl.textContent = text;
  }
}
