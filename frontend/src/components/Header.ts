import type { Component } from "../types/component";
import type { MeType } from "../types/api";
import { AuthApi } from "../api/auth";
import { h } from "../ui/h";

export type HeaderProps = { title: string };

export class Header implements Component<HeaderProps> {
  constructor(private props: HeaderProps) {}
  private root!: HTMLElement;
  private navList!: HTMLUListElement;

  mount(container: HTMLElement) {
    this.navList = h("ul", {
      className: "flex gap-6 text-white text-sm",
    }) as HTMLUListElement;

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
          h("a", { href: "/" }, this.props.title ?? "Mysite"),
        ),
        h("nav", {}, this.navList),
      ),
    );
    container.append(this.root);

    // default = guest
    this.renderGuest();
    // if auth is success, change
    this.refreshAuth();
  }

  unmount() {
    this.root.remove();
  }

  //render guest header
  private renderGuest() {
    this.navList.replaceChildren(
      h(
        "li",
        {},
        h(
          "a",
          {
            href: "/auth/login",
            className: "hover:text-gray-300 transition-colors duration-200",
          },
          "Login",
        ),
      ),
      h(
        "li",
        {},
        h(
          "a",
          {
            href: "/auth/register",
            className: "hover:text-gray-300 transition-colors duration-200",
          },
          "Register",
        ),
      ),
      h(
        "li",
        {},
        h(
          "a",
          {
            href: "/pong",
            className: "hover:text-gray-300 transition-colors duration-200",
          },
          "Pong Game",
        ),
      ),
    );
  }

  // render user
  private renderUser(me: MeType) {
    this.navList.replaceChildren(
      h(
        "li",
        {},
        h(
          "a",
          {
            href: "/me",
            className: "hover:text-gray-300 transition-colors duration-200",
          },
          me.name,
        ),
      ),
      h(
        "li",
        {},
        h(
          "a",
          {
            href: "/pong",
            className: "hover:text-gray-300 transition-colors duration-200",
          },
          "Pong Game",
        ),
      ),
    );
  }

  private async refreshAuth() {
    try {
      const me = await AuthApi.me();
      this.renderUser(me);
    } catch {
      this.renderGuest();
    }
  }
}
