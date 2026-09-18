import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { NavMenu } from "../dist/index.js";

const markup = renderToString(createElement(NavMenu, { "aria-label": "Main navigation" },
  createElement(NavMenu.Item, { href: "/", children: "Home" })));
if (!markup.includes('href="/"') || !markup.includes("Home")) {
  throw new Error("The built package did not render a navigation link with production React.");
}
console.log("Production package rendering passed.");
