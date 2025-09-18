import type { RouteRecord } from "../types/router";
import { Home } from "../pages/Home";
import { About } from "../pages/About";
import { PongCanvasPage } from "../pages/PongCanvasPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { SuccessPage } from "../pages/auth/success";
import { MePage } from "../pages/Me";

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
    path: "/me",
    title: "Me",
    layout: "default",
    create: (ctx) => new MePage(ctx),
  },
  {
    path: "/pong",
    title: "Pong Game",
    layout: "pong",
    create: () => new PongCanvasPage(),
  },
  {
    path: "/auth/register",
    title: "Register your Account",
    layout: "default",
    create: (ctx) => new RegisterPage(ctx),
  },
  {
    path: "/auth/register/success",
    title: "Success Registration",
    layout: "default",
    create: () => new SuccessPage(),
  },
  {
    path: "/auth/login",
    title: "Login your Account",
    layout: "default",
    create: (ctx) => new LoginPage(ctx),
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
