/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar"; // <-- import Navbar

export default function MyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // fetch loading
  const [saving, setSaving] = useState(false); // save loading
  const [form, setForm] = useState({ email: "", password: "" });

  // Fetch user's profile
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

  // Save email/password
  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put("/myprofile", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      alert("Saved successfully!");
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

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add Navbar here */}
      <Navbar />

      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="bg-white p-4 rounded shadow grid gap-4">
          {/* Name (read-only) */}
          <div>
            <label className="block mb-1 font-medium">Name:</label>
            <input
              value={user.name}
              disabled
              className="border p-2 w-full rounded bg-gray-100"
            />
          </div>

          {/* Phone (read-only) */}
          <div>
            <label className="block mb-1 font-medium">Phone:</label>
            <input
              value={user.phone || ""}
              disabled
              className="border p-2 w-full rounded bg-gray-100"
            />
          </div>

          {/* Email (editable) */}
          <div>
            <label className="block mb-1 font-medium">Email:</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border p-2 w-full rounded"
              disabled={saving}
            />
          </div>

          {/* Password (editable) */}
          <div>
            <label className="block mb-1 font-medium">New Password:</label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border p-2 w-full rounded"
              disabled={saving}
            />
          </div>

          {/* Save button */}
          <button
            onClick={save}
            disabled={saving}
            className={`bg-blue-600 text-white py-2 rounded ${
              saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Roles & Sections */}
        <h2 className="mt-6 font-bold text-lg">Roles & Sections</h2>
        {user.section_roles && user.section_roles.length > 0 ? (
          user.section_roles.map((r: any) => (
            <div key={r.id} className="p-2 bg-white rounded shadow mb-2">
              <strong>{r.section?.name}</strong> - {r.role?.name} (
              {r.start_date} → {r.end_date || "Active"})
            </div>
          ))
        ) : (
          <p>No roles assigned.</p>
        )}
      </div>
    </div>
  );
}
