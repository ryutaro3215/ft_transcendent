import type { RouteRecord } from "../types/router";
import { Home } from "../pages/Home";
import { About } from "../pages/About";
import { PongCanvasPage } from "../pages/PongCanvasPage";

export const routes: RouteRecord[] = [
  {
    path: "/",
    title: "Home",
    layout: "default",
    create: () => new Home(),
  },
  {
    path: "/about",
    title: "About",
    layout: "default",
    create: () => new About(),
  },
  {
    path: "/pong",
    title: "Pong Game",
    layout: "pong",
    create: () => new PongCanvasPage(),
  },
  {
    path: "*",
    title: "Not Found",
    layout: "default",
    create: ({ path }) => ({
      mount(c) {
        c.replaceChildren(document.createTextNode(`404 ${path}`));
      },
      unmount() {},
    }),
  },
];
