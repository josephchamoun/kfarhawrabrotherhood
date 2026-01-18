/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaLock,
  FaSave,
  FaUserTag,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    password: "",
  });

  // Fetch user profile
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (cancelled) return;

        const raw = res.data;
        setUser(raw);

        setForm({
          name: raw.name || "",
          email: raw.email || "",
          phone: raw.phone || "",
          date_of_birth: raw.date_of_birth || "",
          password: "",
        });
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Save user profile
  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/users/${id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.data.success) {
        const updatedUser = await api.get(`/users/${id}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setUser(updatedUser.data);
        setForm({
          name: updatedUser.data.name || "",
          email: updatedUser.data.email || "",
          phone: updatedUser.data.phone || "",
          date_of_birth: updatedUser.data.date_of_birth || "",
          password: "",
        });
      } else {
        alert("Failed to save.");
      }
    } catch (error: any) {
      console.error("Save error:", error.response?.data || error);
      if (error.response?.status === 422) {
        alert(JSON.stringify(error.response.data.errors));
      } else if (error.response?.status === 403) {
        alert("Unauthorized: You must be a global admin");
      } else {
        alert("Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaUser className="text-2xl text-blue-600" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  // Prepare roles grouped by section
  const roles = user.section_roles || [];
  const grouped = roles.reduce((acc: any, r: any) => {
    const sectionName = r.section?.name || "Unknown";
    if (!acc[sectionName]) acc[sectionName] = [];
    acc[sectionName].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-12 px-6 overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="profile-pattern"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M30 10 L30 50 M10 30 L50 30"
                  stroke="white"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profile-pattern)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <button
            onClick={() => navigate("/users")}
            className="group flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Users</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-xl">
              <FaUser className="text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {user.name}
              </h1>
              <p className="text-blue-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Edit Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <FaUser />
              Edit Profile
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Name"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="text-blue-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Email"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Phone and Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Phone"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaCalendarAlt className="text-blue-600" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setForm({ ...form, date_of_birth: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 disabled:opacity-50 disabled:bg-gray-50"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="text-blue-600" />
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                disabled={saving}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Roles */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <FaUserTag />
              Section Roles
            </h2>
          </div>

          <div className="p-6">
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserTag className="text-4xl text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  This user has no roles assigned
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(grouped).map((section) => (
                  <div
                    key={section}
                    className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                      <h3 className="font-bold text-blue-700 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <FaUserTag className="text-white text-sm" />
                        </div>
                        {section}
                      </h3>
                    </div>

                    <div className="p-4 space-y-3">
                      {grouped[section].map((r: any) => (
                        <div
                          key={r.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            !r.end_date
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-gray-50 border-2 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {!r.end_date ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaClock className="text-gray-400 text-xl" />
                            )}
                            <div>
                              <p
                                className={`font-semibold ${
                                  !r.end_date
                                    ? "text-green-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {r.role?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {r.start_date} → {r.end_date || "Active"}
                              </p>
                            </div>
                          </div>
                          {!r.end_date && (
                            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
