import type { Page } from "./page";

export type Params = Record<string, string>;

export type RouteContext = {
  path: string;
  params: Params;
  query: URLSearchParams;
  navigate: (path: string) => void;
  replace: (path: string) => void;
};

export type RouteRecord = {
  path: string;
  create: (ctx: RouteContext) => Page<any>;
  title?: string;
  layout?: string;
};
