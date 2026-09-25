"use client";

import { Button, Disclosure, Drawer, Link, Popover, Tooltip, useLocale } from "@heroui/react";
import { createContext, use, useEffect, useEffectEvent, useId, useState, type ComponentPropsWithRef, type ReactNode } from "react";

export type NavMenuMode = "inline" | "compact" | "overlay";
export type NavMenuSide = "start" | "end";
export type NavMenuVariant = "sidebar" | "floating";

export interface NavMenuState {
  mode: NavMenuMode;
  /** Inline: expanded. Compact: the pane overlays the rail. Overlay: the drawer is open. */
  isOpen: boolean;
  /** Whether only icons show right now. */
  isCompact: boolean;
  setOpen: (isOpen: boolean) => void;
  side: NavMenuSide;
  id: string;
  selectedValue?: string;
  selectedCategoryValue?: string;
  /** Closes the transient surface a link was pressed in: the compact pane, the overlay drawer, or a category popover. */
  dismiss: () => void;
}

const NavMenuContext = createContext<NavMenuState | null>(null);

export function useNavMenu() {
  const context = use(NavMenuContext);
  if (!context) throw new Error("NavMenu parts must be rendered inside NavMenu.");
  return context;
}

function useControllableState<T>(value: T | undefined, defaultValue: T, onChange: ((value: T) => void) | undefined) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;
  function set(next: T) {
    if (value === undefined) setUncontrolled(next);
    if (next !== current) onChange?.(next);
  }
  return [current, set, setUncontrolled] as const;
}

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ") || undefined;
}

function awayFrom(side: NavMenuSide): NavMenuSide {
  return side === "start" ? "end" : "start";
}

export interface NavMenuRootProps extends ComponentPropsWithRef<"nav"> {
  /** Inline pushes content and collapses to a rail. Compact is always a rail and opens over the page. Overlay lives in a drawer. */
  mode?: NavMenuMode;
  isOpen?: boolean;
  /** Defaults to open in inline mode and closed otherwise. Uncontrolled state resets to that default when `mode` changes. */
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Marks the item whose `value` matches as current. */
  selectedValue?: string;
  /** Marks the category whose `value` matches as containing the current item. */
  selectedCategoryValue?: string;
  /** The inline edge of the layout the menu sits on. */
  side?: NavMenuSide;
  variant?: NavMenuVariant;
}

