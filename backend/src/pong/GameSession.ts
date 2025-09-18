import type { RenderState, ServerMsg } from "../types/pong";
import { WebSocket } from "ws";

const W = 720;
const H = 420;
const PADDLE_W = 10;
const PADDLE_H = 90;
const BALL_R = 6;

const PADDLE_SPEED = 360;
const BALL_SPEED0 = 280;
const TICK_HZ = 60;
const TICK_MS = 1000 / TICK_HZ;

export class GameSession {
  left?: WebSocket;
  rightAI = true;
  spectators = new Set<WebSocket>();

  inputLeft = { up: false, down: false };

  state: RenderState = {
    width: W,
    height: H,
    leftY: (H - PADDLE_H) / 2,
    rightY: (H - PADDLE_H) / 2,
    paddleW: PADDLE_W,
    paddleH: PADDLE_H,
    ballX: W / 2,
    ballY: H / 2,
    ballR: BALL_R,
    leftScore: 0,
    rightScore: 0,
  };

  vx: number = BALL_SPEED0 * (Math.random() < 0.5 ? -1 : 1);
  vy: number = BALL_SPEED0 * (Math.random() * 0.6 - 0.3);

  lastTick = Date.now();
  timer: NodeJS.Timeout | null = null;

  start() {
    if (this.timer) return;
    this.lastTick = Date.now();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private tick() {
    //tickにでかい値が来ても大丈夫なように0.05にmaxを設定しておく。
    const now = Date.now();
    const dt = Math.min(0.05, (now - this.lastTick) / 1000);
    this.lastTick = now;

    // left paddleの制御。press ↑ -1, press ↓ 1
    // y座標は上向がマイナス、下向きがプラス
    const intent =
      this.inputLeft.up && !this.inputLeft.down
        ? -1
        : this.inputLeft.down && !this.inputLeft.up
          ? +1
          : 0;
    // move left paddle according to intent
    this.state.leftY += intent * PADDLE_SPEED * dt;

    // ballの中心とpaddleのy座標との差分を見て移動を決める
    // ただし、PADDLE_SPEEDとdtの積が移動の上限値
    if (this.rightAI) {
      const target = this.state.ballY - this.state.paddleH / 2;
      const dy = target - this.state.rightY;
      const max = PADDLE_SPEED * dt * 0.9;

      this.state.rightY += Math.max(-max, Math.min(max, dy));
    }

    // paddle移動の上限と下限を決めておく。上に行きすぎたら0に丸めて、H - PADDLE_Hよりも大きくなる、つまり下に行きすぎたらH - PADDLE_Hに丸める
    this.state.leftY = Math.max(0, Math.min(H - PADDLE_H, this.state.leftY));
    this.state.rightY = Math.max(0, Math.min(H - PADDLE_H, this.state.rightY));

    // ballの移動
    this.state.ballX += this.vx * dt;
    this.state.ballY += this.vy * dt;

    if (this.state.ballY - BALL_R < 0) {
      this.state.ballY = BALL_R;
      this.vy = Math.abs(this.vy);
    } else if (this.state.ballY + BALL_R > H) {
      this.state.ballY = H - BALL_R;
      this.vy = -Math.abs(this.vy);
    }

    if (this.state.ballX - BALL_R <= 24 + PADDLE_W) {
      const withinY: boolean =
        this.state.ballY >= this.state.leftY &&
        this.state.ballY <= this.state.leftY + PADDLE_H;
      if (withinY && this.vx < 0) {
        this.state.ballX = 24 + PADDLE_W + BALL_R;
        // Speed up
        this.vx = Math.abs(this.vx) * 1.03;
        this.vy +=
          ((this.state.ballY - (this.state.leftY + PADDLE_H / 2)) /
            (PADDLE_H / 2)) *
          80;
      }
    }

    if (this.state.ballX + BALL_R >= -W - (24 + PADDLE_W)) {
      const withinY: boolean =
        this.state.ballY >= this.state.rightY &&
        this.state.ballY <= this.state.rightY + PADDLE_H;
      if (withinY && this.vx > 0) {
        this.state.ballX = W - (24 + PADDLE_W) - BALL_R;
        this.vx = -Math.abs(this.vx) * 1.03;
        this.vy +=
          ((this.state.ballY - (this.state.rightY + PADDLE_H / 2)) /
            (PADDLE_H / 2)) *
          80;
      }
    }

    if (this.state.ballX < -20) {
      this.state.rightScore++;
      this.resetBall(+1);
    } else if (this.state.ballX > W + 20) {
      this.state.leftScore++;
      this.resetBall(-1);
    }

    const payload: ServerMsg = { type: "state", state: this.state };
    const msg = JSON.stringify(payload);
    if (this.left?.readyState === WebSocket.OPEN) this.left.send(msg);
    for (const ws of this.spectators) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }

  private resetBall(dir: -1 | 1) {
    this.state.ballX = W / 2;
    this.state.ballY = H / 2;
    const speed = BALL_SPEED0 * 1.0;
    this.vx = speed * dir;
    this.vy = speed * (Math.random() * 0.4 - 0.2);
  }

  setLeftInput(up: boolean, down: boolean) {
    this.inputLeft.up = up;
    this.inputLeft.down = down;
  }
}
