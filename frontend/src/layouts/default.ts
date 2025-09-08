import type { LayoutFactory } from "../types/layout";
import type { Component } from "../types/component";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { h } from "../ui/h";
import "../style/base.css";

export const defaultLayout: LayoutFactory = (content: Component<any>) => {
  return {
    mount(container: HTMLElement) {
      const shell = h("div", { className: "min-h-screen flex flex-col" });
      container.replaceChildren(shell);
      const header = new Header({ title: "My page" });
      header.mount(shell);

      const main = h("main", { className: "flex-1 container mx-auto p-4" });
      shell.append(main);
      content.mount(main);

      const footer = new Footer();
      footer.mount(shell);

      (this as any)._cleanup = () => {
        footer.unmount();
        content.unmount();
        header.unmount();
      };
    },

    unmount() {
      (this as any)._cleanup?.();
    },
  } as Component<any>;
};
