import type { Page } from "../../types/page";
import { h } from "../../ui/h";
import { LoginForm } from "../../components/auth/LoginForm";
import { AuthApi } from "../../api/auth";
import type { RouteContext } from "../../types/router";

export class LoginPage implements Page {
  private root!: HTMLElement;

  constructor(private ctx: RouteContext) {}

  private form = new LoginForm({
    onSubmit: async ({ email, password }) => {
      const res = await AuthApi.login({
        email: email,
        password: password,
      });
      if ((res as any)?.ok) {
        this.ctx.navigate("/me");
      } else {
        alert("Failed to login your account");
      }
    },
  });

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      {
        className: "w-full max-w-5xl mx-auto px-4 py-8 text-slate-100",
      },
      h(
        "div",
        { className: "flex justify-center" },
        h("div", { className: "w-full max-w-md" }),
      ),
      h(
        "p",
        { className: "mt-6 text-center text-sm text-slate-400" },
        "if you don't have your account, ",
        h(
          "a",
          { href: "/auth/register", className: "text-sky-400 hover:underline" },
          "Register form",
        ),
      ),
    );
    container.append(this.root);

    const host = this.root.querySelector(".max-w-md") as HTMLElement;
    this.form.mount(host);
  }

  unmount() {
    this.form.unmount();
    this.root.remove();
  }
}
