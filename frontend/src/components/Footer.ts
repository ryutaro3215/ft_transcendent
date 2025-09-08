import type { Component } from "../types/component";
import { h } from "../ui/h";

export class Footer implements Component {
  private root!: HTMLElement;

  mount(container: HTMLElement) {
    this.root = h(
      "footer",
      {
        className:
          "w-full border-t bg-gray-900 text-gray-400 text-sm py-6 flex justify-center",
      },
      h("span", {}, "© 2025 rmatsuba. All rights reserved."),
    );
    container.append(this.root);
  }

  unmount() {
    this.root.remove();
  }
}
