import { useEffect, useState } from "react";
import api from "../api/api";
import type { User, Role, ChabibaRole } from "../types";
import Navbar from "../components/Navbar";

const NORMAL_ROLE_ID = 10;

const ROLES: Role[] = [
  { id: 2, name: "Chabiba President" },
  { id: 11, name: "Wakil Tanchi2a" },
  { id: 12, name: "Moustashar" },
  { id: 5, name: "Wakil Risele" },
  { id: 6, name: "Wakil E3lem" },
  { id: 7, name: "Amin Ser" },
  { id: 8, name: "Amin Sandou2" },
  { id: 9, name: "Ne2b Al Ra2is" },
];

export default function ChabibaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user_info") || "null");
  const isAdmin = loggedInUser?.is_global_admin;
  const CHABIBA_SECTION_ID = 1;

  /* ============================
     Fetch users
  ============================ */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chabiba-role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      // Combine active and inactive users
      setUsers(res.data.active_users.concat(res.data.inactive_users));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ============================
     Helpers
  ============================ */
  const roleName = (roleId?: number) =>
    ROLES.find((r) => r.id === roleId)?.name || "Normal Member";

  const getActiveRoles = (user: User): ChabibaRole[] =>
    user.chabiba_roles?.filter((r) => r.end_date === null) || [];

  const getPastRoles = (user: User): ChabibaRole[] =>
    user.chabiba_roles?.filter((r) => r.end_date !== null) || [];

  const isActiveUser = (user: User) => getActiveRoles(user).length > 0;

  /* ============================
     Search
  ============================ */
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeUsers = filteredUsers.filter(isActiveUser);
  const inactiveUsers = filteredUsers.filter((u) => !isActiveUser(u));

  /* ============================
     Taken roles (active only)
  ============================ */
  const takenRoleIds = activeUsers
    .flatMap((u) => getActiveRoles(u).map((r) => r.role_id))
    .filter((id) => id && id !== NORMAL_ROLE_ID);

  /* ============================
     Actions
  ============================ */
  const assignRole = async (userId: number, roleId: number) => {
    try {
      setAssigningUserId(userId);
      await api.post(
        "/chabiba/assign-role",
        { user_id: userId, section_id: CHABIBA_SECTION_ID, role_id: roleId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const endRole = async (userId: number, roleId: number) => {
    try {
      setAssigningUserId(userId);
      await api.post(
        "/chabiba/end-role",
        { user_id: userId, role_id: roleId }, // ✅ explicitly assign
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const activateUser = async (userId: number) => {
    try {
      setAssigningUserId(userId);
      await api.post(
        "/chabiba/activate-user",
        {
          user_id: userId,
          section_id: CHABIBA_SECTION_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const inactivateUser = async (userId: number) => {
    try {
      setAssigningUserId(userId);
      await api.post(
        "/chabiba/inactivate-user",
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  /* ============================
     Render user row
  ============================ */
  const renderUser = (user: User, active: boolean) => {
    const activeRoles = getActiveRoles(user);
    const pastRoles = getPastRoles(user);

    return (
      <div
        key={user.id}
        className="border p-4 mb-2 rounded flex justify-between"
      >
        <div>
          <p className="font-semibold">{user.name}</p>

          {/* Active roles */}
          {activeRoles.map((r) => (
            <p key={r.id} className="text-sm text-gray-500">
              {roleName(r.role_id)} — {r.start_date} → {r.end_date ?? "Present"}
            </p>
          ))}

          {/* Past roles */}
          {pastRoles.length > 0 && (
            <ul className="text-xs text-gray-400 mt-2">
              {pastRoles.map((r) => (
                <li key={r.id}>
                  {roleName(r.role_id)} ({r.start_date} → {r.end_date})
                </li>
              ))}
            </ul>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-3 items-center">
            {assigningUserId === user.id ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {/* Assign Role */}
                <select
                  className="border px-2 py-1 rounded text-sm"
                  onChange={(e) => assignRole(user.id, Number(e.target.value))}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Assign Role
                  </option>
                  {ROLES.filter((r) => !takenRoleIds.includes(r.id)).map(
                    (r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    )
                  )}
                </select>

                {/* End Active Roles */}
                {activeRoles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => endRole(user.id, r.role_id)}
                    className="text-red-500 text-sm"
                  >
                    End {roleName(r.role_id)}
                  </button>
                ))}

                {/* Activate / Inactivate */}
                {active ? (
                  <button
                    onClick={() => inactivateUser(user.id)}
                    className="text-gray-500 text-sm"
                  >
                    Inactivate
                  </button>
                ) : (
                  <button
                    onClick={() => activateUser(user.id)}
                    className="text-green-600 text-sm"
                  >
                    Activate Again
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ============================
     Render Page
  ============================ */
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Chabiba</h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full mb-6 rounded"
          placeholder="Search users..."
        />

        {/* Active Members */}
        <h2 className="font-bold mb-2">Active Members</h2>
        {loading ? (
          <p>Loading...</p>
        ) : activeUsers.length === 0 ? (
          <p className="text-gray-500">No active users</p>
        ) : (
          activeUsers.map((u) => renderUser(u, true))
        )}

        {/* Inactive Members */}
        <h2 className="font-bold mt-8 mb-2 text-gray-500">Inactive Members</h2>
        {loading ? (
          <p>Loading...</p>
        ) : inactiveUsers.length === 0 ? (
          <p className="text-gray-500">No inactive users</p>
        ) : (
          inactiveUsers.map((u) => renderUser(u, false))
        )}
      </div>
    </div>
  );
}
