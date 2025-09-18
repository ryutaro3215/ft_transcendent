import type { LoginFormValue, LoginFormPorps } from "../../types/auth";
import type { Component } from "../../types/component";
import { h } from "../../ui/h";
import { field, inputCls, errCls, btnCls } from "../../utils/auth";
import { LoginSchema } from "../../schema/auth";

export class LoginForm implements Component<LoginFormPorps> {
  private root!: HTMLElement;
  private form!: HTMLElement;
  private email!: HTMLInputElement;
  private password!: HTMLInputElement;
  private submitBtn!: HTMLElement;
  private errEmail!: HTMLElement;
  private errPassword!: HTMLElement;
  private onSubmitHandler = (e: Event) => this.handleSubmit(e);
  constructor(private props: LoginFormPorps = {}) {}

  mount(container: HTMLElement) {
    this.email = h("input", {
      type: "email",
      name: "email",
      placeholder: "you@example.com",
      className: inputCls(),
      autocomplete: "email",
      required: "ture",
    }) as HTMLInputElement;
    this.errEmail = h("p", { className: errCls(), "aria-live": "polite" });

    this.password = h("input", {
      type: "password",
      name: "password",
      className: inputCls(),
      // placeholder: "more than 8, lower letter and number",
      autocomplete: "new-password",
      required: "true",
      minlength: "8",
    }) as HTMLInputElement;
    this.errPassword = h("p", { className: errCls(), "aria-live": "polite" });
    this.submitBtn = h(
      "button",
      { type: "submit", className: btnCls() },
      "Login account",
    ) as HTMLButtonElement;

    this.form = h(
      "form",
      { className: "space-y-4" },

      field("mail", this.email, this.errEmail),
      field("password", this.password, this.errPassword),
      h("div", { className: "pt-2" }, this.submitBtn),
    ) as HTMLFormElement;

    this.root = h(
      "div",
      {
        className:
          "max-w-md w-full mx-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-6 shadow-2xl",
      },
      h("h2", { className: "text-xl font-semibold text-white mb-4" }, "Login"),
      this.form,
    );

    container.append(this.root);

    this.form.addEventListener("submit", this.onSubmitHandler);
  }

  unmount() {
    this.form.removeEventListener("submit", this.onSubmitHandler);
    // this.form.removeEventListener("input", this.onInputHandler);
    this.root.remove();
  }

  private showZodErrors(flat: {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  }) {
    const fe = flat.fieldErrors;

    this.setFieldError(this.email, this.errEmail, fe.email?.[0]);
    this.setFieldError(this.password, this.errPassword, fe.password?.[0]);
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.clearAllFieldErrors();

    const values: LoginFormValue = {
      email: this.email.value.trim(),
      password: this.password.value,
    };

    const parsed = LoginSchema.safeParse(values);
    if (!parsed.success) {
      this.showZodErrors(parsed.error.flatten((issue) => issue.message));
      return;
    }

    await this.props.onSubmit?.(parsed.data);
  }

  private setFieldError(input: HTMLElement, help: HTMLElement, msg?: string) {
    if (msg) {
      input.classList.add("ring-2", "ring-red-400/60");
      input.setAttribute("aria-invalid", "true");
      help.textContent = msg;
      help.classList.remove("hidden");
    } else {
      input.classList.remove("ring-2", "ring-red-400/60");
      input.removeAttribute("aria-invalid");
      help.textContent = "";
      help.classList.add("hidden");
    }
  }

  private clearAllFieldErrors() {
    this.setFieldError(this.email, this.errEmail, undefined);
    this.setFieldError(this.password, this.errPassword, undefined);
  }
}
