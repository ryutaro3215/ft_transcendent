import type { Page } from "../types/page";
import { h } from "../ui/h";

export class About implements Page {
  private root!: HTMLElement;

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      {},
      h("h1", { className: "text-blue-500 text-2xl font-bold mb-4" }, "About"),
      h("p", {}, "This is About page"),
    );
    container.replaceChildren(this.root);
  }

  unmount() {
    this.root.remove();
  }
}