export function NavMenuRoot({ mode = "inline", isOpen: openProp, defaultOpen = mode === "inline", onOpenChange, selectedValue, selectedCategoryValue,
  side = "start", variant = "sidebar", id, className, onKeyDown, ...props }: NavMenuRootProps) {
  const generatedId = useId();
  const menuId = id ?? generatedId;
  const { direction } = useLocale();
  const [isOpen, setOpen, resetOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [previousMode, setPreviousMode] = useState(mode);
  if (mode !== previousMode) {
    setPreviousMode(mode);
    resetOpen(mode === "inline");
  }
  const isFloatingPane = mode === "compact" && isOpen;
  const closeOnOutsidePress = useEffectEvent((event: PointerEvent) => {
    if (!document.getElementById(menuId)?.contains(event.target as Node)) setOpen(false);
  });
  useEffect(() => {
    if (!isFloatingPane) return;
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isFloatingPane]);

  const state: NavMenuState = {
    mode, isOpen, isCompact: mode !== "overlay" && !isOpen, setOpen, side, id: menuId, selectedValue, selectedCategoryValue,
    dismiss: () => { if (mode !== "inline") setOpen(false); },
  };
  const nav = (
    <NavMenuContext value={state}>
      <nav {...props} id={menuId} data-slot="nav-menu" data-mode={mode} data-side={side} data-variant={variant}
        data-compact={state.isCompact || undefined} data-open={isOpen || undefined} className={cx("nav-menu", className)}
        onKeyDown={(event) => { if (isFloatingPane && event.key === "Escape") setOpen(false); onKeyDown?.(event); }} />
    </NavMenuContext>
  );
  if (mode !== "overlay") return nav;
  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={setOpen}>
      <Drawer.Content placement={(side === "start") === (direction === "ltr") ? "left" : "right"}>
        <Drawer.Dialog aria-label={props["aria-label"]} className="nav-menu__drawer">{nav}</Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

export type NavMenuHeaderProps = ComponentPropsWithRef<"div">;

export function NavMenuHeader({ className, ...props }: NavMenuHeaderProps) {
  return <div {...props} data-slot="nav-menu-header" className={cx("nav-menu__header", className)} />;
}

export type NavMenuContentProps = ComponentPropsWithRef<"div">;

export function NavMenuContent({ className, ...props }: NavMenuContentProps) {
  return <div {...props} data-slot="nav-menu-content" className={cx("nav-menu__content", className)} />;
}

export type NavMenuFooterProps = ComponentPropsWithRef<"div">;

export function NavMenuFooter({ className, ...props }: NavMenuFooterProps) {
  return <div {...props} data-slot="nav-menu-footer" className={cx("nav-menu__footer", className)} />;
}

export interface NavMenuAppProps extends ComponentPropsWithRef<"span"> {
  icon?: ReactNode;
}

/** The app's icon and name. Hidden while the menu is compact. */
export function NavMenuApp({ icon, className, children, ...props }: NavMenuAppProps) {
  const { isCompact } = useNavMenu();
  return (
    <span {...props} data-slot="nav-menu-app" inert={isCompact || undefined} className={cx("nav-menu__app", className)}>
      {icon && <span className="nav-menu__app-icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

export interface NavMenuSectionProps extends ComponentPropsWithRef<"div"> {
  /** Visible heading that names the section. It fades out while compact but stays the accessible name. */
  label?: ReactNode;
}

export function NavMenuSection({ label, className, children, ...props }: NavMenuSectionProps) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={label && !props["aria-label"] ? labelId : undefined} {...props}
      data-slot="nav-menu-section" className={cx("nav-menu__section", className)}>
      {label && <div id={labelId} className="nav-menu__section-label">{label}</div>}
      {children}
    </div>
  );
}

export interface NavMenuToggleProps extends ComponentPropsWithRef<typeof Button> {
  openLabel?: string;
  closeLabel?: string;
}

export function NavMenuToggle({ openLabel = "Expand navigation", closeLabel = "Collapse navigation", children, onPress, ...props }: NavMenuToggleProps) {
  const { isOpen, setOpen, side, id } = useNavMenu();
  const label = isOpen ? closeLabel : openLabel;
  return (
    <Tooltip>
      <Button variant="ghost" isIconOnly {...props} aria-label={props["aria-label"] ?? label}
        aria-controls={id} aria-expanded={isOpen} data-slot="nav-menu-toggle"
        onPress={(event) => { setOpen(!isOpen); onPress?.(event); }}>
        {children ?? <svg className="nav-menu__toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
          <path d={isOpen ? "m16 15-3-3 3-3" : "m14 9 3 3-3 3"} />
        </svg>}
      </Button>
      <Tooltip.Content placement={awayFrom(side)}>{label}</Tooltip.Content>
    </Tooltip>
  );
}

type RenderValues<C> = Parameters<Extract<C, (...args: never) => unknown>>[0];

interface ItemContent<V> {
  children: ReactNode | ((values: V) => ReactNode);
  icon?: ReactNode;
  endContent?: ReactNode;
  description?: ReactNode;
  textValue?: string;
}

/** Render-function children receive the HeroUI render props and need `textValue` for the compact tooltip. */
type NavMenuItemContentProps<V> = Omit<ItemContent<V>, "children" | "textValue"> & { value?: string }
  & ({ children: ReactNode; textValue?: string } | { children: (values: V) => ReactNode; textValue: string });

function useItemContent<V>({ children, icon, endContent, description, textValue }: ItemContent<V>, describedBy?: string) {
  const { isCompact, side } = useNavMenu();
  const descriptionId = useId();
  return {
    tooltip: { isDisabled: !isCompact, placement: awayFrom(side), text: typeof children === "function" ? textValue : textValue ?? children },
    describedBy: cx(describedBy, description != null && descriptionId),
    content: (values: V) => (
      <>
        {icon && <span className="nav-menu__item-icon" aria-hidden="true">{icon}</span>}
        <span className="nav-menu__item-label">
          {typeof children === "function" ? children(values) : children}
          {description != null && <span id={descriptionId} className="nav-menu__item-description" aria-hidden="true">{description}</span>}
        </span>
        {endContent && <span className="nav-menu__item-end">{endContent}</span>}
      </>
    ),
  };
}

function ItemTooltip({ tooltip, children }: { tooltip: ReturnType<typeof useItemContent>["tooltip"]; children: ReactNode }) {
  return (
    <Tooltip isDisabled={tooltip.isDisabled}>
      {children}
      <Tooltip.Content placement={tooltip.placement}>{tooltip.text}</Tooltip.Content>
    </Tooltip>
  );
}

function withItemClass<S>(className: string | ((state: S) => string) | undefined) {
  return (state: S) => cx("nav-menu__item", typeof className === "function" ? className(state) : className) ?? "";
}

type LinkProps = ComponentPropsWithRef<typeof Link>;
type ButtonProps = ComponentPropsWithRef<typeof Button>;

export type NavMenuLinkItemProps = Omit<LinkProps, "children" | "href"> & { href: string } & NavMenuItemContentProps<RenderValues<LinkProps["children"]>>;
export type NavMenuButtonItemProps = Omit<ButtonProps, "children" | "variant" | "size" | "isIconOnly" | "fullWidth"> & { href?: undefined }
  & NavMenuItemContentProps<RenderValues<ButtonProps["children"]>>;
/** A link when it has `href`, otherwise a button, for example a Dropdown trigger. */
export type NavMenuItemProps = NavMenuLinkItemProps | NavMenuButtonItemProps;

export function NavMenuItem(props: NavMenuItemProps) {
  return props.href === undefined ? <NavMenuButtonItem {...props} /> : <NavMenuLinkItem {...props} />;
}

function NavMenuLinkItem({ children, icon, endContent, description, textValue, value, className, onPress, ...props }: NavMenuLinkItemProps) {
  const { selectedValue, dismiss } = useNavMenu();
  const { tooltip, describedBy, content } = useItemContent({ children, icon, endContent, description, textValue }, props["aria-describedby"]);
  const isSelected = value !== undefined && value === selectedValue;
  return (
    <ItemTooltip tooltip={tooltip}>
      <Link {...props} aria-describedby={describedBy} aria-current={isSelected ? "page" : undefined}
        data-slot="nav-menu-item" data-selected={isSelected || undefined} className={withItemClass(className)}
        onPress={(event) => { onPress?.(event); dismiss(); }}>
        {content}
      </Link>
    </ItemTooltip>
  );
}

function NavMenuButtonItem({ children, icon, endContent, description, textValue, value, className, ...props }: NavMenuButtonItemProps) {
  const { selectedValue } = useNavMenu();
  const { tooltip, describedBy, content } = useItemContent({ children, icon, endContent, description, textValue }, props["aria-describedby"]);
  const isSelected = value !== undefined && value === selectedValue;
  return (
    <ItemTooltip tooltip={tooltip}>
      <Button variant="ghost" {...props} aria-describedby={describedBy} aria-current={isSelected || undefined}
        data-slot="nav-menu-item" data-selected={isSelected || undefined} className={withItemClass(className)}>
        {content}
      </Button>
    </ItemTooltip>
  );
}

export interface NavMenuCategoryProps {
  label: string;
  icon?: ReactNode;
  value?: string;
  isExpanded?: boolean;
  /** Defaults to expanded when the category is selected. */
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  isDisabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** A parent item. It expands its sub-items in place, or opens them in a popover while the menu is compact. */
export function NavMenuCategory({ label, icon, value, isExpanded: expandedProp, defaultExpanded, onExpandedChange, isDisabled, className, children }: NavMenuCategoryProps) {
  const menu = useNavMenu();
  const isSelected = value !== undefined && value === menu.selectedCategoryValue;
  const [isExpanded, setExpanded] = useControllableState(expandedProp, defaultExpanded ?? isSelected, onExpandedChange);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const { content } = useItemContent({ children: label, icon, endContent: menu.isCompact ? undefined : <Disclosure.Indicator /> });
  const trigger = (slot?: string) => (
    <Button variant="ghost" slot={slot} isDisabled={isDisabled} data-slot="nav-menu-category-trigger"
      data-selected={(isSelected && (menu.isCompact || !isExpanded)) || undefined} className="nav-menu__item">
      {content}
    </Button>
  );
  return (
    <div data-slot="nav-menu-category" className={cx("nav-menu__category", className)}>
      {menu.isCompact
        ? <Popover isOpen={isPopoverOpen} onOpenChange={setPopoverOpen}>
          {trigger()}
          <Popover.Content placement={awayFrom(menu.side)} className="nav-menu__popover">
            <Popover.Dialog aria-label={label} className="nav-menu__popover-dialog">
              <div className="nav-menu__section-label" aria-hidden="true">{label}</div>
              <NavMenuContext value={{ ...menu, isCompact: false, dismiss: () => { setPopoverOpen(false); menu.dismiss(); } }}>{children}</NavMenuContext>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
        : <Disclosure isExpanded={isExpanded} onExpandedChange={setExpanded} isDisabled={isDisabled}>
          {trigger("trigger")}
          <Disclosure.Content>
            <div className="nav-menu__sub-items">{children}</div>
          </Disclosure.Content>
        </Disclosure>}
    </div>
  );
}
