import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../../assets/logo-icon.png";
import Footer from "../Footer/Footer";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./welcome.css";

gsap.registerPlugin(ScrollTrigger);

const API_BASE = "https://aiservice.magacademy.co";

const STEPS = [
  { title: "اسأل أو صوّر سؤالك", desc: "اكتب سؤالك أو صوّر واجبك بالكاميرا مباشرة، من غير ما تكتب أي حاجة يدوي." },
  { title: "شرح فوري وبسيط", desc: "هتستلم إجابة بعامية مصرية واضحة، مقسّمة خطوة بخطوة زي ما مدرّسك بيشرحلك." },
  { title: "راجع في أي وقت", desc: "كل محادثاتك متسجلة وسهل ترجعلها وقت المراجعة قبل الامتحان." },
];

const SUBJECTS = [
  { emoji: "🧪", label: "كيمياء" },
  { emoji: "⚛️", label: "فيزياء" },
  { emoji: "🧬", label: "أحياء وجيولوجيا" },
  { emoji: "📖", label: "عربي" },
  { emoji: "🔤", label: "إنجليزي" },
];

const MOCKUP_MESSAGES = [
  { role: "ai",   text: "أهلاً بيك! قولّي سؤالك وأنا معاك 💪" },
  { role: "user", text: "ممكن تشرحلي قانون بويل؟" },
  { role: "ai",   text: "🔹 قانون بويل بيقول إن الضغط والحجم عكسيين لما درجة الحرارة تبقى ثابتة..." },
];

export default function Welcome() {
  const containerRef   = useRef(null);
  const heroRef        = useRef(null);
  const statsSectionRef = useRef(null);
  const statRefs = useRef({});

  const [stats, setStats] = useState(null);

  // ── جلب الإحصائيات الحية من الباك اند ─────────────────────────
  useEffect(() => {
    axios
      .get(`${API_BASE}/stats/overview`)
      .then((res) => setStats(res.data.stats))
      .catch((err) => console.log(err));
  }, []);

  // ── Hero entrance timeline ──────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: -10, duration: 0.5 })
        .from(".hero h1", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
        .from(".hero-desc", { opacity: 0, y: 16, duration: 0.5 }, "-=0.35")
        .from(".hero-cta", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
        .to(".hero-mockup-row", { opacity: 1, y: 0, duration: 0.5, stagger: 0.18 }, "-=0.2");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // ── Scroll reveal للسكاشن ────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".step-card").forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.utils.toArray(".subject-card").forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          delay: i * 0.06,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ── عداد الإحصائيات الحية لما يدخل الشاشة ───────────────────
  useEffect(() => {
    if (!stats || !statsSectionRef.current) return;

    const targets = [
      { key: "total_questions", ref: statRefs.current.questions },
      { key: "total_answers",   ref: statRefs.current.answers },
      { key: "response_rate",   ref: statRefs.current.rate, suffix: "%" },
    ];

    const trigger = ScrollTrigger.create({
      trigger: statsSectionRef.current,
      start: "top 85%",
      once: true,
      onEnter: () => {
        targets.forEach(({ key, ref, suffix }) => {
          if (!ref) return;
          const target = Number(stats[key]) || 0;
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              ref.textContent = Math.floor(counter.val).toLocaleString("ar-EG") + (suffix || "");
            },
          });
        });
      },
    });

    return () => trigger.kill();
  }, [stats]);

  return (
    <div className="landing" ref={containerRef}>
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <img src={logo} alt="OmGa AI" />
          <span>OmGa AI</span>
        </div>
        <div className="landing-nav-links">
          <ThemeToggle />
          <Link className="btn btn-ghost" to="/login">دخول</Link>
          <Link className="btn btn-primary" to="/register">ابدأ مجاناً</Link>
        </div>
      </nav>

      <section className="hero" ref={heroRef}>
        <span className="hero-eyebrow">✨ مدرّس خصوصي بالذكاء الاصطناعي</span>
        <h1>
          مذاكرة أذكى، إجابات فورية،<br />
          <span className="text-gradient">ومدرّس في جيبك 24 ساعة</span>
        </h1>
        <p className="hero-desc">
          اسأل، صوّر واجبك، أو ناقش أي درس — وهترد عليك OmGa AI فوراً بشرح
          بسيط بعاميتك، في كل المواد الأساسية.
        </p>
        <div className="hero-cta">
          <Link className="btn btn-primary" to="/register">ابدأ مجاناً الآن</Link>
          <Link className="btn btn-ghost" to="/login">عندي حساب بالفعل</Link>
        </div>

        <div className="hero-mockup">
          {MOCKUP_MESSAGES.map((m, i) => (
            <div key={i} className={`hero-mockup-row ${m.role === "user" ? "user" : ""}`}>
              {m.role !== "user" && <div className="hero-mockup-avatar" />}
              <div className="hero-mockup-bubble">{m.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>إزاي بيشتغل؟</h2>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className="step-card" key={s.title}>
              <div className="step-number">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>المواد المتاحة</h2>
        <div className="subjects-grid">
          {SUBJECTS.map((s) => (
            <div className="subject-card" key={s.label}>
              <div className="subject-emoji">{s.emoji}</div>
              <h3>{s.label}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section" ref={statsSectionRef}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number" ref={(el) => (statRefs.current.questions = el)}>0</div>
            <p>سؤال اتسأل</p>
          </div>
          <div className="stat-card">
            <div className="stat-number" ref={(el) => (statRefs.current.answers = el)}>0</div>
            <p>إجابة اتبعتت</p>
          </div>
          <div className="stat-card">
            <div className="stat-number" ref={(el) => (statRefs.current.rate = el)}>0%</div>
            <p>معدّل الرد</p>
          </div>
        </div>
      </section>

      <section className="landing-final-cta">
        <h2>يلا نبدأ مذاكرتك النهاردة</h2>
        <Link className="btn btn-primary" to="/register">اعمل حسابك مجاناً</Link>
      </section>

      <Footer />
    </div>
  );
}
