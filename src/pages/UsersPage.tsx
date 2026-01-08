import { useEffect, useState } from "react";
import api from "../api/api";
import type { User } from "../types";
import Navbar from "../components/Navbar";
import AddUserModal from "../components/AddUserModal";
import AddToSectionModal from "../components/AddToSectionModal";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const loggedUser: User | null = JSON.parse(
    localStorage.getItem("user_info") || "null"
  );
  const isGlobalAdmin = loggedUser?.is_global_admin === true;

  const fetchUsers = () => {
    api
      .get("/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setUsers(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    await api.delete(`/user/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const globalAdmins = users.filter((u) => u.is_global_admin);
  const otherUsers = users.filter((u) => !u.is_global_admin);

  const renderUser = (u: User, isAdmin = false) => (
    <div
      key={u.id}
      className="bg-gray-50 hover:bg-gray-100 transition p-3 rounded-lg
                 shadow-sm flex justify-between items-center"
    >
      <div>
        <p className="font-medium">{u.name}</p>
        <p className="text-sm text-gray-600">{u.email}</p>
        {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}

        {/* Display sections */}
        {u.sections && u.sections.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Sections: {u.sections.map((s) => s.name).join(", ")}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {/* Delete button (only global admins can delete other users) */}
        {!isAdmin && isGlobalAdmin && (
          <button
            className="text-red-600 hover:text-red-800 flex items-center gap-1"
            onClick={() => handleDeleteUser(u.id)}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}

        {/* Add to Section button */}
        {!isAdmin && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
            onClick={() => setSelectedUserId(u.id)}
          >
            Add to Section
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Users</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Global Admins */}
          <div className="bg-white p-4 rounded-xl shadow border md:col-span-1">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              👑 Global Admins
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                {globalAdmins.length}
              </span>
            </h2>

            <div className="space-y-2">
              {globalAdmins.length ? (
                globalAdmins.map((u) => renderUser(u, true))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  No global admins
                </p>
              )}
            </div>
          </div>

          {/* Other Users */}
          <div className="bg-white p-4 rounded-xl shadow border md:col-span-2">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                👥 Other Users
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {otherUsers.length}
                </span>
              </h2>

              {isGlobalAdmin && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  onClick={() => setShowAddUser(true)}
                >
                  <PlusIcon className="w-4 h-4" />
                  Add User
                </button>
              )}
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-2">
              {otherUsers.length ? (
                otherUsers.map((u) => renderUser(u))
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">
                  No users
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && isGlobalAdmin && (
        <AddUserModal
          open={showAddUser}
          onClose={() => setShowAddUser(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setShowAddUser(false);
          }}
        />
      )}

      {/* Add to Section Modal */}
      {selectedUserId && (
        <AddToSectionModal
          userId={selectedUserId}
          userSections={
            users.find((u) => u.id === selectedUserId)?.sections || []
          }
          onClose={() => setSelectedUserId(null)}
          onSuccess={() => {
            setSelectedUserId(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
