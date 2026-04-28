/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import MainLogo from "../assets/mainlogo.jpg";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr;
    font-family: 'DM Sans', sans-serif;
    background: #0C1A0C;
  }

  @media (min-width: 960px) {
    .lp-root { grid-template-columns: 1fr 1fr; }
  }

  /* ── LEFT PANEL ── */
  .lp-left {
    display: none;
    position: relative;
    overflow: hidden;
    background: #0C1A0C;
  }
  @media (min-width: 960px) { .lp-left { display: flex; flex-direction: column; justify-content: flex-end; padding: 56px; } }

  /* Full bleed photo with dark overlay */
  .lp-photo {
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1608501078713-8e445a709b39?w=900&q=80');
    background-size: cover;
    background-position: center;
  }
  .lp-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(10, 25, 10, 0.97) 0%,
      rgba(10, 25, 10, 0.7) 40%,
      rgba(10, 25, 10, 0.25) 100%
    );
  }

  .lp-left-content { position: relative; z-index: 2; }

  .lp-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(201,168,76,0.12);
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: 100px;
    padding: 6px 16px;
    margin-bottom: 20px;
  }
  .lp-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A84C; }
  .lp-pill-text { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #C9A84C; }

  .lp-heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .lp-heading span {
    font-style: italic;
    color: #C9A84C;
  }

  .lp-desc {
    font-size: 14px;
    font-weight: 300;
    color: rgba(255,255,255,0.5);
    line-height: 1.8;
    max-width: 380px;
    margin-bottom: 36px;
  }

  .lp-quote-block {
    border-left: 2px solid rgba(201,168,76,0.4);
    padding-left: 20px;
  }
  .lp-quote-text {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 15px;
    color: rgba(255,255,255,0.6);
    line-height: 1.7;
    margin-bottom: 8px;
  }
  .lp-quote-ref { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; color: #C9A84C; text-transform: uppercase; }

  /* ── RIGHT PANEL ── */
  .lp-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: #F7F3EC;
    min-height: 100vh;
  }

  .lp-form-wrap { width: 100%; max-width: 420px; }

  /* Mobile header (shown only on mobile) */
  .lp-mobile-header {
    text-align: center;
    margin-bottom: 36px;
  }
  @media (min-width: 960px) { .lp-mobile-header { display: none; } }

  .lp-logo-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #C9A84C;
    box-shadow: 0 0 0 6px rgba(201,168,76,0.1);
    margin: 0 auto 16px;
  }

  .lp-form-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2rem;
    font-weight: 700;
    color: #1A1A10;
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  }
  .lp-form-sub {
    font-size: 14px;
    color: #8A8070;
    font-weight: 300;
    margin-bottom: 32px;
  }

  .lp-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5A5040;
    margin-bottom: 8px;
  }

  .lp-input-wrap { position: relative; margin-bottom: 20px; }

  .lp-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #B0A080;
  }

  .lp-input {
    width: 100%;
    padding: 13px 16px 13px 44px;
    background: white;
    border: 1.5px solid #DDD5C0;
    border-radius: 12px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #1A1A10;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lp-input:focus {
    border-color: #C9A84C;
    box-shadow: 0 0 0 4px rgba(201,168,76,0.12);
  }
  .lp-input::placeholder { color: #C0B090; }

  .lp-error {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #FFF1F1;
    border: 1px solid #FFC9C9;
    border-left: 3px solid #E53E3E;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 13.5px;
    color: #C53030;
  }

  .lp-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #6B4A10 0%, #C9A84C 60%, #E8D5A3 100%);
    color: white;
    font-size: 15px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(201,168,76,0.3);
    transition: all 0.25s;
    margin-top: 8px;
  }
  .lp-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(201,168,76,0.4);
  }
  .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .lp-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 28px 0;
  }
  .lp-divider-line { flex: 1; height: 1px; background: #DDD5C0; }
  .lp-divider-icon { color: #C9A84C; font-size: 16px; line-height: 1; }

  .lp-back {
    display: block;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #8A7050;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .lp-back:hover { color: #5A3A10; }

  .lp-footer {
    text-align: center;
    margin-top: 32px;
    font-size: 11px;
    color: #B0A080;
    letter-spacing: 0.04em;
  }

  /* Cedar branch decoration (right panel, top right) */
  .lp-cedar-deco {
    position: fixed;
    top: -30px;
    right: -30px;
    width: 180px;
    height: 180px;
    opacity: 0.07;
    pointer-events: none;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fu  { animation: fadeUp 0.6s ease both; }
  .fu1 { animation-delay: 0.05s; }
  .fu2 { animation-delay: 0.12s; }
  .fu3 { animation-delay: 0.19s; }
  .fu4 { animation-delay: 0.26s; }
  .fu5 { animation-delay: 0.33s; }
  .fu6 { animation-delay: 0.40s; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.9s linear infinite; }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const {
        data: { access_token },
      } = await api.post("/login", { email, password });
      localStorage.setItem("access_token", access_token);
      const { data: userInfo } = await api.get("/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      localStorage.setItem("user_info", JSON.stringify(userInfo));
      navigate("/users");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="lp-root">
        {/* ════════════════════════════
            LEFT — photo + brand story
        ════════════════════════════ */}
        <div className="lp-left">
          <div className="lp-photo" />

          <div className="lp-left-content">
            {/* Pill badge */}
            <div className="lp-pill">
              <span className="lp-pill-dot" />
              <span className="lp-pill-text">Kfarhaoura · Lebanon</span>
            </div>

            {/* Heading */}
            <h1 className="lp-heading">
              Kfarhaoura
              <br />
              <span>Brotherhood</span>
            </h1>

            <p className="lp-desc">
              Teaching the Bible to new generations, uniting our community
              through faith and love in the mountains of Lebanon.
            </p>

            {/* Scripture */}
            <div className="lp-quote-block">
              <p className="lp-quote-text">
                "So do not fear, for I am with you;
                <br />
                do not be dismayed, for I am your God."
              </p>
              <p className="lp-quote-ref">Isaiah 41:10</p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — login form
        ════════════════════════════ */}
        <div className="lp-right">
          {/* Cedar SVG decoration (subtle, top-right corner) */}
          <svg className="lp-cedar-deco" viewBox="0 0 200 200" fill="#2D5016">
            <path d="M100 190 L100 110 Q70 95 45 70 Q80 82 100 60 Q82 45 55 30 Q88 46 100 28 Q112 46 145 30 Q118 45 100 60 Q120 82 155 70 Q130 95 100 110Z" />
          </svg>

          <div className="lp-form-wrap">
            {/* Mobile-only header */}
            <div className="lp-mobile-header fu fu1">
              <div className="lp-logo-ring">
                <img
                  src={MainLogo}
                  alt="Brotherhood Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.4rem",
                  color: "#1A1A10",
                  fontWeight: 700,
                }}
              >
                Kfarhaoura Brotherhood
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "#B0A080",
                  marginTop: 4,
                  letterSpacing: "0.08em",
                }}
              >
                KFARHAOURA · LEBANON
              </p>
            </div>

            {/* Form heading */}
            <div className="fu fu1">
              <h2 className="lp-form-title">Sign in</h2>
              <p className="lp-form-sub">Welcome back to the Brotherhood</p>
            </div>

            {/* Error */}
            {error && (
              <div className="lp-error fu">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="fu fu2">
                <label className="lp-label">Email Address</label>
                <div className="lp-input-wrap">
                  <svg
                    className="lp-input-icon"
                    width="16"
                    height="16"
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
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="lp-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="fu fu3">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <svg
                    className="lp-input-icon"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="lp-input"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="fu fu4">
                <button type="submit" disabled={loading} className="lp-btn">
                  {loading ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        className="spin"
                        width="17"
                        height="17"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="4"
                        />
                        <path
                          fill="white"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    "Sign In →"
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="lp-divider fu fu5">
              <div className="lp-divider-line" />
              <span className="lp-divider-icon">✝</span>
              <div className="lp-divider-line" />
            </div>

            {/* Back link */}
            <Link to="/" className="lp-back fu fu6">
              ← Back to Home
            </Link>

            {/* Footer */}
            <p className="lp-footer fu fu6">
              © 2026 Kfarhaoura Brotherhood · All rights reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
