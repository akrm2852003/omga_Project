import React, { createContext, useState, useEffect } from "react";

export const UserChatsId = createContext();

export default function ChatsContext({ children }) {
  // قراءة الشاتس من localStorage مباشرة
  const [userChatsId, setUserChatsId] = useState(
    JSON.parse(localStorage.getItem("userChatsId")) || [],
  );

  // أي تغيير في الشاتس يحدثه Context يخزن تلقائيًا في localStorage
  useEffect(() => {
    localStorage.setItem("userChatsId", JSON.stringify(userChatsId));
  }, [userChatsId]);

  return (
    <UserChatsId.Provider value={{ userChatsId, setUserChatsId }}>
      {children}
    </UserChatsId.Provider>
  );
}
