"use client";

import { NavMenuRoot, NavMenuHeader, NavMenuToggle, NavMenuApp, NavMenuContent, NavMenuFooter, NavMenuSection, NavMenuItem, NavMenuCategory } from "./nav-menu.js";

export const NavMenu = Object.assign(NavMenuRoot, {
  Root: NavMenuRoot,
  Header: NavMenuHeader,
  Toggle: NavMenuToggle,
  App: NavMenuApp,
  Content: NavMenuContent,
  Footer: NavMenuFooter,
  Section: NavMenuSection,
  Item: NavMenuItem,
  Category: NavMenuCategory,
});

export { NavMenuRoot, NavMenuHeader, NavMenuToggle, NavMenuApp, NavMenuContent, NavMenuFooter, NavMenuSection, NavMenuItem, NavMenuCategory };
export { useNavMenu } from "./nav-menu.js";
export type {
  NavMenuState, NavMenuMode, NavMenuSide, NavMenuVariant, NavMenuRootProps, NavMenuHeaderProps, NavMenuToggleProps, NavMenuAppProps,
  NavMenuContentProps, NavMenuFooterProps, NavMenuSectionProps, NavMenuItemProps, NavMenuLinkItemProps, NavMenuButtonItemProps, NavMenuCategoryProps,
} from "./nav-menu.js";
