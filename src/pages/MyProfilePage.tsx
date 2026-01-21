/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function MyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/myprofile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setUser(res.data);
        setForm({
          email: res.data.email,
          password: "",
        });
      } catch (error: any) {
        if (error.response?.status === 403) {
          alert("Unauthorized to view this profile.");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put("/myprofile", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setUser(res.data.user);
      setForm({ email: res.data.user.email, password: "" });
    } catch (error: any) {
      console.error(error.response?.data || error);
      if (error.response?.status === 422) {
        alert(JSON.stringify(error.response.data.errors));
      } else {
        alert("Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card Loading */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto mb-4 animate-pulse"></div>
                <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Account Settings & Roles Loading */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Account Settings
                  </h3>
                </div>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-5 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  ))}
                  <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Roles & Sections
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your active roles in the brotherhood
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5"
                    >
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                {/* Avatar */}
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h2>

                {/* Admin Badges */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {user.is_super_admin && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Super Admin
                    </span>
                  )}
                  {user.is_global_admin && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Global Admin
                    </span>
                  )}
                  {!user.is_super_admin && !user.is_global_admin && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      <UserCircleIcon className="w-4 h-4" />
                      Member
                    </span>
                  )}
                </div>

                {/* Contact Info Display */}
                <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {user.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings & Roles */}
            <div className="lg:col-span-2 space-y-6">
              {/* Edit Account Information */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Account Settings
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Name (read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserCircleIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        value={user.name}
                        disabled
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Contact an admin to change your name
                    </p>
                  </div>

                  {/* Phone (read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        value={user.phone || "Not provided"}
                        disabled
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Contact an admin to change your phone number
                    </p>
                  </div>

                  {/* Email (editable) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Password (editable) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        disabled={saving}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if you don't want to change your password
                    </p>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Roles & Sections */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Roles & Sections
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your active roles in the brotherhood
                    </p>
                  </div>
                </div>

                {user.section_roles && user.section_roles.length > 0 ? (
                  <div className="space-y-3">
                    {user.section_roles.map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-gray-900">
                                {r.section?.name}
                              </span>
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {r.role?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <span>Start: {r.start_date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                  End:{" "}
                                  {r.end_date || (
                                    <span className="text-green-600 font-semibold">
                                      Active
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!r.end_date && (
                            <div className="ml-4">
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Active
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">
                      No roles assigned yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Contact an admin to get assigned to sections
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
