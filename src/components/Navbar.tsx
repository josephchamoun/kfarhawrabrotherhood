import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // 1️⃣ Remove token
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");

    // 2️⃣ Redirect to login
    navigate("/login");
  };
  return (
    <nav className="bg-slate-800 text-white px-6 py-4 flex gap-6 shadow">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "text-blue-400 font-semibold" : "hover:text-blue-300"
        }
      >
        Home
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          isActive ? "text-blue-400 font-semibold" : "hover:text-blue-300"
        }
      >
        Users
      </NavLink>

      <NavLink to="/events" className="hover:text-blue-300">
        Events
      </NavLink>

      <NavLink to="/shops" className="hover:text-blue-300">
        Shops
      </NavLink>
      {/* Logout link */}
      <button
        onClick={handleLogout}
        className="ml-auto hover:text-red-400 font-medium"
      >
        Logout
      </button>
    </nav>
  );
}
