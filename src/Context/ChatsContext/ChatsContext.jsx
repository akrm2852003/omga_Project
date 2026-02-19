import React, { createContext, useEffect, useState } from "react";

export const UserChatsId = createContext();

export default function ChatsContext({ children, userEmail }) {
  const [userChatsId, setUserChatsId] = useState([]);
  const [userChats, setUserChats] = useState([]);

  /* تحميل IDs من localStorage */
  function loadChatsIds() {
    const allChats = JSON.parse(
      localStorage.getItem("userChatsIdsByEmail") || "{}",
    );

    if (userEmail && allChats[userEmail]) {
      setUserChatsId(allChats[userEmail]);
    } else {
      setUserChatsId([]);
    }
  }

  /* حفظ IDs لكل ايميل */
  function saveChatsIds(ids) {
    const allChats = JSON.parse(
      localStorage.getItem("userChatsIdsByEmail") || "{}",
    );

    if (userEmail) {
      allChats[userEmail] = ids;
      localStorage.setItem("userChatsIdsByEmail", JSON.stringify(allChats));
    }
  }

  useEffect(() => {
    if (userEmail) {
      loadChatsIds();
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      saveChatsIds(userChatsId);
    }
  }, [userChatsId, userEmail]);

  return (
    <UserChatsId.Provider
      value={{
        userChatsId,
        setUserChatsId,
        userChats,
        setUserChats,
      }}
    >
      {children}
    </UserChatsId.Provider>
  );
}
