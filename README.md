# Perseus

Independent community components for HeroUI 3. Named after the Greek hero Perseus. Currently exports **NavMenu**, an app navigation pane modelled on WinUI `NavigationView` and Fluent `Nav`. One component covers the inline sidebar, the compact icon rail, and the mobile drawer, with sections, categories of sub-items, selection, tooltips, and RTL support.

The package contains presentation and interaction only. Applications supply links, icons, labels, the selected value, breakpoints, and optional persistence. React 19.2+ and HeroUI 3 are peer dependencies.

## Install

Install the versioned GitHub release with Bun:

```sh
bun add https://github.com/kedar42/perseus/releases/download/v0.3.0/kedar42-perseus-0.3.0.tgz
```

Import from `@kedar42/perseus`. The release includes built JavaScript, type declarations, and CSS. See [CHANGELOG.md](CHANGELOG.md) before upgrading.

## Styles

Import after HeroUI and before application overrides:

```css
@import "tailwindcss";
@import "@heroui/styles";
@import "@kedar42/perseus/styles.css";
```

The stylesheet uses HeroUI theme variables and the `components` layer. It does not require scanning this package for Tailwind classes. Animation respects reduced motion. The application sets the container height.

Perseus does not ship a `navMenuVariants` function like HeroUI components do. Restyle parts through their BEM classes (`nav-menu__item`), `data-slot` attributes, state attributes (`data-mode`, `data-compact`, `data-open`, `data-selected`, `data-side`, `data-variant`), `className`, and these variables:

| Variable | Default |
| --- | --- |
| `--nav-menu-width` | `15rem` |
| `--nav-menu-compact-width` | `4.5rem` |
| `--nav-menu-padding` | `0.75rem` |
| `--nav-menu-gap` | `0.5rem` |
| `--nav-menu-item-height` | `2.75rem` |
| `--nav-menu-item-padding-block` | `0.5rem` |
| `--nav-menu-item-padding-inline` | `0.75rem` |
| `--nav-menu-item-gap` | `0.75rem` |
| `--nav-menu-item-radius` | `var(--radius-xl)` |
| `--nav-menu-item-font-size` | `0.875rem` |
| `--nav-menu-indent` | `2rem` |

Adjust `--nav-menu-compact-width` together with the item height, item padding, and menu padding so compact icons stay centred.

## Compose a menu

```tsx
import { NavMenu } from "@kedar42/perseus";

<NavMenu aria-label="Primary" mode={isDesktop ? "inline" : "overlay"} isOpen={isOpen} onOpenChange={setOpen}
  selectedValue={pathname} selectedCategoryValue={pathname.split("/")[1]}>
  <NavMenu.Header>
    <NavMenu.Toggle />
    <NavMenu.App icon={<Logo />}>My app</NavMenu.App>
  </NavMenu.Header>
  <NavMenu.Content>
    <NavMenu.Section label="Workspace">
      <NavMenu.Item href="/" value="/" icon={<LibraryIcon />}>Library</NavMenu.Item>
      <NavMenu.Item href="/inbox" value="/inbox" icon={<InboxIcon />} endContent={<Chip size="sm">3</Chip>}
        aria-label="Inbox, 3 unread" textValue="Inbox, 3 unread">
        Inbox
      </NavMenu.Item>
      <NavMenu.Category value="projects" label="Projects" icon={<FolderIcon />}>
        <NavMenu.Item href="/projects/perseus" value="/projects/perseus">Perseus</NavMenu.Item>
        <NavMenu.Item href="/projects/keeper" value="/projects/keeper">Keeper</NavMenu.Item>
      </NavMenu.Category>
    </NavMenu.Section>
  </NavMenu.Content>
  <NavMenu.Footer>
    <NavMenu.Item href="/settings" value="/settings" icon={<SettingsIcon />}>Settings</NavMenu.Item>
    <Dropdown>
      <NavMenu.Item icon={<Avatar size="sm">…</Avatar>}>Account</NavMenu.Item>
      <Dropdown.Popover placement="right bottom">…</Dropdown.Popover>
    </Dropdown>
  </NavMenu.Footer>
</NavMenu>
```

The icons are application-supplied; `Chip`, `Dropdown`, and `Avatar` come from HeroUI. Separate sections with HeroUI `Separator`. Always provide a meaningful menu label. Items use standard Tab navigation rather than ARIA menu semantics.

## Modes

| `mode` | Closed | Open |
| --- | --- | --- |
| `inline` (default) | Compact icon rail in the layout | Full pane in the layout, pushing content |
| `compact` | Compact icon rail in the layout | Full pane over the page; the rail keeps its footprint |
| `overlay` | Nothing | Full pane in a HeroUI drawer |

`NavMenu.Toggle` flips `isOpen` in every mode. Inline mode starts open; the others start closed. Uncontrolled state resets to that default when `mode` changes, so switching modes at a breakpoint never opens the drawer by surprise. Pressing a link closes a compact pane or the drawer. A compact pane also closes on Escape and on a press outside it.

The app owns breakpoints and persistence. A typical setup persists the desktop open state and keeps the mobile drawer state transient:

```tsx
<NavMenu mode={isDesktop ? "inline" : "overlay"}
  isOpen={isDesktop ? desktopOpen : drawerOpen}
  onOpenChange={isDesktop ? setDesktopOpen : setDrawerOpen}>
```

In overlay mode the drawer is closed until the app opens it, so render a separate menu button in the mobile header that sets `isOpen`.

## Items

