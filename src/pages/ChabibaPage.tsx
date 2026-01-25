/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  UserPlus,
  UserMinus,
  Calendar,
  Crown,
  Award,
  Heart,
  Loader2,
  X,
} from "lucide-react";
import api from "../api/api";
import type { User, Role, ChabibaRole } from "../types";
import Navbar from "../components/Navbar";
import chabibaLogo from "../assets/chabibe.jpeg";

const NORMAL_ROLE_ID = 10;

const ROLES: Role[] = [
  { id: 2, name: "Chabiba President", nameAr: "رئيس الشبيبة" },
  { id: 11, name: "Wakil Tanchi2a", nameAr: "وكيل تنشئة" },
  { id: 12, name: "Moustashar", nameAr: "مستشار" },
  { id: 5, name: "Wakil Risele", nameAr: "وكيل رسالة" },
  { id: 6, name: "Wakil E3lem", nameAr: "وكيل إعلام" },
  { id: 7, name: "Amin Ser", nameAr: "أمين سر" },
  { id: 8, name: "Amin Sandou2", nameAr: "أمين صندوق" },
  { id: 9, name: "Ne2b Al Ra2is", nameAr: "نائب الرئيس" },
];

export default function ChabibaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());
  const [showRoleModal, setShowRoleModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: "assign" | "end" | "activate" | "inactivate" | null;
    userId: number | null;
    roleId?: number;
    userName?: string;
  }>({ show: false, type: null, userId: null });
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<{
    step: 0 | 1 | 2;
    userId: number | null;
    userName?: string;
  }>({ step: 0, userId: null });

  const loggedInUser = JSON.parse(localStorage.getItem("user_info") || "null");

  const CHABIBA_SECTION_ID = 1;

  const hasActiveNonNormalRole = (user: User) =>
    getActiveRoles(user).some((r) => r.role_id !== NORMAL_ROLE_ID);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chabiba-role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(res.data.active_users.concat(res.data.inactive_users));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleName = (roleId?: number) => {
    const role = ROLES.find((r) => r.id === roleId);
    return role
      ? { name: role.name, nameAr: role.nameAr }
      : { name: "Normal Member", nameAr: "عضو عادي" };
  };
  const isChabibaPresident = () => {
    return (
      loggedInUser?.roles?.some(
        (r: any) => r.role_id === 2 && r.section_id === CHABIBA_SECTION_ID,
      ) || loggedInUser?.is_global_admin
    );
  };

  const canManage = isChabibaPresident();

  const getActiveRoles = (user: User): ChabibaRole[] =>
    user.chabiba_roles?.filter((r) => r.end_date === null) || [];

  const getPastRoles = (user: User): ChabibaRole[] =>
    user.chabiba_roles?.filter((r) => r.end_date !== null) || [];

  const isActiveUser = (user: User) => getActiveRoles(user).length > 0;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const activeUsers = filteredUsers.filter(isActiveUser);
  const inactiveUsers = filteredUsers.filter((u) => !isActiveUser(u));

  const takenRoleIds = activeUsers
    .flatMap((u) => getActiveRoles(u).map((r) => r.role_id))
    .filter((id) => id && id !== NORMAL_ROLE_ID);

  const assignRole = async (userId: number, roleId: number) => {
    try {
      setAssigningUserId(userId);
      setConfirmModal({ show: false, type: null, userId: null });
      setShowRoleModal(null);
      await api.post(
        "/chabiba/assign-role",
        { user_id: userId, section_id: CHABIBA_SECTION_ID, role_id: roleId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const endRole = async (userId: number) => {
    try {
      setAssigningUserId(userId);
      setDeleteConfirmStep({ step: 0, userId: null });
      await api.post(
        "/chabiba/end-role",
        {
          user_id: userId,
          section_id: CHABIBA_SECTION_ID,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const activateUser = async (userId: number) => {
    try {
      setAssigningUserId(userId);
      setConfirmModal({ show: false, type: null, userId: null });
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
        },
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const inactivateUser = async (userId: number) => {
    try {
      setAssigningUserId(userId);
      setConfirmModal({ show: false, type: null, userId: null });
      await api.post(
        "/chabiba/inactivate-user",
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      fetchUsers();
    } finally {
      setAssigningUserId(null);
    }
  };

  const toggleExpanded = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const renderUser = (user: User, active: boolean) => {
    const activeRoles = getActiveRoles(user);
    const pastRoles = getPastRoles(user);
    const isExpanded = expandedUsers.has(user.id);
    const hasPastRoles = pastRoles.length > 0;
    const availableRoles = ROLES.filter((r) => !takenRoleIds.includes(r.id));

    return (
      <div
        key={user.id}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-visible"
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {user.name}
                  </h3>
                  {!active && (
                    <span className="text-xs text-gray-400 font-medium">
                      Inactive Member
                    </span>
                  )}
                </div>
              </div>

              {activeRoles.map((r) => {
                const role = roleName(r.role_id);
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 sm:gap-3 mb-2"
                  >
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-3 sm:px-4 py-2 rounded-lg border border-yellow-100 w-full">
                      {r.role_id === 2 ? (
                        <Crown className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <Award className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {role.name}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            •
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            {role.nameAr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {r.start_date} → Present
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasPastRoles && (
                <button
                  onClick={() => toggleExpanded(user.id)}
                  className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Past Roles
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Past Roles ({pastRoles.length})
                    </>
                  )}
                </button>
              )}

              {isExpanded && hasPastRoles && (
                <div className="mt-4 space-y-2 pl-4 border-l-2 border-gray-200">
                  {pastRoles.map((r) => {
                    const role = roleName(r.role_id);
                    return (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span className="font-medium">{role.name}</span>
                        <span>•</span>
                        <span className="font-medium">{role.nameAr}</span>
                        <span className="text-gray-400">
                          ({r.start_date} → {r.end_date})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {canManage && (
              <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
                {assigningUserId === user.id ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowRoleModal(
                            showRoleModal === user.id ? null : user.id,
                          )
                        }
                        disabled={assigningUserId !== null}
                        className="w-full sm:w-auto border-2 border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all cursor-pointer bg-white flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>✨ Assign Role</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {showRoleModal === user.id &&
                        availableRoles.length > 0 && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowRoleModal(null)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-20 max-h-96 overflow-y-auto">
                              <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  Select a Role
                                </p>
                              </div>
                              {availableRoles.map((role) => (
                                <button
                                  key={role.id}
                                  onClick={() =>
                                    setConfirmModal({
                                      show: true,
                                      type: "assign",
                                      userId: user.id,
                                      roleId: role.id,
                                      userName: user.name,
                                    })
                                  }
                                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                                      <Award className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate">
                                        {role.name}
                                      </p>
                                      <p className="text-xs text-gray-600 truncate">
                                        {role.nameAr}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {hasActiveNonNormalRole(user) && (
                        <button
                          onClick={() =>
                            setDeleteConfirmStep({
                              step: 1,
                              userId: user.id,
                              userName: user.name,
                            })
                          }
                          disabled={assigningUserId !== null}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserMinus className="w-4 h-4" />
                          End Role
                        </button>
                      )}

                      {active ? (
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              type: "inactivate",
                              userId: user.id,
                              userName: user.name,
                            })
                          }
                          disabled={assigningUserId !== null}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserMinus className="w-4 h-4" />
                          Inactivate
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              type: "activate",
                              userId: user.id,
                              userName: user.name,
                            })
                          }
                          disabled={assigningUserId !== null}
                          className="flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserPlus className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-amber-50">
      <Navbar />

      {assigningUserId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto" />
            <p className="mt-4 text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Action
              </h2>
              <button
                onClick={() =>
                  setConfirmModal({ show: false, type: null, userId: null })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                {confirmModal.type === "assign" &&
                  `Are you sure you want to assign the role to ${confirmModal.userName}?`}
                {confirmModal.type === "activate" &&
                  `Are you sure you want to activate ${confirmModal.userName}?`}
                {confirmModal.type === "inactivate" &&
                  `Are you sure you want to inactivate ${confirmModal.userName}?`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmModal.type === "assign" && confirmModal.roleId) {
                    assignRole(confirmModal.userId!, confirmModal.roleId);
                  } else if (confirmModal.type === "activate") {
                    activateUser(confirmModal.userId!);
                  } else if (confirmModal.type === "inactivate") {
                    inactivateUser(confirmModal.userId!);
                  }
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() =>
                  setConfirmModal({ show: false, type: null, userId: null })
                }
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmStep.step === 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">End Role</h2>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded mb-6">
              <p className="text-yellow-800 font-medium">
                Are you sure you want to end the role for this user?
              </p>
              <p className="text-yellow-700 mt-2">
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
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmStep.step === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Final Confirmation
              </h2>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
              <p className="text-red-800 font-bold">
                ⚠️ This action cannot be undone!
              </p>
              <p className="text-red-700 mt-2">
                You are about to permanently end the role for:
              </p>
              <p className="text-red-700 font-semibold mt-1">
                {deleteConfirmStep.userName}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (deleteConfirmStep.userId) {
                    endRole(deleteConfirmStep.userId);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                End Role Permanently
              </button>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={chabibaLogo}
              alt="Chabiba Logo"
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full mb-4 object-cover shadow-lg"
            />

            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
              Chabiba
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">
              الشبيبة
            </p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <Heart className="w-4 h-4 text-red-500" />
              <p className="text-xs sm:text-sm text-gray-500">
                Lebanese Religious Brotherhood
              </p>
              <Heart className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </div>

        <div className="relative mb-6 sm:mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all bg-white shadow-sm text-gray-900 placeholder-gray-400 text-sm sm:text-base"
            placeholder="Search members..."
            disabled={assigningUserId !== null}
          />
        </div>

        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-yellow-500 to-amber-600 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Active Members
            </h2>
            <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold">
              {activeUsers.length}
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium text-sm sm:text-base">
                No active members found
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {activeUsers.map((u) => renderUser(u, true))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-500">
              Inactive Members
            </h2>
            <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm font-semibold">
              {inactiveUsers.length}
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : inactiveUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium text-sm sm:text-base">
                No inactive members found
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {inactiveUsers.map((u) => renderUser(u, false))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
