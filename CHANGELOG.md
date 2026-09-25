# Changelog

## 0.3.0

NavMenu is redesigned around display modes, following WinUI `NavigationView` and Fluent `Nav`.

### Breaking

- `isCollapsed` / `defaultCollapsed` / `onCollapsedChange` are replaced by `isOpen` / `defaultOpen` / `onOpenChange`.
- `NavMenu.Toggle` takes `openLabel` / `closeLabel` instead of `expandLabel` / `collapseLabel`.
- `NavMenu.Label` is replaced by `NavMenu.App`, which takes an `icon` and the app name.
- `NavMenu.Action` is merged into `NavMenu.Item`, which renders a button when it has no `href`.
- Per-item `isActive` is replaced by the root's `selectedValue` and each item's `value`. `data-active` is now `data-selected`.
- `startContent` is renamed to `icon`.
- `textValue` no longer sets the accessible name. The visible content names the item, and `aria-label` overrides it. `textValue` sets the compact tooltip text.
- `description` describes the item through `aria-describedby` and no longer joins its accessible name.
- `--nav-menu-collapsed-width` is renamed to `--nav-menu-compact-width`.
- React 19.2 or later is required.

### Added

- `mode="inline" | "compact" | "overlay"`. Compact opens the pane over the page. Overlay renders the menu in a HeroUI drawer. Pressing a link closes a compact pane or the drawer.
- `side="start" | "end"`, with RTL-aware tooltips, popovers, drawer edge, border, and toggle icon.
- `variant="sidebar" | "floating"`.
- `NavMenu.Section` with an optional `label` heading.
- `NavMenu.Category` for sub-items. It expands in place, or opens a popover while compact. `selectedCategoryValue` marks the category holding the current item.
- `useNavMenu` hook and the `NavMenuState` type for custom parts.
- Exported prop types for every part.
- Render-function children on `NavMenu.Item`.
- CSS variables for padding, gaps, item height, item padding, radius, font size, and sub-item indent.

### Changed

- The build ships unminified ESM.
- The `engines` field is removed; the package runs under any runtime React supports.

## 0.2.1

- Brighter labels and a directional toggle icon.

## 0.2.0

- `endContent` on items and `NavMenu.Action`.

## 0.1.1

- Fix the hover underline on items.

## 0.1.0

- Initial `NavMenu`.
