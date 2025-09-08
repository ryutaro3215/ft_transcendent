import { AppRoot } from "./runtime/mount";
import { defaultLayout } from "./layouts/default";
import { routes } from "./router/routes";
import { Router } from "./router/router";

const outlet = document.getElementById("app");
const appRoot = new AppRoot(outlet!);
const layouts = { default: defaultLayout };

const router = new Router({
  appRoot,
  routes,
  layouts,
  defaultLayout: "default",
});

router.start();
