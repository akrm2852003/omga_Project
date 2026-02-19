import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AuthContext from "./Context/AuthContext/AuthContext.jsx";
import ChatsContext from "./Context/ChatsContext/ChatsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChatsContext>
      <AuthContext>
        <App />
      </AuthContext>
    </ChatsContext>
  </StrictMode>,
);
