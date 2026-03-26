import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationDisplay } from "../ToolInvocationDisplay";
import type { ToolInvocation } from "ai";

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result: "ok" };
  }
  return { toolCallId: "1", toolName, args, state };
}

test("str_replace_editor create shows Creating filename", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing filename", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" })} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing filename", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/index.js" })} />);
  expect(screen.getByText("Editing index.js")).toBeDefined();
});

test("str_replace_editor view shows Reading filename", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/utils/helpers.ts" })} />);
  expect(screen.getByText("Reading helpers.ts")).toBeDefined();
});

test("file_manager delete shows Deleting filename", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/old/file.js" })} />);
  expect(screen.getByText("Deleting file.js")).toBeDefined();
});

test("file_manager rename shows Renaming filename", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/Button.jsx", new_path: "/components/Button.jsx" })} />);
  expect(screen.getByText("Renaming Button.jsx")).toBeDefined();
});

test("unknown tool falls back to tool name", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("some_unknown_tool", {})} />);
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("extracts just the filename from a nested path", () => {
  render(<ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/components/ui/Button.tsx" })} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows green dot when state is result", () => {
  const { container } = render(
    <ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when state is call", () => {
  const { container } = render(
    <ToolInvocationDisplay toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
