/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate("/users")}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Users
        </button>

        <h1 className="text-2xl font-bold mb-4">{user.name}</h1>

        {/* Edit Box */}
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            placeholder="Name"
            disabled={saving}
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded"
            placeholder="Email"
            disabled={saving}
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 rounded"
            placeholder="Phone"
            disabled={saving}
          />
          <input
            placeholder="New Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded"
            disabled={saving}
          />

          <button
            onClick={save}
            className={`bg-blue-600 text-white py-2 col-span-2 rounded flex justify-center items-center ${
              saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={saving}
          >
            {saving ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              "Save"
            )}
          </button>
        </div>

        {/* Section Roles */}
        <h2 className="font-bold text-lg mb-2">Section Roles</h2>

        {Object.keys(grouped).length === 0 ? (
          <p className="text-gray-500">This user has no roles.</p>
        ) : (
          Object.keys(grouped).map((section) => (
            <div key={section} className="bg-white mb-4 p-3 rounded shadow">
              <h3 className="font-semibold text-blue-700">{section}</h3>

              {grouped[section].map((r: any) => (
                <div
                  key={r.id}
                  className={`text-sm p-1 ${
                    !r.end_date ? "text-green-600 font-bold" : "text-gray-700"
                  }`}
                >
                  {r.role?.name} | {r.start_date} → {r.end_date || "Active"}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
