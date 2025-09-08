import type { Component } from "../types/component";
import { h } from "../ui/h";

export type HeaderProps = { title: string };

export class Header implements Component<HeaderProps> {
  constructor(private props: HeaderProps) {}
  private root!: HTMLElement;

  mount(container: HTMLElement) {
    this.root = h(
      "header",
      {
        className:
          "w-full bg-gradient-to-r from-gray-800 to-gray-700 shadow-md",
      },
      h(
        "div",
        {
          className: "container mx-auto flex items-center justify-between p-4",
        },
        h(
          "h1",
          { className: "text-xl font-bold text-white" },
          h("a", { href: "/" }, "Mysite"),
        ),
        h(
          "nav",
          {},
          h(
            "ul",
            { className: "flex gap-6 text-white text-sm" },
            h(
              "li",
              {},
              h(
                "a",
                {
                  href: "/login",
                  className:
                    "hover:text-gray-300 transition-colors duration-200",
                },
                "Login",
              ),
            ),
          ),
        ),
      ),
    );
    container.append(this.root);
  }

  unmount() {
    this.root.remove();
  }
}
