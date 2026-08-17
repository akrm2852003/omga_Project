import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthContext from "./Context/AuthContext/AuthContext.jsx";
import ChatsContext from "./Context/ChatsContext/ChatsContext.jsx";
import ThemeContextProvider from "./Context/ThemeContext/ThemeContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeContextProvider>
      <AuthContext>
        <ChatsContext>
          <App />
        </ChatsContext>
      </AuthContext>
    </ThemeContextProvider>
  </StrictMode>,
);