`NavMenu.Item` renders a HeroUI Link when it has `href` and a HeroUI Button otherwise. Use the button form for rows that do something instead of navigating, such as sign out or the trigger of a `Dropdown`, `Popover`, or `Drawer`. Place it directly inside the overlay component as its trigger.

An item is selected when its `value` equals the root's `selectedValue`. Selected links get `aria-current="page"`. With a router, pass the current path as `selectedValue` and each item's path as `value`.

An item's visible content is its accessible name. Pass `aria-label` when the name should carry more, and keep the visible label inside it. `description` becomes the accessible description. `textValue` sets the compact tooltip text and is required when children are a render function. The label and `endContent` fade out while compact, so put anything the rail must still show (such as a HeroUI `Badge` on the icon) in `icon`, and summarize it in `aria-label` and `textValue`.

## Sections and categories

`NavMenu.Section` renders a `role="group"` container. Its `label` is a visible heading that names the section and fades out while compact.

`NavMenu.Category` is a parent item. While the menu shows labels it expands its sub-items in place and indents them. While compact it opens them in a popover beside the rail. A category is selected when its `value` equals the root's `selectedCategoryValue`. A selected category starts expanded and highlights itself only when its selected child is hidden. Control expansion with `isExpanded`, `defaultExpanded`, and `onExpandedChange`.

## Placement and variants

`side="start"` (default) or `side="end"` names the layout edge the menu sits on. Tooltips and popovers open away from that edge, the drawer slides in from it, the `sidebar` border sits on the content side, and the default toggle icon points the right way in both LTR and RTL.

| `variant` | Look |
| --- | --- |
| `sidebar` (default) | Surface background, border on the content side |
| `floating` | Surface background, rounded corners, surface shadow |

Overlay mode takes its surface from the drawer and ignores `variant`.

## Custom parts

`useNavMenu()` returns the menu state for components rendered inside `NavMenu`:

| Field | Meaning |
| --- | --- |
| `mode` | The current mode |
| `isOpen` | Inline: expanded. Compact: pane open. Overlay: drawer open |
| `isCompact` | Only icons show right now |
| `setOpen` | Opens or closes the menu |
| `dismiss` | Closes the compact pane, drawer, or category popover the caller sits in |
| `side`, `id`, `selectedValue`, `selectedCategoryValue` | Root settings |

For CSS-only cases, target `.nav-menu[data-compact]`.

## Router integration

Use the native HeroUI/React Aria `render` API. Pass through the supplied attributes, event handlers, children, and ref. Disabled links may render as spans. If the router component has its own navigation handler (such as TanStack Link), also forward the disabled state to its `disabled` prop so that handler cannot navigate:

```tsx
<NavMenu.Item href="/settings" value="/settings" isDisabled={isDisabled}
  render={(props) => "href" in props
    ? <RouterLink {...props} to="/settings" disabled={isDisabled} />
    : <span {...props} />}>
  Settings
</NavMenu.Item>
```

`RouterLink` and `isDisabled` belong to the consuming application. No router or global state library is required by this package.

## API

| Part | API |
| --- | --- |
| `NavMenu` / `NavMenu.Root` | Native `nav` props/ref, `mode`, `isOpen`, `defaultOpen`, `onOpenChange`, `selectedValue`, `selectedCategoryValue`, `side`, `variant` |
| `NavMenu.Header`, `.Content`, `.Footer` | Native `div` props/ref |
| `NavMenu.Toggle` | HeroUI Button props/ref, `openLabel`, `closeLabel`; default icon can be replaced with children |
| `NavMenu.App` | Native `span` props/ref, `icon`; hidden and inert while compact |
| `NavMenu.Section` | Native `div` props/ref, `label` |
| `NavMenu.Item` | With `href`, HeroUI Link props/ref; without, HeroUI Button props/ref (except `variant`, `size`, `isIconOnly`, `fullWidth`). Both take `value`, `icon`, `endContent`, `description`, `textValue`, node or render-function children |
| `NavMenu.Category` | `label`, `icon`, `value`, `isExpanded`, `defaultExpanded`, `onExpandedChange`, `isDisabled`, `className` |

All parts have named exports (`NavMenuRoot`, `NavMenuHeader`, etc.) and exported prop types (`NavMenuRootProps`, `NavMenuItemProps`, etc.).

## Develop with Bun

Requires Bun 1.3.14+.

```sh
bun install --frozen-lockfile
bun run build
bun run typecheck
bun run lint
bun run test
bun run test:package
```

Tests run in Vitest with Happy DOM under Bun. Use `bun run test`, not `bun test`. The build emits unminified ESM, TypeScript declarations, and CSS in `dist/`; React and HeroUI remain external. `bun pm pack` builds and creates an installable package containing only the declared distribution files and README. CI runs every check on pushes to `main` and on pull requests.

For a sibling app, build this repository first, then add it with `bun add ../perseus` (adjust the relative path for the app's package directory). Rebuild and restart the consuming app after changing this package. For linked development, configure Vite's `resolve.dedupe` with `react`, `react-dom`, and `@heroui/react`. In Vitest, set `ssr.noExternal: ["@kedar42/perseus"]` so linked imports use the same resolution.

## License and affiliation

Perseus's original code is available under the [MIT license](LICENSE). This is an independent community project, not affiliated with or endorsed by HeroUI. HeroUI is a peer dependency with its own license; its source is not bundled into this package.

## Release

Update `CHANGELOG.md`, run the checks above, then `bun pm pack --filename /tmp/kedar42-perseus-<version>.tgz`. Publish the archive as an asset of the matching GitHub version tag. Consumers pin a release URL and the archive integrity in their lockfile. Do not replace assets of published versions; release a new version for changes.
