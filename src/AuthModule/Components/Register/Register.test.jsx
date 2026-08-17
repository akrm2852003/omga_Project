import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Register from "./Register";

vi.mock("axios");

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Register", () => {
  // ريجريشن تِست للباگ اللي كان موجود قبل كده: react-hook-form كان بيسجل
  // الحقول بالاسم user_name/user_email، بس الكومبوننت كان بيفحص
  // errors.userName/errors.email (أسماء تانية خالص) — فرسايل الخطأ ما
  // كانتش بتظهر أبداً حتى لو الفورم فاضي.
  it("shows validation errors for both fields when submitted empty", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: "إنشاء الحساب" }));

    expect(await screen.findByText("الاسم مطلوب")).toBeInTheDocument();
    expect(await screen.findByText("البريد الإلكتروني مطلوب")).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("shows a pattern error for an invalid email", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("الاسم"), "طالب");
    await user.type(screen.getByLabelText("البريد الإلكتروني"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "إنشاء الحساب" }));

    expect(await screen.findByText("لازم يكون بريد إلكتروني صحيح")).toBeInTheDocument();
  });

  it("submits successfully with valid data", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("الاسم"), "طالب");
    await user.type(screen.getByLabelText("البريد الإلكتروني"), "student@example.com");
    await user.click(screen.getByRole("button", { name: "إنشاء الحساب" }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "https://aiservice.magacademy.co/v2/signup",
        { user_name: "طالب", user_email: "student@example.com" },
      ),
    );
  });
});
