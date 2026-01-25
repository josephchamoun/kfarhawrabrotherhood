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
  XMarkIcon,
  PhoneIcon,
  CakeIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import type { UserRole } from "../types";

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
const CHABIBA_PRESIDENT = "Chabiba President";
const TALA2E3_PRESIDENT = "Tala2e3 President";
const FORSAN_PRESIDENT = "Forsan President";
const NE2B = "Ne2b al Ra2is";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<{
    step: 0 | 1 | 2;
    userId: number | null;
    userName?: string;
  }>({ step: 0, userId: null });

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");
  const roles: UserRole[] = currentUser.roles || [];

  const isHighAdmin = () => currentUser.is_global_admin === true;

  const canAddSection = () => {
    if (isHighAdmin()) return true;
    return roles.some(
      (r) =>
        (r.role_name === NE2B ||
          r.role_name === CHABIBA_PRESIDENT ||
          r.role_name === TALA2E3_PRESIDENT ||
          r.role_name === FORSAN_PRESIDENT) &&
        r.end_date === null,
    );
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await api.delete(`/user/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirmStep({ step: 0, userId: null });
    } catch (err) {
      console.error(err);
    }
  };

  const allRoles = Array.from(
    new Set(users.flatMap((u) => getActiveRoleNames(u))),
  ).sort();

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

  const filterUsers = (userList: User[]) => {
    return userList.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));

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

      const activeRoles = getActiveRoleNames(user);
      const matchesRole =
        selectedRole === "all" || activeRoles.includes(selectedRole);

      return matchesSearch && matchesSection && matchesRole;
    });
  };

  const globalAdmins = filterUsers(users.filter((u) => u.is_global_admin));
  const otherUsers = filterUsers(users.filter((u) => !u.is_global_admin));

  const renderUser = (u: User, isGlobalAdmin = false) => {
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
        className="bg-white hover:shadow-lg transition-all duration-300 p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 shadow-md">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                  {u.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">{u.email}</p>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-2 ml-0 sm:ml-[60px]">
              {u.phone && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{u.phone}</span>
                </div>
              )}
              {u.date_of_birth && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <CakeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Age: {calculateAge(u.date_of_birth)} years</span>
                </div>
              )}

              {activeSections && activeSections.length > 0 && (
                <div className="flex items-start gap-2 pt-1">
                  <TagIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set(activeSections.map((s) => s.name))).map(
                      (sectionName) => (
                        <span
                          key={sectionName}
                          className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100"
                        >
                          {sectionName}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-col gap-2 justify-end sm:items-end">
            {!u.is_super_admin &&
              (isSuperAdmin || (isGlobalAdmin && !u.is_global_admin)) && (
                <button
                  className="flex-1 sm:flex-none bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  View
                </button>
              )}

            {!isGlobalAdmin && canAddSection() && (
              <button
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                onClick={() => setSelectedUserId(u.id)}
              >
                + Section
              </button>
            )}

            {!u.is_super_admin &&
              (isSuperAdmin || (isGlobalAdmin && !u.is_global_admin)) && (
                <button
                  className="flex-shrink-0 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                  onClick={() =>
                    setDeleteConfirmStep({
                      step: 1,
                      userId: u.id,
                      userName: u.name,
                    })
                  }
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

      {/* Delete Confirmation Modals */}
      {deleteConfirmStep.step === 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Delete User</h2>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
              <p className="text-red-800 font-medium">
                Are you sure you want to delete this user?
              </p>
              <p className="text-red-700 mt-2">
                User:{" "}
                <span className="font-semibold">
                  {deleteConfirmStep.userName}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteConfirmStep({ ...deleteConfirmStep, step: 2 })
                }
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Continue
              </button>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmStep.step === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Final Confirmation
              </h2>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
              <p className="text-red-800 font-bold">
                ⚠️ This action cannot be undone!
              </p>
              <p className="text-red-700 mt-2">
                You are about to permanently delete:
              </p>
              <p className="text-red-700 font-semibold mt-1">
                {deleteConfirmStep.userName}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (deleteConfirmStep.userId) {
                    handleDeleteUser(deleteConfirmStep.userId);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading members...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Members
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage your brotherhood community members
                </p>
              </div>
              {isGlobalAdmin && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  onClick={() => setShowAddUser(true)}
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Member
                </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    showFilters
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filter by Section
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSection("all")}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedSection === "all"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All Members
                      </button>
                      <button
                        onClick={() => setSelectedSection("no-section")}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
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
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                            selectedSection === section
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {section}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filter by Role
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedRole("all")}
                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
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
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
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
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">
                  Showing {globalAdmins.length + otherUsers.length} of{" "}
                  {users.length} members
                </span>
                {(searchQuery ||
                  selectedSection !== "all" ||
                  selectedRole !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSection("all");
                      setSelectedRole("all");
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-left sm:text-center"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="space-y-6">
            {/* Global Admins */}
            {isSuperAdmin && globalAdmins.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👑</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Global Admins
                    </h2>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold inline-block mt-1">
                      {globalAdmins.length} members
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {globalAdmins.map((u) => renderUser(u, true))}
                </div>
              </div>
            )}

            {/* Other Users */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Community Members
                  </h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold inline-block mt-1">
                    {otherUsers.length} members
                  </span>
                </div>
              </div>

              <div className="space-y-3">
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
      )}

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
