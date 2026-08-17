import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpLeft, FiExternalLink } from "react-icons/fi";
import logo from "../../assets/logo-icon.png";
import "./footer.css";

const COMPANY_URL = "https://omga-solutions.vercel.app/";

const PRODUCT_LINKS = [
  { label: "ابدأ مجاناً", to: "/register" },
  { label: "تسجيل الدخول", to: "/login" },
];

const SUBJECT_LINKS = [
  { label: "كيمياء", emoji: "🧪" },
  { label: "فيزياء", emoji: "⚛️" },
  { label: "أحياء وجيولوجيا", emoji: "🧬" },
  { label: "عربي وإنجليزي", emoji: "📖" },
];

function FooterColumn({ title, children, delay = 0 }) {
  return (
    <motion.div
      className="site-footer-col"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <h4>{title}</h4>
      {children}
    </motion.div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-glow" />

      <div className="site-footer-inner">
        <motion.div
          className="site-footer-brand"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="site-footer-brand-mark">
            <img src={logo} alt="OmGa AI" />
            <span>OmGa AI</span>
          </div>
          <p>
            مدرّس خصوصي بالذكاء الاصطناعي، متاح 24 ساعة يجاوبك في الكيمياء
            والفيزياء والأحياء والجيولوجيا والعربي والإنجليزي — بشرح بسيط
            بعاميتك المصرية.
          </p>
          <a className="site-footer-badge" href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
            <span>صناعة</span>
            <strong>OmGa Solutions</strong>
            <FiExternalLink size={13} />
          </a>
        </motion.div>

        <FooterColumn title="المنتج" delay={0.05}>
          {PRODUCT_LINKS.map((l) => (
            <Link key={l.label} to={l.to}>
              <FiArrowUpLeft className="site-footer-link-icon" size={13} />
              {l.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="المواد" delay={0.1}>
          {SUBJECT_LINKS.map((s) => (
            <Link key={s.label} to="/register">
              <span>{s.emoji}</span> {s.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="الشركة" delay={0.15}>
          <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
            <FiArrowUpLeft className="site-footer-link-icon" size={13} />
            omga-solutions.vercel.app
          </a>
        </FooterColumn>
      </div>

      <div className="site-footer-bottom">
        <p>© {year} OmGa Solutions. جميع الحقوق محفوظة.</p>
        <p className="site-footer-tagline">صُنع بشغف لطلاب الثانوية العامة 💜</p>
      </div>
    </footer>
  );
}
