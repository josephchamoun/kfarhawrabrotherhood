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

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Primary navigation items (shown directly)
  const primaryNavItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/users", label: "Users", icon: Users },
    { to: "/profile", label: "Profile", icon: Users },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/money", label: "Money", icon: BiDollar },
    { to: "/elections", label: "Elections", icon: VoteIcon },
  ];

  // Secondary navigation items (in "More" dropdown)
  const secondaryNavItems = [
    { to: "/chabiba", label: "Chabiba", icon: Award },
    { to: "/tala2e3", label: "Tala2e3", icon: Sparkles },
    { to: "/forsan", label: "Forsan", icon: Flame },
    { to: "/shops", label: "Shops", icon: ShoppingBag },
    { to: "/contacts", label: "Contacts", icon: Phone },
    { to: "/meetings", label: "Meetings", icon: UserGroupIcon },
    { to: "/driveaccounts", label: "Drive Accounts", icon: MdAccountCircle },
  ];

  // All items for mobile
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20 overflow-hidden">
                <img
                  src={MainLogo}
                  alt="Main Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Brotherhood
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Primary Nav Items */}
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                <Menu className="w-4 h-4" />
                <span>More</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 animate-slide-down">
                  <div className="px-3 py-2 border-b border-slate-700">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      More Options
                    </p>
                  </div>
                  {secondaryNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 mx-2 my-1 rounded-xl text-sm transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group relative ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-700 mt-2 animate-slide-down">
            <div className="mt-4 space-y-1">
              {allNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}
