import React, { createContext, useEffect, useState, useContext } from "react";
import { UserContext } from "../AuthContext/AuthContext";

export const UserChatsId = createContext();

export default function ChatsContext({ children }) {
  const { userEmail } = useContext(UserContext);
  const [userChatsId, setUserChatsId] = useState([]);
  const [userChats, setUserChats] = useState([]);

  useEffect(() => {
    if (!userEmail) return; // لو مفيش ايميل، نوقف التنفيذ
    const allChats = JSON.parse(
      localStorage.getItem("userChatsIdsByEmail") || "{}",
    );
    if (allChats[userEmail]) setUserChatsId(allChats[userEmail]);
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return; // لو مفيش ايميل، نوقف التنفيذ
    const allChats = JSON.parse(
      localStorage.getItem("userChatsIdsByEmail") || "{}",
    );
    allChats[userEmail] = userChatsId;
    localStorage.setItem("userChatsIdsByEmail", JSON.stringify(allChats));
  }, [userChatsId, userEmail]);

  return (
    <UserChatsId.Provider
      value={{ userChatsId, setUserChatsId, userChats, setUserChats }}
    >
      {children}
    </UserChatsId.Provider>
  );
}
