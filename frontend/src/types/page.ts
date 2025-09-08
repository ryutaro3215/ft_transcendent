import type { Component } from "./component";

export interface Page<P = any> extends Component<P> {}

export type PageFactory<P = any> = (props?: any) => Page<P>;
