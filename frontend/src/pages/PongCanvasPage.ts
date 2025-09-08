// src/pages/PongCanvasPage.ts
import type { Component } from "../types/component";
import { h } from "../ui/h";
import { PongCanvasView } from "../components/pong/PongCanvasView";

export class PongCanvasPage implements Component {
  private root!: HTMLElement;
  private view = new PongCanvasView({ width: 720, height: 420 });

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      {
        className: "w-full max-w-5xl mx-auto px-4 py-6 md:py-8 text-slate-100",
      },
      h(
        "div",
        { className: "flex items-center justify-between mb-4" },
        h("h2", { className: "text-lg md:text-xl font-semibold" }, "Pong Game"),
        h("div", { className: "text-xs opacity-70" }, "no animation, UI only"),
      ),
      h("div", { className: "flex justify-center" }), // ← Canvas mount 先
    );
    container.append(this.root);

    const host = this.root.querySelector(
      "div.flex.justify-center",
    ) as HTMLElement;
    this.view.mount(host);
  }

  unmount() {
    this.view.unmount();
    this.root.remove();
  }
}
