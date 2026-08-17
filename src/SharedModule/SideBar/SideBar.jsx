import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiMessageSquare, FiMessageCircle } from "react-icons/fi";
import axios from "axios";
import { UserChatsId } from "../../Context/ChatsContext/UserChatsId";
import { UserContext } from "../../Context/AuthContext/UserContext";
import logo from "../../assets/logo.png";
import { groupChats } from "./groupChats";
import "./sideBar.css";

const API_BASE = "https://aiservice.magacademy.co";

export default function SideBar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const { userChatsId } = useContext(UserChatsId);
  const { userId } = useContext(UserContext);

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const fetchTokenRef = useRef(0);

  useEffect(() => {
    const token = ++fetchTokenRef.current;

    async function loadChats() {
      if (!userId) {
        setChats([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/v2/user-chats/${userId}`);
        if (fetchTokenRef.current !== token) return;
        setChats(res.data.chats || []);
      } catch (err) {
        console.log(err);
        if (fetchTokenRef.current === token) setChats([]);
      } finally {
        if (fetchTokenRef.current === token) setLoading(false);
      }
    }

    loadChats();
  }, [userId, userChatsId]);

  const filteredChats = query.trim()
    ? chats.filter((c) => c.title.includes(query.trim()))
    : chats;

  const grouped = groupChats(filteredChats);

  function goToChat(chatId) {
    navigate(`/home/chat/${chatId}`);
    closeSidebar?.();
  }

  function goToNewChat() {
    navigate("/home");
    closeSidebar?.();
  }

  const listContent = (
    <>
      <div
        className="sidebar-brand"
        onClick={() => navigate("/home")}
      >
        <img src={logo} alt="OmGa AI" />
        <span>OmGa AI</span>
      </div>

      <button className="sidebar-new-chat" onClick={goToNewChat}>
        <FiPlus size={18} />
        شات جديد
      </button>

      {chats.length > 3 && (
        <div className="sidebar-search">
          <FiSearch size={16} />
          <input
            placeholder="دور على محادثة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="sidebar-list">
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="sidebar-skeleton-row" />
            ))}
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="sidebar-empty">
            <FiMessageCircle size={34} />
            <span>مفيش محادثات لسه — ابدأ سؤالك الأول!</span>
          </div>
        )}

        {!loading &&
          grouped.map(([label, items]) => (
            <div key={label} className="sidebar-group">
              <div className="sidebar-group-label">{label}</div>
              <div className="sidebar-group-items">
                {items.map((chat) => (
                  <motion.button
                    key={chat.notebook_id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ x: -2 }}
                    className={`sidebar-item ${chat.notebook_id === activeId ? "active" : ""}`}
                    onClick={() => goToChat(chat.notebook_id)}
                  >
                    <FiMessageSquare className="sidebar-item-icon" size={15} />
                    <span className="sidebar-item-title">{chat.title}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop: عمود قابل للطي جوه الـ flex layout ─────── */}
      <motion.div
        className="sidebar-shell d-none d-md-flex"
        animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        style={{ overflow: "hidden", padding: isOpen ? undefined : 0, border: isOpen ? undefined : "none" }}
      >
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: "var(--space-4)", height: "100%" }}>
          {listContent}
        </div>
      </motion.div>

      {/* ── Mobile: overlay منزلق ────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="sidebar-overlay d-md-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />
            <motion.div
              className="sidebar-shell d-md-none"
              style={{ width: 280 }}
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {listContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
