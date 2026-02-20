import React, { useContext, useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/siadeBarLogo.png";
import { UserChatsId } from "../../Context/ChatsContext/ChatsContext";

import axios from "axios";

export default function SideBar() {
  const navigate = useNavigate();
  const { userChatsId } = useContext(UserChatsId);
  const [userChats, setUserChats] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function fetchChats() {
      if (!userChatsId || userChatsId.length === 0) {
        setUserChats([]);
        return;
      }

      try {
        const responses = await Promise.all(
          userChatsId.map((id) =>
            axios.get(`https://aiservice.magacademy.co/v2/chat/${id}`),
          ),
        );
        setUserChats(responses.map((res) => res.data));
      } catch (error) {
        console.log(error);
        setUserChats([]);
      }
    }

    fetchChats();
  }, [userChatsId]);

  function handleNewChat() {
    navigate("/home");
  }

  return (
    <div className="my-sidebar-container h-100">
      <Sidebar className="h-100 vh-100" collapsed={isCollapsed}>
        <Menu className="h-100">
          <div className="text-center py-3">
            <img
              className="w-50"
              onClick={() => setIsCollapsed(!isCollapsed)}
              src={logo}
              alt=""
              style={{ cursor: "pointer" }}
            />
          </div>

          <MenuItem
            onClick={handleNewChat}
            icon={<i className="fa-solid fa-plus"></i>}
          >
            New Chat
          </MenuItem>

          {userChats.length > 0 ? (
            userChats.map((chat) => (
              <MenuItem
                key={chat.question_id}
                onClick={() => navigate(`/home/chat/${chat.question_id}`)}
                icon={<i className="fa-solid fa-robot"></i>}
              >
                {chat.chat?.[0]?.text?.slice(0, 20) || "Chat"}
              </MenuItem>
            ))
          ) : (
            <div className="text-center p-3 text-muted">No chats yet</div>
          )}
        </Menu>
      </Sidebar>
    </div>
  );
}
