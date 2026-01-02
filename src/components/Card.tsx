// ...existing code...
import { useEffect, useState } from "react";
import api from "../api/api"; // axios instance
import type { Role } from "../types";

export default function AddUserCard({
  section_id,
  createdBy,
  onSuccess,
}: {
  section_id?: number | null;
  createdBy: number | string;
  onSuccess?: () => void;
}) {
  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    section_id: section_id ?? "",
    created_by: createdBy,
  });

  useEffect(() => {
    const fetchRoles = async () => {
      const access_token = localStorage.getItem("access_token");

      const rolesRes = await api.get("/roles", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setRoles(rolesRes.data);
    };

    fetchRoles();
  }, []);

  // keep form in sync if parent passes a different section_id or createdBy
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      section_id: section_id ?? "",
      created_by: createdBy,
    }));
  }, [section_id, createdBy]);

  const handleChange = (e: { target: { name: unknown; value: unknown } }) => {
    setFormData({
      ...formData,
      [e.target.name as string]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    await api.post("/adduser", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    alert("User created!");
    onSuccess?.();
  };

  return (
    <div className="max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Add User</h2>

      <input
        name="name"
        placeholder="Name"
        className="w-full border p-2 rounded"
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        onChange={handleChange}
      />

      {/* Role dropdown */}
      <select
        name="role_id"
        className="w-full border p-2 rounded"
        onChange={handleChange}
      >
        <option value="">Select Role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Create User
      </button>
    </div>
  );
}
