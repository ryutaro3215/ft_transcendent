// src/components/pong/ControlsHint.ts
import type { Component } from "../../types/component";
import { h } from "../../ui/h";

export class ControlsHint implements Component {
  private root!: HTMLElement;

  mount(container: HTMLElement) {
    this.root = h(
      "div",
      { className: "mt-3 flex items-center gap-3 text-xs text-white/80" },
      h(
        "div",
        { className: "flex items-center gap-1" },
        keycap("↑"),
        keycap("↓"),
        h("span", { className: "opacity-80" }, "to move"),
      ),
      h(
        "div",
        { className: "flex items-center gap-1" },
        keycap("Space"),
        h("span", { className: "opacity-80" }, "start / pause"),
      ),
    );
    container.append(this.root);
  }

  unmount() {
    this.root.remove();
  }
}

function keycap(label: string) {
  return h(
    "span",
    {
      className:
        "px-2 py-1 rounded-md border border-white/20 bg-white/10 backdrop-blur-sm font-mono",
    },
    label,
  );
}
