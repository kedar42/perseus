import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Dropdown, Label } from "@heroui/react";
import { NavMenu, useNavMenu, type NavMenuMode } from "../src";

test("inline mode collapses to a compact rail and hides the app name", async () => {
  const user = userEvent.setup();
  render(<NavMenu aria-label="Primary"><NavMenu.Header><NavMenu.Toggle /><NavMenu.App icon={<svg />}>Keeper</NavMenu.App></NavMenu.Header></NavMenu>);
  const nav = screen.getByRole("navigation");
  const toggle = screen.getByRole("button", { name: "Collapse navigation" });
  expect(toggle).toHaveAttribute("aria-controls", nav.id);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  await user.click(toggle);
  expect(nav).toHaveAttribute("data-compact");
  expect(screen.getByText("Keeper")).toHaveAttribute("inert");
  await user.click(screen.getByRole("button", { name: "Expand navigation" }));
  expect(nav).not.toHaveAttribute("data-compact");
  expect(screen.getByText("Keeper")).not.toHaveAttribute("inert");
});

test("controlled open state changes only when the caller updates its prop", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const view = render(<NavMenu isOpen onOpenChange={onOpenChange}><NavMenu.Toggle /></NavMenu>);
  await user.click(screen.getByRole("button"));
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  view.rerender(<NavMenu isOpen={false} onOpenChange={onOpenChange}><NavMenu.Toggle /></NavMenu>);
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
});

test("selectedValue marks the matching link as the current page", () => {
  const ref = createRef<HTMLAnchorElement>();
  render(<NavMenu defaultOpen={false} selectedValue="/library"><NavMenu.Content>
    <NavMenu.Item href="/library" value="/library" ref={ref} icon={<svg />}
      render={(props) => "href" in props ? <a {...props} data-custom="link" /> : <span {...props} />}>Library</NavMenu.Item>
    <NavMenu.Item href="/settings" value="/settings">Settings</NavMenu.Item>
  </NavMenu.Content></NavMenu>);
  const link = screen.getByRole("link", { name: "Library" });
  expect(link).toHaveAttribute("aria-current", "page");
  expect(link).toHaveAttribute("data-selected");
  expect(link).toHaveAttribute("data-custom", "link");
  expect(ref.current).toBe(link);
  expect(screen.getByRole("link", { name: "Settings" })).not.toHaveAttribute("aria-current");
});

test("disabled items cannot activate and are skipped by keyboard navigation", async () => {
  const user = userEvent.setup();
  const onPress = vi.fn();
  render(<NavMenu><NavMenu.Item href="/future" isDisabled onPress={onPress}>Future</NavMenu.Item><NavMenu.Item href="/library">Library</NavMenu.Item></NavMenu>);
  const disabled = screen.getByRole("link", { name: "Future" });
  expect(disabled).toHaveAttribute("aria-disabled", "true");
  await user.click(disabled);
  expect(onPress).not.toHaveBeenCalled();
  await user.tab();
  expect(screen.getByRole("link", { name: "Library" })).toHaveFocus();
});

test("end content renders after the label while the visible text stays the accessible name", () => {
  render(<NavMenu><NavMenu.Item href="/inbox" endContent={<span>3</span>}>Inbox</NavMenu.Item></NavMenu>);
  const link = screen.getByRole("link", { name: /^Inbox\s*3$/ });
  const end = screen.getByText("3").parentElement;
  expect(end).toHaveClass("nav-menu__item-end");
  expect(link.lastElementChild).toBe(end);
});

test("descriptions describe the item instead of joining its name", () => {
  render(<NavMenu><NavMenu.Item href="/requests" description="Coming soon" aria-describedby="extra">Requests</NavMenu.Item><span id="extra">Beta</span></NavMenu>);
  expect(screen.getByRole("link", { name: "Requests" })).toHaveAccessibleDescription("Beta Coming soon");
});

test("items without href are buttons that can trigger HeroUI overlays", async () => {
  const user = userEvent.setup();
  const onAction = vi.fn();
  render(<NavMenu defaultOpen={false}><NavMenu.Footer>
    <Dropdown>
      <NavMenu.Item textValue="Account" icon={<svg />}>Account</NavMenu.Item>
      <Dropdown.Popover><Dropdown.Menu onAction={onAction}>
        <Dropdown.Item id="logout" textValue="Log out"><Label>Log out</Label></Dropdown.Item>
      </Dropdown.Menu></Dropdown.Popover>
    </Dropdown>
  </NavMenu.Footer></NavMenu>);
  const account = screen.getByRole("button", { name: "Account" });
  expect(account).toHaveClass("nav-menu__item");
  await user.click(account);
  await user.click(await screen.findByRole("menuitem", { name: "Log out" }));
  expect(onAction).toHaveBeenCalledOnce();
  expect(onAction.mock.calls[0][0]).toBe("logout");
});

test("the default toggle icon points toward the next state", async () => {
  const user = userEvent.setup();
  render(<NavMenu><NavMenu.Toggle /></NavMenu>);
  const arrow = () => screen.getByRole("button").querySelectorAll("path")[1].getAttribute("d");
  expect(arrow()).toBe("m16 15-3-3 3-3");
  await user.click(screen.getByRole("button"));
  expect(arrow()).toBe("m14 9 3 3-3 3");
});

