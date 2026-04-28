import { Link } from "react-router-dom";
import {
  FaBible,
  FaChurch,
  FaUsers,
  FaStore,
  FaHandsHelping,
  FaCalendarAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../api/api";
import type { Stats } from "../types";
import MainLogo from "../assets/mainlogo.jpg";

/* ─────────────────────────────────────────────
   Inline styles injected once via a <style> tag
   Uses Google Fonts: Cormorant Garamond (display) + Lato (body)
───────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap');

  :root {
    --gold:    #C9A84C;
    --gold-lt: #E8D5A3;
    --gold-dk: #8B6914;
    --cedar:   #2D5016;
    --cedar-lt:#4A7A28;
    --stone:   #F5F0E8;
    --ink:     #1A1A2E;
    --warm:    #6B4423;
  }

  body { font-family: 'Lato', sans-serif; }

  .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }

  /* Gold shimmer on hover */
  .gold-shimmer {
    background: linear-gradient(90deg, var(--gold-dk), var(--gold), var(--gold-lt), var(--gold));
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: background-position 0.6s;
  }
  .gold-shimmer:hover { background-position: right center; }

  /* Geometric cross pattern */
  .cross-bg {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M29 10v40M10 29h40' stroke='%23C9A84C' stroke-width='0.6' stroke-opacity='0.18'/%3E%3C/svg%3E");
  }

  /* Cedar leaf silhouette pattern */
  .cedar-bg {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 100 Q30 70 40 40 Q50 20 60 10 Q70 20 80 40 Q90 70 60 100Z' fill='%232D5016' fill-opacity='0.06'/%3E%3C/svg%3E");
  }

  /* Ornamental divider */
  .ornament::before,
  .ornament::after {
    content: '';
    display: inline-block;
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold));
    vertical-align: middle;
    margin: 0 16px;
  }
  .ornament::after {
    background: linear-gradient(90deg, var(--gold), transparent);
  }

  .hero-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(201,168,76,0.25);
    backdrop-filter: blur(8px);
  }

  .feature-card {
    border-top: 3px solid var(--gold);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }

  .nav-link {
    position: relative;
    color: #1A1A2E;
    font-weight: 700;
    padding: 12px 28px;
    border-radius: 12px;
    background: white;
    border: 1.5px solid #E8D5A3;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.25s;
    font-family: 'Lato', sans-serif;
    font-size: 15px;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .nav-link:hover {
    background: var(--gold);
    border-color: var(--gold-dk);
    color: white;
    box-shadow: 0 4px 16px rgba(201,168,76,0.4);
    transform: translateY(-2px);
  }

  .stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 4rem;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, var(--gold-dk), var(--gold));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.8s ease both; }
  .delay-1 { animation-delay: 0.15s; }
  .delay-2 { animation-delay: 0.30s; }
  .delay-3 { animation-delay: 0.45s; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function HomePage() {
  const FOUNDATION_YEAR = 2026;
  const yearsOfService = Math.max(
    new Date().getFullYear() - FOUNDATION_YEAR,
    0,
  );

  const [animatedStats, setAnimatedStats] = useState<Stats>({
    total_users: 0,
    total_events: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        animateNumbers(res.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const animateNumbers = (target: Stats) => {
    const duration = 1400;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats({
        total_users: Math.floor(ease * target.total_users),
        total_events: Math.floor(ease * target.total_events),
      });
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="min-h-screen" style={{ background: "var(--stone)" }}>
        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section
          className="relative overflow-hidden cross-bg"
          style={{
            background:
              "linear-gradient(160deg, #0D1B0A 0%, #1A2E10 40%, #0D1B3E 100%)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Radial gold glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,168,76,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Lebanese cedar silhouette — right side */}
          <svg
            viewBox="0 0 200 320"
            style={{
              position: "absolute",
              right: "-20px",
              bottom: 0,
              height: "70%",
              opacity: 0.07,
              pointerEvents: "none",
            }}
            fill="#4A7A28"
          >
            <path d="M100 310 L100 180 M100 180 Q60 160 30 130 Q70 140 100 120 Q80 100 50 80 Q85 95 100 75 Q90 55 65 40 Q95 58 100 38 Q105 58 135 40 Q110 55 100 75 Q115 95 150 80 Q120 100 100 120 Q130 140 170 130 Q140 160 100 180Z" />
          </svg>

          {/* Left ornamental cross */}
          <div
            style={{
              position: "absolute",
              left: 32,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 180,
              color: "rgba(201,168,76,0.06)",
              lineHeight: 1,
              fontFamily: "serif",
              userSelect: "none",
            }}
          >
            ✝
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20 fade-up">
            {/* Logo */}
            <div
              style={{
                width: 100,
                height: 100,
                margin: "0 auto 28px",
                borderRadius: "50%",
                border: "2px solid rgba(201,168,76,0.5)",
                boxShadow:
                  "0 0 0 6px rgba(201,168,76,0.08), 0 8px 32px rgba(0,0,0,0.4)",
                overflow: "hidden",
              }}
            >
              <img
                src={MainLogo}
                alt="Kfarhaoura Brotherhood"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Eyebrow */}
            <p
              className="delay-1 fade-up"
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                fontWeight: 700,
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              ✦ &nbsp; Kfarhaoura, Lebanon &nbsp; ✦
            </p>

            {/* Title */}
            <h1
              className="font-display delay-2 fade-up"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Kfarhaoura
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, var(--gold-lt), var(--gold), var(--gold-lt))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Brotherhood
              </span>
            </h1>

            {/* Tagline */}
            <p
              className="delay-3 fade-up"
              style={{
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.65)",
                maxWidth: 520,
                margin: "0 auto 40px",
                lineHeight: 1.75,
                fontWeight: 300,
              }}
            >
              Teaching the Bible to new generations, uniting our town through
              faith, and nurturing a loving Christian community in the mountains
              of Lebanon.
            </p>

            {/* Nav buttons */}
            <div
              className="delay-4 fade-up"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {[
                { to: "/events", icon: <FaCalendarAlt />, label: "Events" },
                { to: "/shops", icon: <FaStore />, label: "Shops" },
                { to: "/users", icon: <FaUsers />, label: "Members" },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="nav-link">
                  {icon} {label}
                </Link>
              ))}
            </div>

            <Link
              to="/login"
              style={{
                display: "inline-block",
                padding: "10px 32px",
                borderRadius: 10,
                border: "1.5px solid rgba(201,168,76,0.35)",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'Lato', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textDecoration: "none",
                transition: "all 0.25s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--gold)";
                (e.currentTarget as HTMLElement).style.color = "var(--gold)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(201,168,76,0.35)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.7)";
              }}
            >
              Member Login
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════
            MISSION + STATS
        ══════════════════════════════════════ */}
        <section
          style={{ background: "var(--stone)" }}
          className="cedar-bg py-24 px-6"
        >
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <p
              className="ornament"
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                fontWeight: 700,
                color: "var(--cedar)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Our Mission
            </p>

            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: 24,
                lineHeight: 1.2,
              }}
            >
              Building Faith, Community & Love
            </h2>

            <p
              style={{
                color: "#555",
                fontSize: "1.05rem",
                maxWidth: 680,
                margin: "0 auto 56px",
                lineHeight: 1.85,
                fontWeight: 300,
              }}
            >
              We are a Christian brotherhood rooted in the mountains of
              Kfarhaoura, Lebanon — dedicated to passing the Gospel to younger
              generations, organizing meaningful events for our town, and
              strengthening the bond of faith and love among all members.
            </p>

            {/* Stats */}
            <div className="stats-grid">
              {[
                {
                  label: "Members",
                  value: loadingStats ? null : animatedStats.total_users,
                },
                {
                  label: "Events Organized",
                  value: loadingStats ? null : animatedStats.total_events,
                },
                {
                  label: "Founded",
                  value: loadingStats
                    ? null
                    : yearsOfService < 1
                      ? "2026"
                      : `${yearsOfService} yrs`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "white",
                    border: "1px solid #E8D5A3",
                    borderTop: "3px solid var(--gold)",
                    borderRadius: 16,
                    padding: "28px 20px",
                  }}
                >
                  {value === null ? (
                    <div
                      style={{
                        height: 56,
                        background: "#EEE",
                        borderRadius: 8,
                        marginBottom: 8,
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                  ) : (
                    <div className="stat-num">{value}</div>
                  )}
                  <p
                    style={{
                      color: "#777",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginTop: 8,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WHAT WE DO
        ══════════════════════════════════════ */}
        <section style={{ background: "white" }} className="py-24 px-6">
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p
                className="ornament"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  fontWeight: 700,
                  color: "var(--cedar)",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                What We Do
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Our Core Activities
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 28,
              }}
            >
              {[
                {
                  icon: (
                    <FaBible
                      style={{ fontSize: 28, color: "var(--gold-dk)" }}
                    />
                  ),
                  title: "Bible Study",
                  desc: "Interactive Bible lessons and discussions for young generations to learn, grow, and deepen their faith in a welcoming environment.",
                },
                {
                  icon: (
                    <FaHandsHelping
                      style={{ fontSize: 28, color: "var(--cedar)" }}
                    />
                  ),
                  title: "Community Prayer",
                  desc: "Regular prayer gatherings where members connect spiritually, support one another, and strengthen the brotherhood through worship and fellowship.",
                },
                {
                  icon: (
                    <FaChurch style={{ fontSize: 28, color: "var(--warm)" }} />
                  ),
                  title: "Community Events",
                  desc: "Organizing Christmas, Easter, and seasonal festivals that bring our entire town together in celebration, service, and shared Christian values.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="feature-card"
                  style={{
                    background: "var(--stone)",
                    borderRadius: 16,
                    padding: "36px 28px",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "white",
                      border: "1.5px solid #E8D5A3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                      boxShadow: "0 2px 8px rgba(201,168,76,0.12)",
                    }}
                  >
                    {icon}
                  </div>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginBottom: 12,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      color: "#666",
                      lineHeight: 1.8,
                      fontSize: "0.95rem",
                      fontWeight: 300,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SCRIPTURE BANNER
        ══════════════════════════════════════ */}
        <section
          style={{
            background:
              "linear-gradient(135deg, var(--cedar) 0%, #1A3A0A 100%)",
            padding: "64px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
          className="cross-bg"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 50% 80% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)",
            }}
          />
          <div
            style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}
          >
            <div
              style={{
                color: "var(--gold)",
                fontSize: 32,
                marginBottom: 16,
                opacity: 0.7,
              }}
            >
              ✝
            </div>
            <blockquote
              className="font-display"
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              "For where two or three gather in my name,
              <br />
              there am I with them."
            </blockquote>
            <cite
              style={{
                color: "var(--gold-lt)",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              — Matthew 18:20
            </cite>
          </div>
        </section>

        {/* ══════════════════════════════════════
            JOIN / CONTACT
        ══════════════════════════════════════ */}
        <section
          style={{ background: "var(--stone)" }}
          className="cedar-bg py-24 px-6"
        >
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <p
              className="ornament"
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                fontWeight: 700,
                color: "var(--cedar)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Get In Touch
            </p>

            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: 16,
              }}
            >
              Join Our Brotherhood
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "1rem",
                lineHeight: 1.85,
                fontWeight: 300,
                marginBottom: 40,
              }}
            >
              Whether you're from Kfarhaoura or simply drawn to our community,
              we welcome you. Reach out to learn more about our sections,
              upcoming events, or how to get involved.
            </p>

            {/* Contact card */}
            <div
              style={{
                background: "white",
                border: "1px solid #E8D5A3",
                borderTop: "3px solid var(--gold)",
                borderRadius: 20,
                padding: "36px 32px",
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, var(--gold-dk), var(--gold))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "#999",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Email us at
              </p>
              <a
                href="mailto:kfarhaoura@gmail.com"
                style={{
                  display: "block",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--cedar)",
                  textDecoration: "none",
                  marginBottom: 20,
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                }}
              >
                kfarhaoura@gmail.com
              </a>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=kfarhaoura@gmail.com&su=Contact from the Brotherhood Website"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background:
                    "linear-gradient(135deg, var(--gold-dk), var(--gold))",
                  color: "white",
                  padding: "13px 32px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
                  transition: "all 0.25s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 24px rgba(201,168,76,0.45)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 16px rgba(201,168,76,0.35)";
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send us an email
              </a>
            </div>

            <p style={{ color: "#aaa", fontSize: 13 }}>
              We'll get back to you as soon as possible. God bless you. 🙏
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer
          style={{
            background: "var(--ink)",
            borderTop: "2px solid var(--gold-dk)",
            padding: "48px 24px",
          }}
        >
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 24,
                marginBottom: 32,
              }}
            >
              {/* Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "2px solid rgba(201,168,76,0.4)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={MainLogo}
                    alt="Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div>
                  <p
                    className="font-display"
                    style={{
                      color: "white",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  >
                    Kfarhaoura Brotherhood
                  </p>
                  <p
                    style={{
                      color: "var(--gold)",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Kfarhaoura · Lebanon
                  </p>
                </div>
              </div>

              {/* Quick links */}
              <div style={{ display: "flex", gap: 28 }}>
                {[
                  { to: "/events", label: "Events" },
                  { to: "/shops", label: "Shops" },
                  { to: "/users", label: "Members" },
                  { to: "/login", label: "Login" },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "var(--gold)")
                    }
                    onMouseOut={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "rgba(255,255,255,0.45)")
                    }
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                paddingTop: 24,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                © 2026 Kfarhaoura Brotherhood. All rights reserved.
              </p>
              <p
                style={{
                  color: "rgba(201,168,76,0.5)",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                Building faith and community in Lebanon ✝
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
