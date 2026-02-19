import React, { createContext, useState } from "react";

export const UserContext = createContext();

export default function AuthContextProvider({ children }) {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || null,
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  // دالة Logout
  function logout() {
    // مسح البيانات من localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userChatsIdsByEmail");

    // إعادة تعيين State
    setUserId(null);
    setUserEmail(null);
    setUserName("");

    // إعادة توجيه المستخدم للصفحة الرئيسية أو صفحة تسجيل الدخول
    window.location.href = "/login"; // أو استخدم useNavigate في حالة React Router
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
        logout, // تمرير الدالة للـContext
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
