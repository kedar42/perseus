import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Happy DOM does not calculate layout used by React Aria overlays.
vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
});
Element.prototype.scrollIntoView = vi.fn();
afterEach(cleanup);
