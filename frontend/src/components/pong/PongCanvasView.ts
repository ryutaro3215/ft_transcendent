// src/components/pong/PongCanvasView.ts
import type { Component } from "../../types/component";
import { h } from "../../ui/h";
import type { RenderState } from "../../types/pong";

export type PongCanvasProps = {
  width?: number; // 表示サイズ（CSS px）
  height?: number;
};

export class PongCanvasView implements Component<PongCanvasProps> {
  private root!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private opts: Required<PongCanvasProps>;

  constructor(props: PongCanvasProps = {}) {
    this.opts = {
      width: props.width ?? 720,
      height: props.height ?? 420,
    };
  }

  mount(container: HTMLElement) {
    this.root = h(
      "div",
      { className: "w-full flex justify-center" },
      (this.canvas = h("canvas", {
        className: "rounded-3xl shadow-2xl border border-white/10 bg-slate-900",
        style: `width:${this.opts.width}px;height:${this.opts.height}px;display:block;`,
      }) as HTMLCanvasElement),
    );
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;

    container.append(this.root);

    // 1回だけ描画
    this.setupDPR();
    this.drawStaticScene();
  }

  unmount() {
    this.root.remove();
  }

  render(state: RenderState) {
    const ctx = this.ctx;
    const W = this.opts.width;
    const H = this.opts.height;

    //background gradation
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1220");
    g.addColorStop(1, "#0a0f1a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    //center line
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#ffffff";
    const midX = W / 2 - 1.5;
    const w = 3;
    const dashH = 18;
    const gap = 12;

    for (let y = 0; y < H; y += dashH + gap) {
      ctx.fillRect(midX, y, w, dashH);
    }
    ctx.restore();

    const sx = W / state.width;
    const sy = H / state.height;
    ctx.fillStyle = "#e8edf7";
    roundRect(ctx, 24, state.leftY * sy, 10, state.paddleH * sy, 0.5);
    roundRect(ctx, W - (10 + 24), state.rightY * sy, 10, state.paddleH * sy, 5);

    //Ball
    ctx.beginPath();
    ctx.arc(
      state.ballX * sx,
      state.ballY * sy,
      Math.max(2, state.ballR * ((sx + sy) / 2), 0, Math.PI * 2),
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "#f7c948";
    ctx.fill();

    // Score
    ctx.font =
      "bold 32px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(String(state.leftScore), W * 0.5 - 60, 16);
    ctx.fillText(String(state.rightScore), W * 0.5 + 36, 16);
  }

  private setupDPR() {
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const cssW = this.opts.width;
    const cssH = this.opts.height;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private drawStaticScene() {
    const ctx = this.ctx,
      W = this.opts.width,
      H = this.opts.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1220");
    g.addColorStop(1, "#0a0f1a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
