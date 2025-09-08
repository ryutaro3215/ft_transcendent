import type { Component } from "./component";

export type LayoutFactory = (content: Component<any>) => Component<any>;
