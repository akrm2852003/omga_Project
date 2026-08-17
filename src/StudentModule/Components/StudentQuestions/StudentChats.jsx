import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../Context/AuthContext/AuthContext";
import "./studentChats.css";

const API_BASE = "https://aiservice.magacademy.co";

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "دلوقتي";
  if (mins < 60) return `من ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `من ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `من ${days} يوم`;
  return new Date(iso).toLocaleDateString("ar-EG");
}

export default function StudentChats() {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadChats() {
      if (!userId) { setLoading(false); return; }

      try {
        const res = await axios.get(`${API_BASE}/v2/user-chats/${userId}`);
        setChats(res.data.chats || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, [userId]);

  const filtered = query.trim()
    ? chats.filter((c) => c.title.includes(query.trim()))
    : chats;

  return (
    <div className="student-chats-page">
      <div className="student-chats-header">
        <h1>كل محادثاتي</h1>
        <div className="student-chats-search">
          <FiSearch size={16} />
          <input
            placeholder="دور في محادثاتك..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="student-chats-loading">جاري التحميل...</div>}

      {!loading && filtered.length === 0 && (
        <div className="student-chats-empty">
          <FiMessageCircle size={40} style={{ marginBottom: 12, opacity: 0.6 }} />
          <p>مفيش محادثات لسه — ابدأ سؤالك الأول من الصفحة الرئيسية.</p>
        </div>
      )}

      <div className="student-chats-grid">
        {filtered.map((chat, i) => (
          <motion.button
            key={chat.notebook_id}
            className="chat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            onClick={() => navigate(`/home/chat/${chat.notebook_id}`)}
          >
            <div className="chat-card-title">{chat.title}</div>
            <div className="chat-card-meta">
              <span>{chat.message_count} رسالة</span>
              <span>{relativeTime(chat.updated_at)}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
