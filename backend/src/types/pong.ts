export type RenderState = {
  width: number;
  height: number;
  leftY: number;
  rightY: number;
  paddleW: number;
  paddleH: number;
  ballX: number;
  ballY: number;
  ballR: number;
  leftScore: number;
  rightScore: number;
};

export type ClientMsg =
  | { type: "join"; room?: string }
  | { type: "input"; seq: number; up: boolean; down: boolean }
  | { type: "command"; command: "togglePause" };

export type ServerMsg =
  | { type: "hello"; you?: string }
  | { type: "state"; state: RenderState }
  | { type: "error"; message: string };
