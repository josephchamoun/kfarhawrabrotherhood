/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import api from "../api/api";

import type { User } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
  isSuperAdmin: boolean;
}

export default function AddUserModal({
  open,
  onClose,
  onCreated,
  isSuperAdmin,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    is_global_admin: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await api.post("/adduser", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      onCreated({
        ...res.data,
        sections: [],
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Add User</h2>

        <input
          name="name"
          placeholder="Name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="phone"
          type="text"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        {isSuperAdmin && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_global_admin"
              checked={form.is_global_admin}
              onChange={handleChange}
            />
            Make Global Admin
          </label>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-gray-500">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded
    text-white transition
    ${
      isSubmitting
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
