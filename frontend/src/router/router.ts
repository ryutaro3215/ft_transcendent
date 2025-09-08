import type { RouteRecord, RouteContext } from "../types/router";
import type { LayoutFactory } from "../types/layout";
import type { Page } from "../types/page";
import { compilePattern, execMatch } from "./patterns";
import { AppRoot } from "../runtime/mount";

type Compiled = RouteRecord & { _regex: RegExp; _names: string[] };

export class Router {
  private root: AppRoot;
  private routes: Compiled[] = [];
  private layouts: Record<string, LayoutFactory>;
  private defaultLayoutKey: string;
  private onClick = (e: MouseEvent) => this.handleClick(e);
  private onPop = () => this.render();

  constructor(opts: {
    appRoot: AppRoot;
    routes: RouteRecord[];
    layouts: Record<string, LayoutFactory>;
    defaultLayout?: string;
  }) {
    this.root = opts.appRoot;
    this.layouts = opts.layouts;
    this.defaultLayoutKey = opts.defaultLayout ?? "default";
    this.setRoutes(opts.routes);
  }

  setRoutes(rs: RouteRecord[]) {
    this.routes = rs.map((r) => {
      const { regex, names } = compilePattern(r.path);
      return Object.assign({}, r, { _regex: regex, _names: names });
    });
  }

  start() {
    document.addEventListener("click", this.onClick);
    addEventListener("popstate", this.onPop);
    this.render();
  }

  stop() {
    document.removeEventListener("click", this.onClick);
    removeEventListener("popstate", this.onPop);
  }

  push(path: string) {
    history.pushState(null, "", path);
    this.render();
  }

  replace(path: string) {
    history.replaceState(null, "", path);
    this.render();
  }

  private render() {
    const { pathname, search } = location;
    const query = new URLSearchParams(search);
    const rec = this.match(pathname) ?? this.fallback();
    const params = this.extractParams(rec, pathname);
    const ctx: RouteContext = { path: pathname, params, query };

    const page: Page<any> = rec.create(ctx);

    const layoutKey = rec.layout ?? this.defaultLayoutKey;
    const LayoutFactory = this.layouts[layoutKey];
    const appComp = LayoutFactory(page);

    this.root.render(appComp);
    if (rec.title) document.title = rec.title;
  }

  private match(path: string): Compiled | null {
    for (const r of this.routes) {
      const m = r._regex.exec(path);
      if (m) return r;
    }
    return null;
  }

  private extractParams(rec: Compiled, path: string) {
    return execMatch(rec._regex, rec._names, path) ?? {};
  }

  private fallback(): Compiled {
    const r = this.routes.find((x) => x.path === "*");
    if (r) return r;

    return {
      path: "*",
      title: "404",
      layout: this.defaultLayoutKey,
      create: ({ path }) => ({
        mount(c) {
          c.replaceChildren(document.createTextNode(`404 ${path}`));
        },
        unmount() {},
      }),
      _regex: /^.*$/i,
      _names: [],
    };
  }

  private handleClick(e: MouseEvent) {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const a = (e.target as HTMLElement)?.closest(
      "a",
    ) as HTMLAnchorElement | null;
    if (!a) return;
    if ((a.target && a.target !== "_self") || a.hasAttribute("download"))
      return;
    const href = a.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#")) return;

    const abs = new URL(href, location.origin);
    if (abs.origin !== location.origin) return;

    e.preventDefault();
    this.push(abs.pathname + abs.searchParams + abs.hash);
  }
}
