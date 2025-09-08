export interface Component<P = any> {
  mount(container: HTMLElement): void;
  unmount(): void;
  update?(props: P): void;
}

export type ComponentFactory<P = any> = (props?: P) => Component<P>;
