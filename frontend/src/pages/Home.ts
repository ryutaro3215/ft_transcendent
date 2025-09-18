import type { Page } from "../types/page";
import { h } from "../ui/h";

export class Home implements Page {
  private root!: HTMLElement;

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      {},
      h("h1", { className: "text-blue-500 text-2xl font-bold mb-4" }, "Home"),
      h("p", {}, "Vanilla TS + Tailwind のコンポーネント設計。"),
    );
    container.replaceChildren(this.root);
  }

  unmount() {
    this.root.remove();
  }
}
