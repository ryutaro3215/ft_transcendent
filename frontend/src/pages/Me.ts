import { h } from "../ui/h";
import { AuthApi } from "../api/auth";
import type { Page } from "../types/page";
import type { RouteContext } from "../types/router";

export class MePage implements Page {
  private root!: HTMLElement;
  constructor(private ctx: RouteContext) {}

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      { className: "w-full max-w-3xl mx-auto px-4 py-8 text-slate-100" },
      h("p", { className: "text-slate-400" }, "Loading your profile..."),
    );
    container.replaceChildren(this.root);

    this.load();
  }

  unmount() {
    this.root.remove();
  }

  private async load() {
    try {
      const me = await AuthApi.me();

      const card = h(
        "div",
        {
          className:
            "rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl",
        },
        h("h1", { className: "text-xl font-semibold mb-4" }, "My Profile"),
        h(
          "dl",
          { className: "grid grid-cols-1 gap-2" },
          h(
            "div",
            {},
            h("dt", { className: "text-slate-400 text-sm" }, "ID"),
            h("dd", { className: "text-white" }, String(me.id)),
          ),
          h(
            "div",
            {},
            h("dt", { className: "text-slate-400 text-sm" }, "Name"),
            h("dd", { className: "text-white" }, me.name),
          ),
          h(
            "div",
            {},
            h("dt", { className: "text-slate-400 text-sm" }, "Email"),
            h("dd", { className: "text-white" }, me.email),
          ),
        ),
        h(
          "div",
          { className: "mt-6 flex gap-3" },
          h(
            "a",
            {
              href: "/",
              className: "px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700",
            },
            "Home",
          ),
          h(
            "button",
            {
              className: "px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600",
              onclick: async () => {
                try {
                  await AuthApi.logout();
                } finally {
                  this.ctx.navigate("/auth/login");
                }
              },
            },
            "Logout",
          ),
        ),
      );

      this.root.replaceChildren(card);
    } catch (e: any) {
      const msg = String(e?.message ?? "").toLowerCase();
      if (
        msg.includes("401") ||
        msg.includes("unauthorized") ||
        msg.includes("not authenticated")
      ) {
        this.ctx.replace("/auth/login");
        return;
      }

      const err = h(
        "div",
        { className: "text-center" },
        h("p", { className: "text-red-400" }, "Failed to load profile."),
        h(
          "button",
          {
            className:
              "mt-4 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700",
            onclick: () => this.load(),
          },
          "Retry",
        ),
        h(
          "p",
          { className: "mt-2 text-sm text-slate-400" },
          String(e?.message ?? "Unknown error"),
        ),
      );
      this.root.replaceChildren(err);
    }
  }
}
