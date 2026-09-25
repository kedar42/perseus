"use client";

import { NavMenuRoot, NavMenuHeader, NavMenuToggle, NavMenuContent, NavMenuFooter, NavMenuLabel, NavMenuItem, NavMenuAction } from "./nav-menu.js";

export const NavMenu = Object.assign(NavMenuRoot, {
  Root: NavMenuRoot,
  Header: NavMenuHeader,
  Toggle: NavMenuToggle,
  Content: NavMenuContent,
  Footer: NavMenuFooter,
  Label: NavMenuLabel,
  Item: NavMenuItem,
  Action: NavMenuAction,
});

export { NavMenuRoot, NavMenuHeader, NavMenuToggle, NavMenuContent, NavMenuFooter, NavMenuLabel, NavMenuItem, NavMenuAction };
export type { NavMenuRootProps, NavMenuToggleProps, NavMenuItemProps, NavMenuActionProps } from "./nav-menu.js";
