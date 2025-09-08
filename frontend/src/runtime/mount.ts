import type { Component } from "../types/component";

export class AppRoot {
  private outlet: HTMLElement;
  private dispose?: () => void;

  constructor(outlet: HTMLElement) {
    this.outlet = outlet;
  }

  render(comp: Component<any>) {
    this.dispose?.();
    comp.mount(this.outlet);
    this.dispose = () => comp.unmount();
  }

  clear() {
    this.dispose?.();
    this.dispose = undefined;
    this.outlet.replaceChildren();
  }
}
