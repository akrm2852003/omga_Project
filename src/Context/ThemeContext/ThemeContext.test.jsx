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
  // 🆕 طلب مستخدم صريح: "خليه زي الفرونت اند بتاعنا" - omga-grader-react افتراضيًا
  // ثيم فاتح بس (مفيش وضع غامق خالص هناك)، فالافتراضي هنا اتغيّر لفاتح بدل الغامق
  // القديم (راجع ThemeContext.jsx's getInitialTheme) - الغامق فضل موجود كاختيار يدوي بس.
  it("defaults to light theme when nothing is saved", () => {
    render(
      <ThemeContextProvider>
        <ThemeToggle />
      </ThemeContextProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
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

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    await user.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
