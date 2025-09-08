// src/layouts/pong.ts
import type { LayoutFactory } from "../types/layout";
import { h } from "../ui/h";
import { Header } from "../components/Header"; // あなたの既存パスに合わせて
import { Footer } from "../components/Footer";

export const pongLayout: LayoutFactory = (page) => {
  let root: HTMLElement;
  const header = new Header({ title: "Pong" });
  const footer = new Footer();

  return {
    mount(container) {
      root = h(
        "div",
        {
          className:
            "min-h-dvh flex flex-col bg-[radial-gradient(60%_60%_at_50%_20%,#0f172a_0%,#020617_70%)] text-slate-100",
        },
        h("div", {
          className:
            "sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50",
        }),
        h("main", { className: "flex-1" }),
        h("div", { className: "mt-auto" }),
      );
      container.replaceChildren(root);

      const [headerHost, mainHost, footerHost] = Array.from(
        root.children,
      ) as HTMLElement[];
      header.mount(headerHost);
      page.mount(mainHost);
      footer.mount(footerHost);
    },
    unmount() {
      footer.unmount();
      page.unmount();
      header.unmount();
      root.remove();
    },
  };
};
