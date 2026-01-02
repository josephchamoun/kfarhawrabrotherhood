import { useEffect, useState } from "react";
import api from "../api/api";
import type { User } from "../types";
import Navbar from "../components/Navbar";
import AddUserCard from "../components/Card";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user_info") || "{}");

  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );

  useEffect(() => {
    api.get("/users").then((res) => setUsers(res.data));
  }, []);

  // Filter by section
  const chabibaUsers = users
    .filter((u) => u.section?.name === "Chabiba")
    .sort((a) => (a.role?.name?.toLowerCase().includes("president") ? -1 : 1));

  const talaeeUsers = users
    .filter((u) => u.section?.name === "Talaee")
    .sort((a) => (a.role?.name?.toLowerCase().includes("president") ? -1 : 1));

  const forsanUsers = users
    .filter((u) => u.section?.name === "Forsan")
    .sort((a) => (a.role?.name?.toLowerCase().includes("president") ? -1 : 1));

  const renderUser = (u: User) => (
    <div
      key={u.id}
      className="bg-gray-50 p-3 rounded mb-2 shadow-sm flex flex-col"
    >
      <p className="font-medium">{u.name}</p>
      <p className="text-sm text-gray-600">{u.role?.name ?? "No role"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-6 text-center">Users</h1>

        {/* Grid of sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chabiba */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">
                Chabiba <span className="text-gray-500">(شبيبة)</span>
              </h2>
              {(loggedInUser?.role_id === 1 || loggedInUser?.role_id === 2) && (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    setSelectedSectionId(1); // Chabiba section ID
                    setShowAddUser(true);
                  }}
                >
                  + Add
                </button>
              )}
            </div>
            <div>{chabibaUsers.map(renderUser)}</div>
          </div>

          {/* Talaee */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">
                Talaee <span className="text-gray-500">(طلائع)</span>
              </h2>
              {(loggedInUser?.role_id === 3 || loggedInUser?.role_id === 1) && (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    setSelectedSectionId(2); // Talaee section ID
                    setShowAddUser(true);
                  }}
                >
                  + Add
                </button>
              )}
            </div>

            <div>{talaeeUsers.map(renderUser)}</div>
          </div>

          {/* Forsan */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">
                Forsan <span className="text-gray-500">(فرسان)</span>
              </h2>
              {(loggedInUser?.role_id === 4 || loggedInUser?.role_id === 1) && (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    setSelectedSectionId(3); // Forsan section ID
                    setShowAddUser(true);
                  }}
                >
                  + Add
                </button>
              )}
            </div>
            <div>{forsanUsers.map(renderUser)}</div>
          </div>

          {showAddUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="relative">
                <button
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7"
                  onClick={() => setShowAddUser(false)}
                >
                  ✕
                </button>

                <AddUserCard
                  createdBy={loggedInUser.id}
                  section_id={selectedSectionId}
                  onSuccess={() => {
                    setShowAddUser(false);
                    api.get("/users").then((res) => setUsers(res.data));
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
