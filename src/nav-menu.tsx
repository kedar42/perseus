"use client";

import { Button, Link, Tooltip } from "@heroui/react";
import { createContext, use, useId, useState, type ComponentPropsWithRef, type ReactNode } from "react";

interface NavMenuState {
  isCollapsed: boolean;
  setCollapsed: (value: boolean) => void;
  id: string;
}

const NavMenuContext = createContext<NavMenuState | null>(null);

function useNavMenu() {
  const context = use(NavMenuContext);
  if (!context) throw new Error("NavMenu parts must be rendered inside NavMenu.");
  return context;
}

export interface NavMenuRootProps extends ComponentPropsWithRef<"nav"> {
  isCollapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

export function NavMenuRoot({ isCollapsed: controlled, defaultCollapsed = false, onCollapsedChange, id, className, children, ...props }: NavMenuRootProps) {
  const generatedId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const isCollapsed = controlled ?? uncontrolled;
  const menuId = id ?? generatedId;
  function setCollapsed(value: boolean) {
    if (controlled === undefined) setUncontrolled(value);
    if (value !== isCollapsed) onCollapsedChange?.(value);
  }
  return (
    <NavMenuContext value={{ isCollapsed, setCollapsed, id: menuId }}>
      <nav {...props} id={menuId} data-slot="nav-menu" data-collapsed={isCollapsed || undefined}
        className={["nav-menu", className].filter(Boolean).join(" ")}>
        {children}
      </nav>
    </NavMenuContext>
  );
}

export function NavMenuHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-slot="nav-menu-header" className={["nav-menu__header", className].filter(Boolean).join(" ")} />;
}

export function NavMenuContent({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-slot="nav-menu-content" className={["nav-menu__content", className].filter(Boolean).join(" ")} />;
}

export function NavMenuFooter({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-slot="nav-menu-footer" className={["nav-menu__footer", className].filter(Boolean).join(" ")} />;
}

export function NavMenuLabel({ className, ...props }: ComponentPropsWithRef<"span">) {
  const { isCollapsed } = useNavMenu();
  return <span {...props} data-slot="nav-menu-label" inert={isCollapsed || undefined}
    className={["nav-menu__label", className].filter(Boolean).join(" ")} />;
}

export interface NavMenuToggleProps extends ComponentPropsWithRef<typeof Button> {
  expandLabel?: string;
  collapseLabel?: string;
}

export function NavMenuToggle({ expandLabel = "Expand navigation", collapseLabel = "Collapse navigation", children, onPress, ...props }: NavMenuToggleProps) {
  const { isCollapsed, setCollapsed, id } = useNavMenu();
  const label = isCollapsed ? expandLabel : collapseLabel;
  return (
    <Tooltip>
      <Button variant="ghost" isIconOnly {...props} aria-label={props["aria-label"] ?? label}
        aria-controls={id} aria-expanded={!isCollapsed} data-slot="nav-menu-toggle"
        onPress={(event) => { setCollapsed(!isCollapsed); onPress?.(event); }}>
        {children ?? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
          <path d={isCollapsed ? "m14 9 3 3-3 3" : "m16 15-3-3 3-3"} />
        </svg>}
      </Button>
      <Tooltip.Content placement="right">{label}</Tooltip.Content>
    </Tooltip>
  );
}

interface NavMenuItemContentProps {
  children: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  description?: ReactNode;
  textValue?: string;
}

function NavMenuItemContent({ children, startContent, endContent, description }: NavMenuItemContentProps) {
  return (
    <>
      {startContent && <span className="nav-menu__item-icon" aria-hidden="true">{startContent}</span>}
      <span className="nav-menu__item-label">
        {children}
        {description && <span className="nav-menu__item-description">{description}</span>}
      </span>
      {endContent && <span className="nav-menu__item-end">{endContent}</span>}
    </>
  );
}

function withItemClass<S>(className: string | ((state: S) => string) | undefined) {
  return (state: S) => ["nav-menu__item", typeof className === "function" ? className(state) : className].filter(Boolean).join(" ");
}

export interface NavMenuItemProps extends Omit<ComponentPropsWithRef<typeof Link>, "children">, NavMenuItemContentProps {
  isActive?: boolean;
}

export function NavMenuItem({ children, startContent, endContent, description, textValue, isActive = false, className, ...props }: NavMenuItemProps) {
  const { isCollapsed } = useNavMenu();
  return (
    <Tooltip isDisabled={!isCollapsed}>
      <Link {...props} aria-label={props["aria-label"] ?? textValue} aria-current={isActive ? "page" : undefined}
        data-slot="nav-menu-item" data-active={isActive || undefined} className={withItemClass(className)}>
        <NavMenuItemContent startContent={startContent} endContent={endContent} description={description}>{children}</NavMenuItemContent>
      </Link>
      <Tooltip.Content placement="right">{textValue ?? children}</Tooltip.Content>
    </Tooltip>
  );
}

export interface NavMenuActionProps extends Omit<ComponentPropsWithRef<typeof Button>, "children" | "variant" | "size" | "isIconOnly" | "fullWidth">, NavMenuItemContentProps {}

export function NavMenuAction({ children, startContent, endContent, description, textValue, className, ...props }: NavMenuActionProps) {
  const { isCollapsed } = useNavMenu();
  return (
    <Tooltip isDisabled={!isCollapsed}>
      <Button variant="ghost" {...props} aria-label={props["aria-label"] ?? textValue}
        data-slot="nav-menu-action" className={withItemClass(className)}>
        <NavMenuItemContent startContent={startContent} endContent={endContent} description={description}>{children}</NavMenuItemContent>
      </Button>
      <Tooltip.Content placement="right">{textValue ?? children}</Tooltip.Content>
    </Tooltip>
  );
}
