// src/components/pong/Scoreboard.ts
import type { Component } from "../../types/component";
import { h } from "../../ui/h";

export type ScoreboardProps = {
  leftName?: string;
  rightName?: string;
  leftScore?: number;
  rightScore?: number;
};

export class Scoreboard implements Component<ScoreboardProps> {
  private root!: HTMLElement;
  private leftEl!: HTMLElement;
  private rightEl!: HTMLElement;
  private props: ScoreboardProps;

  constructor(props: ScoreboardProps) {
    props = {};
    this.props = props;
  }

  mount(container: HTMLElement) {
    const {
      leftName = "YOU",
      rightName = "CPU",
      leftScore = 0,
      rightScore = 0,
    } = this.props;

    this.leftEl = h(
      "span",
      { className: "tabular-nums text-3xl md:text-4xl font-bold" },
      String(leftScore),
    );
    this.rightEl = h(
      "span",
      { className: "tabular-nums text-3xl md:text-4xl font-bold" },
      String(rightScore),
    );

    this.root = h(
      "div",
      {
        className:
          "w-full flex items-center justify-between px-4 py-3 bg-black/40 text-white rounded-2xl shadow-lg",
      },
      h(
        "div",
        { className: "flex items-center gap-2" },
        h(
          "span",
          { className: "text-xs uppercase tracking-widest opacity-70" },
          "Player",
        ),
        h("span", { className: "font-semibold" }, leftName),
      ),
      h(
        "div",
        { className: "flex items-center gap-4" },
        this.leftEl,
        h("span", { className: "text-xl md:text-2xl opacity-70" }, ":"),
        this.rightEl,
      ),
      h(
        "div",
        { className: "flex items-center gap-2" },
        h(
          "span",
          { className: "text-xs uppercase tracking-widest opacity-70" },
          "Opponent",
        ),
        h("span", { className: "font-semibold" }, rightName),
      ),
    );

    container.append(this.root);
  }

  unmount() {
    this.root.remove();
  }
}
