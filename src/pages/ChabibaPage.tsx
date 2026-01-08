import { useEffect, useState } from "react";
import api from "../api/api";
import type { User, Role } from "../types";
import Navbar from "../components/Navbar";

const CHABIBA_SECTION_ID = 1;
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

  const loggedInUser = JSON.parse(localStorage.getItem("user_info") || "null");
  const isAdmin = loggedInUser?.is_global_admin;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chabiba-role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const takenRoleIds = users
    .map(
      (u) =>
        u.sections?.find((s) => s.id === CHABIBA_SECTION_ID)?.pivot?.role_id
    )
    .filter((id) => id && id !== NORMAL_ROLE_ID);

  const assignRole = async (userId: number, roleId: number) => {
    try {
      setAssigningUserId(userId);

      await api.post(
        "/chabiba/assign-role",
        {
          user_id: userId,
          section_id: CHABIBA_SECTION_ID,
          role_id: roleId,
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

  const removeRole = async (userId: number) => {
    try {
      setAssigningUserId(userId);

      await api.post(
        "/chabiba/remove-role",
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

  // 🚧 BACKEND LATER
  const removeFromSection = async (userId: number) => {
    alert(`Remove user ${userId} from section (backend later)`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Chabiba <span className="text-gray-400">شبيبة</span>
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold mb-4">Members</h2>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            users.map((user) => {
              const section = user.sections?.find(
                (s) => s.id === CHABIBA_SECTION_ID
              );

              const roleId = section?.pivot?.role_id ?? NORMAL_ROLE_ID;

              const roleName =
                ROLES.find((r) => r.id === roleId)?.name || "Normal Member";

              const isAssigning = assigningUserId === user.id;

              return (
                <div
                  key={user.id}
                  className="border p-4 mb-2 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{roleName}</p>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-3 items-center">
                      {isAssigning ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : roleId === NORMAL_ROLE_ID ? (
                        <select
                          disabled={assigningUserId !== null}
                          className="border px-2 py-1 rounded text-sm"
                          defaultValue=""
                          onChange={(e) =>
                            assignRole(user.id, Number(e.target.value))
                          }
                        >
                          <option value="" disabled>
                            Assign Role
                          </option>
                          {ROLES.filter(
                            (r) => !takenRoleIds.includes(r.id)
                          ).map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          disabled={assigningUserId !== null}
                          onClick={() => removeRole(user.id)}
                          className="text-red-500 text-sm hover:underline disabled:opacity-50"
                        >
                          Remove Role
                        </button>
                      )}

                      <button
                        disabled={assigningUserId !== null}
                        onClick={() => removeFromSection(user.id)}
                        className="text-gray-500 text-sm hover:underline disabled:opacity-50"
                      >
                        Remove from Section
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