test("sections are named by their visible label", () => {
  render(<NavMenu defaultOpen={false}><NavMenu.Content>
    <NavMenu.Section label="Workspace"><NavMenu.Item href="/projects">Projects</NavMenu.Item></NavMenu.Section>
    <NavMenu.Section aria-label="Tools"><NavMenu.Item href="/logs">Logs</NavMenu.Item></NavMenu.Section>
  </NavMenu.Content></NavMenu>);
  expect(screen.getByRole("group", { name: "Workspace" })).toContainElement(screen.getByRole("link", { name: "Projects" }));
  expect(screen.getByRole("group", { name: "Tools" })).not.toHaveAttribute("aria-labelledby");
});

test("a selected category starts expanded and highlights itself only while collapsed", async () => {
  const user = userEvent.setup();
  render(<NavMenu selectedValue="/p/perseus" selectedCategoryValue="projects">
    <NavMenu.Category value="projects" label="Projects" icon={<svg />}>
      <NavMenu.Item href="/p/perseus" value="/p/perseus">Perseus</NavMenu.Item>
    </NavMenu.Category>
  </NavMenu>);
  const trigger = screen.getByRole("button", { name: "Projects" });
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(trigger).not.toHaveAttribute("data-selected");
  expect(screen.getByRole("group", { name: "Projects" })).toContainElement(screen.getByRole("link", { name: "Perseus" }));
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveAttribute("data-selected");
});

test("a compact category opens its sub-items in a popover that closes on navigation", async () => {
  const user = userEvent.setup();
  render(<NavMenu defaultOpen={false}>
    <NavMenu.Category label="Projects" icon={<svg />}>
      <NavMenu.Item href="/p/perseus">Perseus</NavMenu.Item>
    </NavMenu.Category>
  </NavMenu>);
  expect(screen.queryByRole("link", { name: "Perseus" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Projects" }));
  const dialog = await screen.findByRole("dialog", { name: "Projects" });
  await user.click(screen.getByRole("link", { name: "Perseus" }));
  expect(dialog).not.toBeInTheDocument();
});

test("compact mode opens over the page and closes on navigation, Escape, and outside press", async () => {
  const user = userEvent.setup();
  render(<><NavMenu mode="compact"><NavMenu.Toggle /><NavMenu.Item href="/logs">Logs</NavMenu.Item></NavMenu><main>Page</main></>);
  const nav = screen.getByRole("navigation");
  const toggle = screen.getByRole("button", { name: "Expand navigation" });
  expect(nav).toHaveAttribute("data-compact");

  await user.click(toggle);
  expect(nav).toHaveAttribute("data-open");
  expect(nav).not.toHaveAttribute("data-compact");
  await user.click(screen.getByRole("link", { name: "Logs" }));
  expect(nav).not.toHaveAttribute("data-open");

  await user.click(toggle);
  await user.keyboard("{Escape}");
  expect(nav).not.toHaveAttribute("data-open");

  await user.click(toggle);
  fireEvent.pointerDown(screen.getByText("Page"));
  expect(nav).not.toHaveAttribute("data-open");
});

test("overlay mode renders the menu in a drawer that closes on navigation", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const view = render(<NavMenu mode="overlay" aria-label="Primary" isOpen={false} onOpenChange={onOpenChange}><NavMenu.Item href="/logs">Logs</NavMenu.Item></NavMenu>);
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  view.rerender(<NavMenu mode="overlay" aria-label="Primary" isOpen onOpenChange={onOpenChange}><NavMenu.Item href="/logs">Logs</NavMenu.Item></NavMenu>);
  const dialog = await screen.findByRole("dialog", { name: "Primary" });
  expect(dialog).toContainElement(screen.getByRole("navigation", { name: "Primary" }));
  expect(screen.getByRole("navigation")).not.toHaveAttribute("data-compact");
  await user.click(screen.getByRole("link", { name: "Logs" }));
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
});

test("uncontrolled open state resets to the new mode's default when the mode changes", () => {
  const menu = (mode: NavMenuMode) => <NavMenu mode={mode}><NavMenu.Toggle /></NavMenu>;
  const view = render(menu("inline"));
  expect(screen.getByRole("navigation")).toHaveAttribute("data-open");
  view.rerender(menu("compact"));
  expect(screen.getByRole("navigation")).not.toHaveAttribute("data-open");
});

test("side and variant are exposed for styling and custom parts read state from useNavMenu", async () => {
  const user = userEvent.setup();
  function Status() {
    const { isCompact, mode, side } = useNavMenu();
    return <span>{isCompact ? "compact" : "wide"} {mode} {side}</span>;
  }
  render(<NavMenu side="end" variant="floating"><NavMenu.Toggle /><Status /></NavMenu>);
  const nav = screen.getByRole("navigation");
  expect(nav).toHaveAttribute("data-side", "end");
  expect(nav).toHaveAttribute("data-variant", "floating");
  expect(screen.getByText("wide inline end")).toBeInTheDocument();
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("compact inline end")).toBeInTheDocument();
});

test("render-function children receive HeroUI render props", () => {
  render(<NavMenu><NavMenu.Item href="/docs" textValue="Docs">{({ isHovered }) => isHovered ? "Docs (hovered)" : "Docs"}</NavMenu.Item></NavMenu>);
  expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
});

test("useNavMenu outside NavMenu throws", () => {
  function Orphan() { useNavMenu(); return null; }
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Orphan />)).toThrow("NavMenu parts must be rendered inside NavMenu.");
});
