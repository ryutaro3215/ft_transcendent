import { RegisterForm } from "../../components/auth/RegisterForm";
import type { Page } from "../../types/page";
import { h } from "../../ui/h";
import { AuthApi } from "../../api/auth";
import type { RouteContext } from "../../types/router";

export class RegisterPage implements Page {
  private root!: HTMLElement;

  constructor(private ctx: RouteContext) {}
  private form = new RegisterForm({
    onSubmit: async ({ name, email, password }) => {
      const res = await AuthApi.register({
        name: name,
        email: email,
        password: password,
      });

      if ((res as any)?.ok) {
        this.ctx.navigate("/auth/register/success");
      } else {
        alert("Failed to register your account");
      }
    },
  });

  mount(container: HTMLElement) {
    this.root = h(
      "section",
      { className: "w-full max-w-5xl mx-auto px-4 py-8 text-slate-100" },
      h(
        "div",
        { className: "flex justify-center" },
        h("div", { className: "w-full max-w-md" }),
      ),
      h(
        "p",
        { className: "mt-6 text-center text-sm text-slate-400" },
        "if you have already your account, ",
        h(
          "a",
          { href: "/auth/login", className: "text-sky-400 hover:underline" },
          "Login form",
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
