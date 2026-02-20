import React, { createContext, useState } from "react";

export const UserContext = createContext();

export default function AuthContextProvider({ children }) {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail")?.trim().toLowerCase() || null,
  );

  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userEmail,
        setUserEmail,
        userName,
        setUserName,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
