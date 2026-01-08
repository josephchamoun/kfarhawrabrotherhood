import { useEffect, useState } from "react";
import api from "../api/api";
import type { User, Role } from "../types";
import Navbar from "../components/Navbar";
import { TrashIcon } from "@heroicons/react/24/outline";

const FORSAN_SECTION_ID = 3;

// Roles allowed in Forsan
const ALL_ROLES: Role[] = [
  { id: 1, name: "Forsan President" },
  { id: 2, name: "wakil tanchi2a" },
  { id: 3, name: "moustashar" },
  { id: 7, name: "Wakil Risele" },
  { id: 8, name: "Wakil E3lem" },
  { id: 9, name: "Amin Ser" },
  { id: 10, name: "Amin sandou2" },
  { id: 11, name: "Ne2b al Ra2is" },
];

export default function ForsanPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [roles] = useState<Role[]>(ALL_ROLES);
  const [isLoading, setIsLoading] = useState(false);

  const loggedInUser: User | null = JSON.parse(
    localStorage.getItem("user_info") || "null"
  );
  const isAdmin = loggedInUser?.is_global_admin;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/forsan-role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/user/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  // Assign role
  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      setLoadingUserId(userId);
      await api.post(
        "/forsan/assign-role",
        {
          user_id: userId,
          section_id: FORSAN_SECTION_ID,
          role_id: roleId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to assign role.");
    } finally {
      setLoadingUserId(null);
    }
  };

  // Remove role
  const handleRemoveRole = async (userId: number) => {
    try {
      setLoadingUserId(userId);
      await api.post(
        "/forsan/remove-role",
        { user_id: userId, section_id: FORSAN_SECTION_ID },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to remove role.");
    } finally {
      setLoadingUserId(null);
    }
  };

  // Compute which roles are already assigned in Chabiba
  const assignedRoleIds = users
    .map(
      (u) => u.sections?.find((s) => s.id === FORSAN_SECTION_ID)?.pivot?.role_id
    )
    .filter(Boolean) as number[];

  const renderUser = (u: User) => {
    const forsanSection = u.sections?.find((s) => s.id === FORSAN_SECTION_ID);
    const currentRoleId = forsanSection?.pivot?.role_id;
    const currentRoleName =
      roles.find((r) => r.id === currentRoleId)?.name || "No role";

    // Roles available to assign (exclude already assigned except current)
    const availableRoles = roles.filter(
      (r) => !assignedRoleIds.includes(r.id) || r.id === currentRoleId
    );

    return (
      <div
        key={u.id}
        className="group bg-white border border-gray-200 p-4 rounded-lg mb-3
                   shadow-sm hover:shadow-md hover:border-blue-200 transition flex justify-between items-center"
      >
        <div>
          <p className="font-semibold text-gray-800">{u.name}</p>
          <p className="text-sm text-gray-500">{currentRoleName}</p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteUser(u.id)}
              title="Delete user"
              disabled={loadingUserId === u.id}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}

          {isAdmin && (
            <>
              {currentRoleId ? (
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  onClick={() => handleRemoveRole(u.id)}
                  disabled={loadingUserId === u.id}
                >
                  Remove Role
                </button>
              ) : (
                <select
                  className="border px-2 py-1 rounded text-sm"
                  value=""
                  onChange={(e) =>
                    handleAssignRole(u.id, Number(e.target.value))
                  }
                  disabled={loadingUserId === u.id}
                >
                  <option value="" disabled>
                    Assign Role
                  </option>
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Forsan <span className="text-gray-400 text-2xl">فرسان</span>
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">Members</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : (
            <div>
              {users.length ? (
                users.map(renderUser)
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">
                  No users in Forsan
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
