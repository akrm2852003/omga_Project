import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
    /* ================= AUTH ROUTES ================= */
    {
      path: "/",
      element: <AuthLayout />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Login /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "welcome", element: <Welcome /> },
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

  return <RouterProvider router={routes} />;
}

export default App;
