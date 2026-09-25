# Perseus

Independent community components for HeroUI 3. Named after the Greek hero Perseus. Currently exports **NavMenu**, a collapsible navigation rail with animated width, accessible links and actions, active/disabled states, collapsed tooltips, trailing item content, and header/content/footer slots.

The package contains presentation and interaction only. Applications supply links, icons, labels, active state, responsive placement, and optional persistence. React and HeroUI are peer dependencies. Use native HeroUI controls for buttons, dialogs, drawers, and cards.

## Install

Install the versioned GitHub release with Bun:

```sh
bun add https://github.com/kedar42/perseus/releases/download/v0.2.0/kedar42-perseus-0.2.0.tgz
```

Import from `@kedar42/perseus`. React 19 and HeroUI 3 are peer dependencies supplied by your app. The release includes built JavaScript, type declarations, and CSS; no local Perseus checkout or build is needed by consumers. This package is not currently published on the npm registry.

## Develop with Bun

Requires Bun 1.3.14+, React 19, and HeroUI 3.2.5+.

```sh
bun install --frozen-lockfile
bun run build
bun run typecheck
bun run lint
bun run test
bun run test:package
```

Tests run in Vitest with Happy DOM under Bun. Use `bun run test`, not `bun test`. The build emits ESM, TypeScript declarations, and CSS in `dist/`; React and HeroUI remain external. `bun pm pack` creates an installable package containing only the declared distribution files and README.

For a sibling app, build this repository first, then add it with `bun add ../perseus` (adjust the relative path for the app's package directory). Rebuild and restart the consuming app after changing this package. For linked development, configure Vite's `resolve.dedupe` with `react`, `react-dom`, and `@heroui/react`. In Vitest, set `ssr.noExternal: ["@kedar42/perseus"]` so linked imports use the same resolution. Published/packed installs do not carry this repository's development dependencies.

## Styles

Import after HeroUI and before application overrides:

```css
@import "tailwindcss";
@import "@heroui/styles";
@import "@kedar42/perseus/styles.css";
```

The stylesheet uses HeroUI theme variables and the `components` layer. It does not require scanning this package for Tailwind classes. Widths default to `15rem` and `4.5rem`, configurable with `--nav-menu-width` and `--nav-menu-collapsed-width`. Animation respects reduced motion. The application sets the container height and responsive visibility; use HeroUI `Drawer` for mobile presentation.

## Compose a menu

```tsx
import { NavMenu } from "@kedar42/perseus";

<NavMenu aria-label="Main navigation" defaultCollapsed={false}>
  <NavMenu.Header>
    <NavMenu.Toggle />
    <NavMenu.Label><a href="/">My app</a></NavMenu.Label>
  </NavMenu.Header>
  <NavMenu.Content>
    <NavMenu.Item href="/library" isActive startContent={<LibraryIcon />}>
      Library
    </NavMenu.Item>
    <NavMenu.Item href="/inbox" startContent={<InboxIcon />} endContent={<Chip size="sm">3</Chip>}
      textValue="Inbox, 3 unread">
      Inbox
    </NavMenu.Item>
    <NavMenu.Item href="/requests" isDisabled description="Coming soon"
      textValue="Requests — coming soon" startContent={<RequestsIcon />}>
      Requests
    </NavMenu.Item>
  </NavMenu.Content>
  <NavMenu.Footer>
    <NavMenu.Item href="/settings" startContent={<SettingsIcon />}>Settings</NavMenu.Item>
    <Dropdown>
      <NavMenu.Action startContent={<Avatar size="sm">…</Avatar>} textValue="Account">Account</NavMenu.Action>
      <Dropdown.Popover placement="right bottom">…</Dropdown.Popover>
    </Dropdown>
  </NavMenu.Footer>
</NavMenu>
```

`LibraryIcon`, `InboxIcon`, `RequestsIcon`, and `SettingsIcon` are application-supplied icons; `Chip`, `Dropdown`, and `Avatar` come from HeroUI. Always provide a meaningful menu label. Items remain ordinary links and actions remain ordinary buttons; they use standard Tab navigation rather than ARIA menu semantics.

| Part | API |
| --- | --- |
| `NavMenu` / `NavMenu.Root` | Native `nav` props/ref, `isCollapsed`, `defaultCollapsed`, `onCollapsedChange` |
| `NavMenu.Header`, `.Content`, `.Footer` | Native `div` props/ref |
| `NavMenu.Label` | Native `span` props/ref; hides and makes its contents inert when collapsed |
| `NavMenu.Toggle` | HeroUI Button props/ref, `expandLabel`, `collapseLabel`; default icon can be replaced with children |
| `NavMenu.Item` | HeroUI Link props/ref, `isActive`, `startContent`, `endContent`, `description`, `textValue`, and React node children |
| `NavMenu.Action` | HeroUI Button props/ref (except `variant`, `size`, `isIconOnly`, `fullWidth`), `startContent`, `endContent`, `description`, `textValue`, and React node children |

All parts also have named exports (`NavMenuRoot`, `NavMenuHeader`, etc.). Items accept `href`, `isDisabled`, `onPress`, `render`, and static/function `className` through HeroUI Link. `textValue` supplies the accessible name and collapsed tooltip when children are rich content. `isActive` supplies `aria-current="page"`. Use `startContent` for icons and `endContent` for trailing counts, chips, or shortcuts; both the label and `endContent` fade out when collapsed, so put anything the collapsed rail must still show (such as a HeroUI `Badge` on the icon) in `startContent` and summarize it in `textValue`. Collapsed labels stay accessible to screen readers.

`NavMenu.Action` renders an item-styled HeroUI Button for rows that do something instead of navigating — sign out, a theme switch, or the trigger of a HeroUI `Dropdown`, `Popover`, or `Drawer`. Place it directly inside the overlay component as its trigger.

For controlled state, pass `isCollapsed={collapsed}` and `onCollapsedChange={setCollapsed}`. Persistence belongs in the application. Toggle labels can be localized through `expandLabel` and `collapseLabel`.

## Router integration

Use the native HeroUI/React Aria `render` API. Pass through the supplied attributes, event handlers, children, and ref. Disabled links may render as spans. If the router component has its own navigation handler (such as TanStack Link), also forward the disabled state to its `disabled` prop so that handler cannot navigate:

```tsx
<NavMenu.Item href="/settings" isActive={isSettings} isDisabled={isDisabled}
  render={(props) => "href" in props
    ? <RouterLink {...props} to="/settings" disabled={isDisabled} />
    : <span {...props} />}>
  Settings
</NavMenu.Item>
```

`RouterLink`, `isSettings`, and `isDisabled` belong to the consuming application. No router or global state library is required by this package.

## License and affiliation

Perseus's original code is available under the [MIT license](LICENSE). This is an independent community project, not affiliated with or endorsed by HeroUI. HeroUI is a peer dependency with its own license; its source is not bundled into this package.

## Release

Run the checks above, then `bun pm pack --ignore-scripts --filename /tmp/kedar42-perseus-0.2.0.tgz` after building. Publish the archive as an asset of the matching GitHub version tag. Consumers pin a release URL and the archive integrity in their lockfile. Do not replace assets of published versions; release a new version for changes.
