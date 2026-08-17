import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import AuthContext from "../../../Context/AuthContext/AuthContext";
import ChatsContext from "../../../Context/ChatsContext/ChatsContext";

vi.mock("axios");

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthContext>
        <ChatsContext>
          <Login />
        </ChatsContext>
      </AuthContext>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Login", () => {
  it("shows a required-field error when submitted empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "دخول" }));

    expect(await screen.findByText("البريد الإلكتروني مطلوب")).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  // ريجريشن تِست: قبل كده أي خطأ (يوزر مش موجود، مشكلة شبكة) كان بيتعمله
  // console.log بس والمستخدم مايشوفش أي حاجة على الشاشة.
  it("shows a clear inline message when the account does not exist (404)", async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 404 } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("البريد الإلكتروني"), "nobody@example.com");
    await user.click(screen.getByRole("button", { name: "دخول" }));

    expect(await screen.findByText(/مفيش حساب بالإيميل ده/)).toBeInTheDocument();
  });

  it("shows a generic connection error for non-404 failures", async () => {
    axios.post.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("البريد الإلكتروني"), "student@example.com");
    await user.click(screen.getByRole("button", { name: "دخول" }));

    expect(await screen.findByText(/حصلت مشكلة في الاتصال/)).toBeInTheDocument();
  });

  it("stores the user and chats on successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: { user_id: "u_1", user_email: "student@example.com", user_name: "طالب" },
        chats: ["q_1", "q_2"],
      },
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("البريد الإلكتروني"), "student@example.com");
    await user.click(screen.getByRole("button", { name: "دخول" }));

    await waitFor(() => expect(localStorage.getItem("userId")).toBe("u_1"));
    expect(JSON.parse(localStorage.getItem("userChatsId"))).toEqual(["q_1", "q_2"]);
  });
});
