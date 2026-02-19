import React, { createContext, useEffect, useState } from "react";

export let UserContext = createContext();

export default function AuthContext({ children }) {
  const [userId, setUserId] = useState(null);
  const [userEmail, setuserEmail] = useState(null);

  function saveLoginData() {
    setUserId(localStorage.getItem("userId"));
    setuserEmail(localStorage.getItem("userEmail"));
  }

  function logout() {
    localStorage.removeItem("userId");
    window.location.href = "/login";
  }

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      saveLoginData();
    }
  }, []);

  return (
    <>
      <UserContext.Provider
        value={{ userId, setUserId, logout , setuserEmail , userEmail }}
      >
        {children}
      </UserContext.Provider>
    </>
  );
}
