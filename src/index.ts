"use client";

import { NavMenuRoot, NavMenuHeader, NavMenuToggle, NavMenuContent, NavMenuFooter, NavMenuLabel, NavMenuItem } from "./nav-menu.js";

export const NavMenu = Object.assign(NavMenuRoot, {
  Root: NavMenuRoot,
  Header: NavMenuHeader,
  Toggle: NavMenuToggle,
  Content: NavMenuContent,
  Footer: NavMenuFooter,
  Label: NavMenuLabel,
  Item: NavMenuItem,
});

export { NavMenuRoot, NavMenuHeader, NavMenuToggle, NavMenuContent, NavMenuFooter, NavMenuLabel, NavMenuItem };
export type { NavMenuRootProps, NavMenuToggleProps, NavMenuItemProps } from "./nav-menu.js";
