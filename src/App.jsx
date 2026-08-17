import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthLayout from "./SharedModule/AuthLayout/AuthLayout";
import NotFound from "./SharedModule/NotFound/NotFound";
import MasterLayout from "./SharedModule/MasterLayout/MasterLayout";

import Login from "./AuthModule/Components/Login/Login";
import Register from "./AuthModule/Components/Register/Register";
import Welcome from "./SharedModule/Welcome/Welcome";

import ChatPage from "./StudentModule/Components/ChatPage/ChatPage";
import StudentChats from "./StudentModule/Components/StudentQuestions/StudentChats";

import ProtectedRoute from "./SharedModule/ProtectedRoute/ProtectedRoute";

function App() {
  const routes = createBrowserRouter([
    /* ================= LANDING + AUTH ================= */
    {
      path: "/",
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Welcome /> },
        {
          element: <AuthLayout />,
          children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
          ],
        },
      ],
    },

    /* ================= HOME ROUTES ================= */
    {
      path: "home",
      element: (
        <ProtectedRoute>
          <MasterLayout />
        </ProtectedRoute>
      ),
      errorElement: <NotFound />,
      children: [
        /* شات جديد */
        { index: true, element: <ChatPage /> },
        { path: "chat", element: <ChatPage /> },

        /* شات قديم */
        { path: "chat/:id", element: <ChatPage /> },

        { path: "student-chats", element: <StudentChats /> },
      ],
    },

    /* ================= GLOBAL NOT FOUND ================= */
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
      <ToastContainer
        position="top-center"
        rtl
        theme="dark"
        autoClose={3500}
        hideProgressBar
      />
    </>
  );
}

export default App;
