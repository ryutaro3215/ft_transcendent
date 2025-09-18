import type { Page } from "../../types/page";
import { h } from "../../ui/h";

export class SuccessPage implements Page {
  private root!: HTMLElement;

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      { className: "w-full max-w-3xl mx-auto px-4 py-8 text-slate-100" },
      h(
        "div",
        { className: "text-center" },
        h(
          "h1",
          { className: "text-2xl font-bold mb-4 text-green-400" },
          "Registration Successful!",
        ),
        h(
          "p",
          { className: "mb-6 text-slate-300" },
          "Your account has been created successfully.",
        ),
        h(
          "p",
          { className: "text-sm text-slate-400" },
          "You can now log in using your new account: ",
          h(
            "a",
            { href: "/auth/login", className: "text-sky-400 hover:underline" },
            "Login form",
          ),
        ),
      ),
    );

    container.replaceChildren(this.root);
  }

  unmount() {
    this.root.remove();
  }
}
