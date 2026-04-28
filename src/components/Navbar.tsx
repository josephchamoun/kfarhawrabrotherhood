/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Award,
  Sparkles,
  Flame,
  Calendar,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Phone,
  ChevronDown,
  VoteIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import MainLogo from "../assets/mainlogo.jpg";
import { MdAccountCircle } from "react-icons/md";
import { BiDollar } from "react-icons/bi";

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lato:wght@400;700&display=swap');

  :root {
    --gold:    #C9A84C;
    --gold-lt: #E8D5A3;
    --gold-dk: #8B6914;
    --cedar:   #2D5016;
    --ink:     #1A1A2E;
  }

  .nb-root {
    position: sticky;
    top: 0;
    z-index: 50;
    background: linear-gradient(90deg, #0D1B0A 0%, #111826 50%, #0D1B0A 100%);
    border-bottom: 1px solid rgba(201,168,76,0.22);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    font-family: 'Lato', sans-serif;
  }

  /* Subtle cross-pattern overlay */
  .nb-root::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M19 6v28M6 19h28' stroke='%23C9A84C' stroke-width='0.4' stroke-opacity='0.1'/%3E%3C/svg%3E");
  }

  .nb-inner {
    position: relative;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Logo */
  .nb-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .nb-logo-ring {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1.5px solid rgba(201,168,76,0.5);
    overflow: hidden;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08), 0 4px 12px rgba(0,0,0,0.4);
    flex-shrink: 0;
  }
  .nb-logo-ring img { width: 100%; height: 100%; object-fit: cover; }
  .nb-logo-text {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }
  .nb-logo-sub {
    font-family: 'Lato', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--gold);
    text-transform: uppercase;
    display: block;
  }

  /* Desktop nav */
  .nb-desktop {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  @media (max-width: 1023px) { .nb-desktop { display: none; } }

  .nb-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .nb-link:hover {
    color: var(--gold);
    background: rgba(201,168,76,0.07);
    border-color: rgba(201,168,76,0.15);
  }
  .nb-link.active {
    color: var(--gold);
    background: rgba(201,168,76,0.12);
    border-color: rgba(201,168,76,0.3);
    box-shadow: 0 2px 8px rgba(201,168,76,0.12);
  }

  /* Gold divider between primary and more */
  .nb-divider {
    width: 1px;
    height: 20px;
    background: rgba(201,168,76,0.2);
    margin: 0 4px;
  }

  /* More button */
  .nb-more-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nb-more-btn:hover, .nb-more-btn.open {
    color: var(--gold);
    background: rgba(201,168,76,0.07);
    border-color: rgba(201,168,76,0.15);
  }
  .nb-more-chevron {
    transition: transform 0.2s;
  }
  .nb-more-chevron.rotated { transform: rotate(180deg); }

  /* Dropdown */
  .nb-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    width: 220px;
    background: #111826;
    border: 1px solid rgba(201,168,76,0.2);
    border-top: 2px solid var(--gold);
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    padding: 8px;
    animation: nbDropDown 0.18s ease;
    overflow: hidden;
  }
  @keyframes nbDropDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nb-dropdown-header {
    padding: 6px 10px 10px;
    margin-bottom: 4px;
    border-bottom: 1px solid rgba(201,168,76,0.12);
  }
  .nb-dropdown-header span {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.7;
  }
  .nb-drop-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    transition: all 0.18s;
    margin-bottom: 2px;
  }
  .nb-drop-link:hover {
    color: var(--gold);
    background: rgba(201,168,76,0.08);
  }
  .nb-drop-link.active {
    color: var(--gold);
    background: rgba(201,168,76,0.12);
  }

  /* Logout */
  .nb-logout {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(220,38,38,0.65);
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 4px;
  }
  .nb-logout:hover {
    color: #FCA5A5;
    background: rgba(220,38,38,0.1);
    border-color: rgba(220,38,38,0.2);
  }

  /* Mobile toggle */
  .nb-mobile-btn {
    display: none;
    padding: 8px;
    border-radius: 10px;
    background: none;
    border: 1px solid rgba(201,168,76,0.2);
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.2s;
  }
  .nb-mobile-btn:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(201,168,76,0.07);
  }
  @media (max-width: 1023px) { .nb-mobile-btn { display: flex; align-items: center; } }

  /* Mobile menu */
  .nb-mobile-menu {
    position: relative;
    border-top: 1px solid rgba(201,168,76,0.15);
    padding: 12px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    animation: nbDropDown 0.2s ease;
    max-height: 80vh;
    overflow-y: auto;
  }
  .nb-mobile-section {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.6;
    padding: 10px 10px 4px;
  }
  .nb-mobile-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    transition: all 0.18s;
    border: 1px solid transparent;
  }
  .nb-mobile-link:hover {
    color: var(--gold);
    background: rgba(201,168,76,0.07);
    border-color: rgba(201,168,76,0.15);
  }
  .nb-mobile-link.active {
    color: var(--gold);
    background: rgba(201,168,76,0.12);
    border-color: rgba(201,168,76,0.25);
  }
  .nb-mobile-logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    color: rgba(220,38,38,0.65);
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.18s;
    width: 100%;
    margin-top: 4px;
  }
  .nb-mobile-logout:hover {
    color: #FCA5A5;
    background: rgba(220,38,38,0.1);
    border-color: rgba(220,38,38,0.2);
  }
  .nb-mobile-divider {
    height: 1px;
    background: rgba(201,168,76,0.1);
    margin: 6px 0;
  }
