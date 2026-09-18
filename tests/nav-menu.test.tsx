import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { NavMenu } from "../src";

test("uncontrolled collapse updates the toggle and makes header content inert", async () => {
  const user = userEvent.setup();
  render(<NavMenu aria-label="Primary"><NavMenu.Header><NavMenu.Toggle /><NavMenu.Label><a href="/">Home</a></NavMenu.Label></NavMenu.Header></NavMenu>);
  const toggle = screen.getByRole("button", { name: "Collapse navigation" });
  expect(toggle).toHaveAttribute("aria-controls", screen.getByRole("navigation").id);
  await user.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("navigation")).toHaveAttribute("data-collapsed");
  expect(screen.getByText("Home").parentElement).toHaveAttribute("inert");
  await user.click(screen.getByRole("button", { name: "Expand navigation" }));
  expect(screen.getByText("Home").parentElement).not.toHaveAttribute("inert");
});

test("controlled state changes only when the caller updates its prop", async () => {
  const user = userEvent.setup();
  const onCollapsedChange = vi.fn();
  const view = render(<NavMenu isCollapsed={false} onCollapsedChange={onCollapsedChange}><NavMenu.Toggle /></NavMenu>);
  await user.click(screen.getByRole("button"));
  expect(onCollapsedChange).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  view.rerender(<NavMenu isCollapsed onCollapsedChange={onCollapsedChange}><NavMenu.Toggle /></NavMenu>);
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
});

test("items retain link semantics, active state and accessible names while collapsed", () => {
  const ref = createRef<HTMLAnchorElement>();
  render(<NavMenu defaultCollapsed><NavMenu.Content>
    <NavMenu.Item href="/library" isActive ref={ref} startContent={<svg />} render={(props) => "href" in props ? <a {...props} data-custom="link" /> : <span {...props} />}>Library</NavMenu.Item>
    <NavMenu.Item href="/settings">Settings</NavMenu.Item>
  </NavMenu.Content></NavMenu>);
  const link = screen.getByRole("link", { name: "Library" });
  expect(link).toHaveAttribute("href", "/library");
  expect(link).toHaveAttribute("aria-current", "page");
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
