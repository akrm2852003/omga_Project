import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-icon.png";
import "./footer.css";

const COMPANY_URL = "https://omga-solutions.vercel.app/";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-brand-mark">
            <img src={logo} alt="OmGa AI" />
            <span>OmGa AI</span>
          </div>
          <p>
            مدرّس خصوصي بالذكاء الاصطناعي، متاح 24 ساعة يجاوبك في الكيمياء
            والفيزياء والأحياء والجيولوجيا والعربي والإنجليزي.
          </p>
        </div>

        <div className="site-footer-col">
          <h4>المنتج</h4>
          <Link to="/register">ابدأ مجاناً</Link>
          <Link to="/login">تسجيل الدخول</Link>
        </div>

        <div className="site-footer-col">
          <h4>الشركة</h4>
          <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
            OmGa Solutions
          </a>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>© {year} OmGa Solutions. جميع الحقوق محفوظة.</p>
        <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
          omga-solutions.vercel.app
        </a>
      </div>
    </footer>
  );
}