`;

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    navigate("/login");
  };

  const primaryNavItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/users", label: "Members", icon: Users },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/money", label: "Money", icon: BiDollar },
    { to: "/elections", label: "Elections", icon: VoteIcon },
  ];

  const secondaryNavItems = [
    { to: "/chabiba", label: "Chabiba", icon: Award },
    { to: "/tala2e3", label: "Tala2e3", icon: Sparkles },
    { to: "/forsan", label: "Forsan", icon: Flame },
    { to: "/shops", label: "Shops", icon: ShoppingBag },
    { to: "/contacts", label: "Contacts", icon: Phone },
    {
      to: "/meetings",
      label: "Meetings",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: (props: any) => (
        <UserGroupIcon style={{ width: 14, height: 14 }} {...props} />
      ),
    },
    {
      to: "/driveaccounts",
      label: "Drive Accounts",
      icon: (props: any) => (
        <MdAccountCircle style={{ width: 14, height: 14 }} {...props} />
      ),
    },
  ];

  return (
    <>
      <style>{navStyles}</style>

      <nav className="nb-root">
        <div className="nb-inner">
          {/* Logo */}
          <NavLink to="/" className="nb-logo">
            <div className="nb-logo-ring">
              <img src={MainLogo} alt="Kfarhaoura Brotherhood" />
            </div>
            <div className="hidden sm:block">
              <span className="nb-logo-text">Brotherhood</span>
              <span className="nb-logo-sub">Kfarhaoura · Lebanon</span>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <div className="nb-desktop">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `nb-link${isActive ? " active" : ""}`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}

            <div className="nb-divider" />

            {/* More dropdown */}
            <div style={{ position: "relative" }} ref={moreMenuRef}>
              <button
                className={`nb-more-btn${moreMenuOpen ? " open" : ""}`}
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              >
                <Menu size={14} />
                More
                <ChevronDown
                  size={13}
                  className={`nb-more-chevron${moreMenuOpen ? " rotated" : ""}`}
                />
              </button>

              {moreMenuOpen && (
                <div className="nb-dropdown">
                  <div className="nb-dropdown-header">
                    <span>✦ &nbsp; Sections &amp; More</span>
                  </div>
                  {secondaryNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreMenuOpen(false)}
                      className={({ isActive }) =>
                        `nb-drop-link${isActive ? " active" : ""}`
                      }
                    >
                      <item.icon size={14} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="nb-divider" />

            <button className="nb-logout" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="nb-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="nb-mobile-menu">
            <div className="nb-mobile-section">✝ &nbsp; Main</div>
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `nb-mobile-link${isActive ? " active" : ""}`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}

            <div className="nb-mobile-divider" />
            <div className="nb-mobile-section">
              ✦ &nbsp; Sections &amp; More
            </div>

            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `nb-mobile-link${isActive ? " active" : ""}`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}

            <div className="nb-mobile-divider" />
            <button
              className="nb-mobile-logout"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
