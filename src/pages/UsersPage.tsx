import { useEffect, useState } from "react";
import api from "../api/api";
import type { User } from "../types";
import Navbar from "../components/Navbar";
import AddUserModal from "../components/AddUserModal";
import AddToSectionModal from "../components/AddToSectionModal";
import {
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ROLE_MAP: Record<number, string> = {
  2: "Chabiba President",
  3: "Tala2e3 President",
  4: "Forsan President",
  5: "Wakil Risele",
  6: "Wakil E3lem",
  7: "Amin Ser",
  8: "Amin sandou2",
  9: "Ne2b al Ra2is",
  10: "Normal User",
  11: "wakil tanchi2a",
  12: "moustashar",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const navigate = useNavigate();

  const getActiveRoleNames = (user: User): string[] => {
    if (!user.sections) return [];

    return user.sections
      .filter(
        (s): s is typeof s & { pivot: NonNullable<typeof s.pivot> } =>
          !!s.pivot &&
          !!s.pivot.start_date &&
          s.pivot.start_date <= today &&
          (s.pivot.end_date == null || s.pivot.end_date >= today),
      )
      .map((s) => ROLE_MAP[s.pivot.role_id])
      .filter(Boolean);
  };

  const loggedUser: User | null = JSON.parse(
    localStorage.getItem("user_info") || "null",
  );
  const isSuperAdmin = loggedUser?.is_super_admin === true;
  const isGlobalAdmin = loggedUser?.is_global_admin === true;

  const today = new Date().toISOString().split("T")[0];
  const calculateAge = (dob?: Date | string) => {
    if (!dob) return null;

    const birthDate = dob instanceof Date ? dob : new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

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
  const allRoles = Array.from(
    new Set(users.flatMap((u) => getActiveRoleNames(u))),
  ).sort();

  // Get all unique sections from users
  const allSections = Array.from(
    new Set(
      users.flatMap(
        (u) =>
          u.sections
            ?.filter(
              (s) =>
                s.pivot &&
                s.pivot.start_date &&
                s.pivot.start_date <= today &&
                (s.pivot.end_date === null ||
                  s.pivot.end_date === undefined ||
                  s.pivot.end_date >= today),
            )
            .map((s) => s.name) || [],
      ),
    ),
  ).sort();

  // Filter users based on search and section
  const filterUsers = (userList: User[]) => {
    return userList.filter((user) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));

      // Section filter (UNCHANGED)
      const matchesSection =
        selectedSection === "all" || selectedSection === "no-section"
          ? selectedSection === "no-section"
            ? !user.sections?.some(
                (s) =>
                  s.pivot &&
                  s.pivot.start_date &&
                  s.pivot.start_date <= today &&
                  (s.pivot.end_date === null ||
                    s.pivot.end_date === undefined ||
                    s.pivot.end_date >= today),
              )
            : true
          : user.sections?.some(
              (s) =>
                s.name === selectedSection &&
                s.pivot &&
                s.pivot.start_date &&
                s.pivot.start_date <= today &&
                (s.pivot.end_date === null ||
                  s.pivot.end_date === undefined ||
                  s.pivot.end_date >= today),
            );

      // ⭐ ROLE FILTER
      const activeRoles = getActiveRoleNames(user);
      const matchesRole =
        selectedRole === "all" || activeRoles.includes(selectedRole);

      return matchesSearch && matchesSection && matchesRole;
    });
  };

  const globalAdmins = filterUsers(users.filter((u) => u.is_global_admin));
  const otherUsers = filterUsers(users.filter((u) => !u.is_global_admin));

  const renderUser = (u: User, isAdmin = false) => {
    const activeSections = u.sections?.filter(
      (s) =>
        s.pivot &&
        s.pivot.start_date &&
        s.pivot.start_date <= today &&
        (s.pivot.end_date === null ||
          s.pivot.end_date === undefined ||
          s.pivot.end_date >= today),
    );

    return (
      <div
        key={u.id}
        className="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-blue-200"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
            </div>
            {u.phone && (
              <p className="text-xs text-gray-500 ml-12 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {u.phone}
              </p>
            )}
            {u.date_of_birth && (
              <p className="text-xs text-gray-500 ml-12">
                Age: {calculateAge(u.date_of_birth)} years
              </p>
            )}

            {activeSections && activeSections.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 ml-12">
                {Array.from(new Set(activeSections.map((s) => s.name))).map(
                  (sectionName) => (
                    <span
                      key={sectionName}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium"
                    >
                      {sectionName}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isAdmin && (
              <>
                <button
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm"
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  View
                </button>

                <button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-sm"
                  onClick={() => setSelectedUserId(u.id)}
                >
                  + Section
                </button>
              </>
            )}

            {!u.is_super_admin &&
              (isSuperAdmin || (isGlobalAdmin && !u.is_global_admin)) && (
                <button
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                  onClick={() => handleDeleteUser(u.id)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Members</h1>
              <p className="text-gray-600">
                Manage your brotherhood community members
              </p>
            </div>
            {isGlobalAdmin && (
              <button
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={() => setShowAddUser(true)}
              >
                <PlusIcon className="w-5 h-5" />
                Add Member
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Section
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSection("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSection === "all"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Members
                  </button>
                  <button
                    onClick={() => setSelectedSection("no-section")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSection === "no-section"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    No Section
                  </button>
                  {allSections.map((section) => (
                    <button
                      key={section}
                      onClick={() => setSelectedSection(section)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSection === section
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
                {/* Role Filter */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filter by Role
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedRole("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedRole === "all"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Roles
                    </button>

                    {allRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedRole === role
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">
                Showing {globalAdmins.length + otherUsers.length} of{" "}
                {users.length} members
              </span>
              {(searchQuery || selectedSection !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSection("all");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div
          className={`grid grid-cols-1 gap-6 ${
            isSuperAdmin ? "lg:grid-cols-3" : "lg:grid-cols-1"
          }`}
        >
          {/* Global Admins */}
          {isSuperAdmin && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Global Admins
                  </h2>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                    {globalAdmins.length} members
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {globalAdmins.length ? (
                  globalAdmins.map((u) => renderUser(u, true))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-gray-400 text-sm">No admins found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Users */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Community Members
                </h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  {otherUsers.length} members
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              {otherUsers.length ? (
                otherUsers.map((u) => renderUser(u))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-gray-500 font-medium mb-1">
                    No members found
                  </p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
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
          isSuperAdmin={isSuperAdmin}
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
