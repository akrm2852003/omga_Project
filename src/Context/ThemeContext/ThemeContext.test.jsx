import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeContextProvider from "./ThemeContext";
import ThemeToggle from "../../SharedModule/ThemeToggle/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeContextProvider", () => {
  it("defaults to dark theme when nothing is saved", () => {
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("restores a previously saved theme from localStorage", () => {
    localStorage.setItem("theme", "light");
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles the theme on click and persists it to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    await user.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
