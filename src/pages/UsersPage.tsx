import { useState } from "react";
import type { User } from "../types";
import Navbar from "../components/Navbar";
import AddUserModal from "../components/AddUserModal";
import AddToSectionModal from "../components/AddToSectionModal";
import { useUsers } from "../hooks/useUsers";
import api from "../api/api";
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

/* ─────────────────────────────────────────────
   Inline styles — matches HomePage theme exactly
   Google Fonts: Cormorant Garamond + Lato
───────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap');

  :root {
    --gold:    #C9A84C;
    --gold-lt: #E8D5A3;
    --gold-dk: #8B6914;
    --cedar:   #2D5016;
    --cedar-lt:#4A7A28;
    --stone:   #F5F0E8;
    --ink:     #1A1A2E;
    --warm:    #6B4423;
  }

  body { font-family: 'Lato', sans-serif; }
  .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }

  /* Cross background pattern */
  .cross-bg {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M29 10v40M10 29h40' stroke='%23C9A84C' stroke-width='0.6' stroke-opacity='0.18'/%3E%3C/svg%3E");
  }

  /* Cedar leaf silhouette pattern */
  .cedar-bg {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 100 Q30 70 40 40 Q50 20 60 10 Q70 20 80 40 Q90 70 60 100Z' fill='%232D5016' fill-opacity='0.06'/%3E%3C/svg%3E");
  }

  /* Ornamental divider */
  .ornament::before,
  .ornament::after {
    content: '';
    display: inline-block;
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold));
    vertical-align: middle;
    margin: 0 14px;
  }
  .ornament::after {
    background: linear-gradient(90deg, var(--gold), transparent);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.7s ease both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }

  /* User card */
  .member-card {
    background: white;
    border: 1px solid #E8D5A3;
    border-top: 3px solid var(--gold);
    border-radius: 16px;
    padding: 20px 24px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .member-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(201,168,76,0.15);
  }

  /* Mobile responsive user card */
  @media (max-width: 768px) {
    .member-card {
      padding: 14px 18px;
    }
    .member-card .user-layout {
      flex-direction: column;
      align-items: stretch;
      text-align: left;
      gap: 12px;
    }
    .member-card .member-avatar {
      width: 40px;
      height: 40px;
      font-size: 1.1rem;
    }
    .member-card .user-info {
      text-align: left;
    }
    .member-card .user-name,
    .member-card .user-email {
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
    .member-card .user-actions {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      width: 100%;
      gap: 8px;
    }
    .member-card .user-actions button {
      flex: 1 1 auto;
      min-width: 110px;
    }
    .member-card .meta-row,
    .member-card .section-badges {
      justify-content: flex-start;
    }
  }

  /* Admin card accent */
  .admin-card {
    border-top-color: var(--cedar);
  }

  /* Filter pill */
  .filter-pill {
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    border: 1.5px solid #E8D5A3;
    background: white;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.2s;
  }
  .filter-pill:hover {
    border-color: var(--gold);
    color: var(--gold-dk);
  }
  .filter-pill.active {
    background: linear-gradient(135deg, var(--gold-dk), var(--gold));
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px rgba(201,168,76,0.35);
  }
  .filter-pill.active-cedar {
    background: linear-gradient(135deg, var(--cedar), var(--cedar-lt));
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px rgba(45,80,22,0.3);
  }

  /* Search input */
  .search-input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 1.5px solid #E8D5A3;
    border-radius: 12px;
    font-family: 'Lato', sans-serif;
    font-size: 15px;
    background: white;
    color: var(--ink);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .search-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
  }
  .search-input::placeholder { color: #aaa; }

  /* Avatar */
  .member-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-dk), var(--gold));
    border: 2px solid var(--gold-lt);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(201,168,76,0.25);
  }
  .admin-avatar {
    background: linear-gradient(135deg, var(--cedar), var(--cedar-lt));
    border-color: rgba(74,122,40,0.5);
    box-shadow: 0 4px 12px rgba(45,80,22,0.25);
  }

  /* Action buttons */
  .btn-view {
    padding: 8px 18px;
    border-radius: 10px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    font-weight: 700;
    border: 1.5px solid #E8D5A3;
    background: white;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-block;
  }
  .btn-view:hover {
    background: var(--gold);
    border-color: var(--gold-dk);
    color: white;
    box-shadow: 0 4px 12px rgba(201,168,76,0.35);
  }
  .btn-section {
    padding: 8px 18px;
    border-radius: 10px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    font-weight: 700;
    border: 1.5px solid rgba(45,80,22,0.3);
    background: white;
    color: var(--cedar);
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-section:hover {
    background: var(--cedar);
    border-color: var(--cedar);
    color: white;
    box-shadow: 0 4px 12px rgba(45,80,22,0.3);
  }
  .btn-delete {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1.5px solid #FCA5A5;
    background: #FEF2F2;
    color: #DC2626;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .btn-delete:hover {
    background: #DC2626;
    border-color: #DC2626;
    color: white;
    box-shadow: 0 4px 12px rgba(220,38,38,0.3);
  }

  /* Section badge */
  .section-badge {
    font-size: 11px;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    padding: 3px 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.2));
    color: var(--gold-dk);
    border: 1px solid rgba(201,168,76,0.3);
    letter-spacing: 0.03em;
  }

  /* Add member button */
  .btn-add-member {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--gold-dk), var(--gold));
    color: white;
    font-family: 'Lato', sans-serif;
    font-size: 15px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(201,168,76,0.4);
    transition: all 0.25s;
    letter-spacing: 0.02em;
  }
  .btn-add-member:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(201,168,76,0.5);
  }

  /* Filters toggle button */
  .btn-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    font-weight: 700;
    border: 1.5px solid #E8D5A3;
    background: white;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-filters.open {
    background: linear-gradient(135deg, var(--gold-dk), var(--gold));
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px rgba(201,168,76,0.35);
  }

  /* Section group header */
  .group-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #E8D5A3;
  }
  .group-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
  }
  .group-count {
    font-size: 11px;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    padding: 3px 10px;
    border-radius: 999px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Stat card in hero */
  .stat-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 14px;
    padding: 20px 24px;
    backdrop-filter: blur(8px);
    text-align: center;
  }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(201,168,76,0.2);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #eee 25%, #f8f4ec 50%, #eee 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* Modal overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26,26,46,0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 16px;
  }
  .modal-box {
    background: white;
    border-radius: 20px;
    padding: 32px;
    width: 100%;
    max-width: 440px;
    border-top: 3px solid var(--gold);
    box-shadow: 0 24px 64px rgba(0,0,0,0.25);
  }

  @media (max-width: 640px) {
    .member-card { padding: 16px; }
    .modal-box { padding: 24px; }
  }
`;

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

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export default function UsersPage() {
  const {
    users,
    loading,
    syncing,
    error,
    refetch,
    addUserOptimistic,
    deleteUserOptimistic,
  } = useUsers();

  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<{
    step: 0 | 1 | 2;
    userId: number | null;
    userName?: string;
  }>({ step: 0, userId: null });

  const navigate = useNavigate();

  const loggedUser: User | null = JSON.parse(
    localStorage.getItem("user_info") || "null",
  );
  const isSuperAdmin = loggedUser?.is_super_admin === true;
  const isGlobalAdmin = loggedUser?.is_global_admin === true;

  const today = new Date().toISOString().split("T")[0];

  const calculateAge = (dob?: Date | string) => {
    if (!dob) return null;
    const birthDate = dob instanceof Date ? dob : new Date(dob);
    const todayDate = new Date();
    let age = todayDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = todayDate.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

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

  const handleDeleteUser = async (userId: number) => {
    try {
      await api.delete(`/user/delete/${userId}`, { headers: getAuthHeader() });
      deleteUserOptimistic(userId);
      setDeleteConfirmStep({ step: 0, userId: null });
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
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
      <div key={u.id} className={`member-card ${isAdmin ? "admin-card" : ""}`}>
        <div
          className="user-layout"
          style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
        >
          {/* Avatar */}
          <div className={`member-avatar ${isAdmin ? "admin-avatar" : ""}`}>
            {u.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 6 }}>
              <h3
                className="font-display user-name"
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginBottom: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {u.name}
              </h3>
              <p
                className="user-email"
                style={{
                  fontSize: 13,
                  color: "#888",
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {u.email}
              </p>
            </div>

            {/* Meta row */}
            <div
              className="meta-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 16px",
                marginBottom: 10,
              }}
            >
              {u.phone && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: "#777",
                  }}
                >
                  <PhoneIcon
                    style={{ width: 13, height: 13, color: "var(--gold-dk)" }}
                  />
                  {u.phone}
                </span>
              )}
              {u.date_of_birth && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: "#777",
                  }}
                >
                  <CakeIcon
                    style={{ width: 13, height: 13, color: "var(--gold-dk)" }}
                  />
                  Age {calculateAge(u.date_of_birth)}
                </span>
              )}
            </div>

            {/* Section badges */}
            {activeSections && activeSections.length > 0 && (
              <div
                className="section-badges"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <TagIcon
                  style={{
                    width: 12,
                    height: 12,
                    color: "var(--gold-dk)",
                    flexShrink: 0,
                  }}
                />
                {Array.from(new Set(activeSections.map((s) => s.name))).map(
                  (sectionName) => (
                    <span key={sectionName} className="section-badge">
                      {sectionName}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className="user-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-end",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {!u.is_super_admin &&
              (isSuperAdmin || (isAdmin && !u.is_global_admin)) && (
                <button
                  className="btn-view"
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  View
                </button>
              )}
            {!isAdmin && canAddSection() && (
              <button
                className="btn-section"
                onClick={() => setSelectedUserId(u.id)}
              >
                + Section
              </button>
            )}
            {!u.is_super_admin &&
              (isSuperAdmin || (isAdmin && !u.is_global_admin)) && (
                <button
                  className="btn-delete"
                  onClick={() =>
                    setDeleteConfirmStep({
                      step: 1,
                      userId: u.id,
                      userName: u.name,
                    })
                  }
                  title="Delete member"
                >
                  <TrashIcon style={{ width: 16, height: 16 }} />
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div style={{ minHeight: "100vh", background: "var(--stone)" }}>
        <Navbar />

        {/* ── Slim info bar ── */}
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #E8D5A3",
            padding: "10px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Left: page title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{ color: "var(--gold)", fontSize: 13, lineHeight: 1 }}
              >
                ✝
              </span>
              <h1
                className="font-display"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Members
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--gold-dk)",
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontFamily: "'Lato', sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {users.length}
              </span>
            </div>

            {/* Right: syncing indicator */}
            {syncing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#aaa",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                <svg
                  style={{
                    width: 12,
                    height: 12,
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity="0.25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Syncing
              </div>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div
            style={{ maxWidth: 1080, margin: "24px auto 0", padding: "0 24px" }}
          >
            <div
              style={{
                background: "#FEF2F2",
                borderLeft: "4px solid #DC2626",
                borderRadius: 12,
                padding: "14px 18px",
                color: "#B91C1C",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "96px 24px",
              gap: 20,
            }}
          >
            <div className="spinner" />
            <p
              className="font-display"
              style={{
                color: "var(--gold-dk)",
                fontSize: "1.2rem",
                fontStyle: "italic",
              }}
            >
              Gathering the brotherhood…
            </p>
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && (
          <div className="cedar-bg" style={{ padding: "40px 24px 64px" }}>
            <div style={{ maxWidth: 1080, margin: "0 auto" }}>
              {/* Search & filters panel */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #E8D5A3",
                  borderTop: "3px solid var(--gold)",
                  borderRadius: 20,
                  padding: "24px 28px",
                  marginBottom: 32,
                  boxShadow: "0 4px 24px rgba(201,168,76,0.08)",
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: showFilters ? 20 : 0,
                  }}
                >
                  {/* Search */}
                  <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                    <MagnifyingGlassIcon
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 18,
                        height: 18,
                        color: "var(--gold-dk)",
                      }}
                    />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name, email, or phone…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filters toggle */}
                  <button
                    className={`btn-filters ${showFilters ? "open" : ""}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FunnelIcon style={{ width: 16, height: 16 }} />
                    Filters
                  </button>

                  {/* Add member */}
                  {isGlobalAdmin && (
                    <button
                      className="btn-add-member"
                      onClick={() => setShowAddUser(true)}
                    >
                      <PlusIcon style={{ width: 18, height: 18 }} />
                      Add Member
                    </button>
                  )}
                </div>

                {/* Result count */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: showFilters ? 0 : 10,
                  }}
                >
                  <p style={{ fontSize: 13, color: "#aaa", fontWeight: 700 }}>
                    Showing{" "}
                    <span style={{ color: "var(--ink)" }}>
                      {globalAdmins.length + otherUsers.length}
                    </span>{" "}
                    of{" "}
                    <span style={{ color: "var(--ink)" }}>{users.length}</span>{" "}
                    members
                  </p>
                  {(searchQuery ||
                    selectedSection !== "all" ||
                    selectedRole !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedSection("all");
                        setSelectedRole("all");
                      }}
                      style={{
                        fontSize: 12,
                        color: "var(--gold-dk)",
                        fontWeight: 700,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Filter panels */}
                {showFilters && (
                  <div
                    style={{
                      borderTop: "1px solid #E8D5A3",
                      paddingTop: 20,
                      marginTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    {/* Sections */}
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--cedar)",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Section
                      </p>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {["all", "no-section", ...allSections].map((s) => (
                          <button
                            key={s}
                            className={`filter-pill ${selectedSection === s ? "active" : ""}`}
                            onClick={() => setSelectedSection(s)}
                          >
                            {s === "all"
                              ? "All Members"
                              : s === "no-section"
                                ? "No Section"
                                : s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Roles */}
                    {allRoles.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--cedar)",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            marginBottom: 10,
                          }}
                        >
                          Role
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          <button
                            className={`filter-pill ${selectedRole === "all" ? "active-cedar" : ""}`}
                            onClick={() => setSelectedRole("all")}
                          >
                            All Roles
                          </button>
                          {allRoles.map((r) => (
                            <button
                              key={r}
                              className={`filter-pill ${selectedRole === r ? "active-cedar" : ""}`}
                              onClick={() => setSelectedRole(r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Global Admins group ── */}
              {isSuperAdmin && globalAdmins.length > 0 && (
                <div
                  style={{
                    background: "white",
                    border: "1px solid #E8D5A3",
                    borderTop: "3px solid var(--cedar)",
                    borderRadius: 20,
                    padding: "28px",
                    marginBottom: 24,
                    boxShadow: "0 4px 24px rgba(45,80,22,0.06)",
                  }}
                >
                  <div className="group-header">
                    <div
                      className="group-icon"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--cedar), var(--cedar-lt))",
                      }}
                    >
                      <span>✝</span>
                    </div>
                    <div>
                      <h2
                        className="font-display"
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          color: "var(--ink)",
                          marginBottom: 4,
                        }}
                      >
                        Global Admins
                      </h2>
                      <span
                        className="group-count"
                        style={{
                          background: "rgba(45,80,22,0.08)",
                          color: "var(--cedar)",
                        }}
                      >
                        {globalAdmins.length} leaders
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {globalAdmins.map((u) => renderUser(u, true))}
                  </div>
                </div>
              )}

              {/* ── Community Members group ── */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #E8D5A3",
                  borderTop: "3px solid var(--gold)",
                  borderRadius: 20,
                  padding: "28px",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.06)",
                }}
              >
                <div className="group-header">
                  <div
                    className="group-icon"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--gold-dk), var(--gold))",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>👥</span>
                  </div>
                  <div>
                    <h2
                      className="font-display"
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "var(--ink)",
                        marginBottom: 4,
                      }}
                    >
                      Community Members
                    </h2>
                    <span
                      className="group-count"
                      style={{
                        background: "rgba(201,168,76,0.1)",
                        color: "var(--gold-dk)",
                      }}
                    >
                      {otherUsers.length} brothers
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {otherUsers.length > 0 ? (
                    otherUsers.map((u) => renderUser(u))
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 24px" }}>
                      <div
                        className="font-display"
                        style={{
                          fontSize: "3rem",
                          color: "var(--gold)",
                          opacity: 0.4,
                          marginBottom: 12,
                        }}
                      >
                        ✝
                      </div>
                      <p
                        className="font-display"
                        style={{
                          fontSize: "1.3rem",
                          color: "var(--ink)",
                          marginBottom: 8,
                        }}
                      >
                        No members found
                      </p>
                      <p
                        style={{ fontSize: 14, color: "#aaa", fontWeight: 300 }}
                      >
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Ornamental footer strip ── */}
              <div style={{ textAlign: "center", marginTop: 48 }}>
                <p
                  className="ornament"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    color: "var(--cedar)",
                    textTransform: "uppercase",
                  }}
                >
                  Kfarhaoura · Lebanon · Est. 2026
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer
          style={{
            background: "var(--ink)",
            borderTop: "2px solid var(--gold-dk)",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <p
            className="font-display"
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.85rem",
              fontStyle: "italic",
            }}
          >
            © 2026 Kfarhaoura Brotherhood. Building faith and community in
            Lebanon ✝
          </p>
        </footer>
      </div>

      {/* ══ Delete Modal — Step 1 ══ */}
      {deleteConfirmStep.step === 1 && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                className="font-display"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Remove Member
              </h2>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#aaa",
                  padding: 4,
                }}
              >
                <XMarkIcon style={{ width: 22, height: 22 }} />
              </button>
            </div>
            <div
              style={{
                background: "#FEF2F2",
                borderLeft: "3px solid #DC2626",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: "#991B1B",
                  fontSize: 14,
                  marginBottom: 6,
                }}
              >
                Are you sure you want to remove this member?
              </p>
              <p style={{ color: "#B91C1C", fontSize: 14 }}>
                Member: <strong>{deleteConfirmStep.userName}</strong>
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() =>
                  setDeleteConfirmStep({ ...deleteConfirmStep, step: 2 })
                }
                style={{
                  flex: 1,
                  background: "#DC2626",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Continue
              </button>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                style={{
                  flex: 1,
                  background: "var(--stone)",
                  color: "var(--ink)",
                  border: "1.5px solid #E8D5A3",
                  borderRadius: 12,
                  padding: "12px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Modal — Step 2 ══ */}
      {deleteConfirmStep.step === 2 && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                className="font-display"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Final Confirmation
              </h2>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#aaa",
                  padding: 4,
                }}
              >
                <XMarkIcon style={{ width: 22, height: 22 }} />
              </button>
            </div>
            <div
              style={{
                background: "#FEF2F2",
                borderLeft: "3px solid #DC2626",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: "#991B1B",
                  fontSize: 14,
                  marginBottom: 6,
                }}
              >
                ⚠️ This action cannot be undone!
              </p>
              <p style={{ color: "#B91C1C", fontSize: 14, marginBottom: 4 }}>
                You are about to permanently remove:
              </p>
              <p style={{ color: "#991B1B", fontWeight: 700, fontSize: 15 }}>
                {deleteConfirmStep.userName}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  if (deleteConfirmStep.userId)
                    handleDeleteUser(deleteConfirmStep.userId);
                }}
                style={{
                  flex: 1,
                  background: "#DC2626",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteConfirmStep({ step: 0, userId: null })}
                style={{
                  flex: 1,
                  background: "var(--stone)",
                  color: "var(--ink)",
                  border: "1.5px solid #E8D5A3",
                  borderRadius: 12,
                  padding: "12px",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Add User Modal ══ */}
      {showAddUser && isGlobalAdmin && (
        <AddUserModal
          open={showAddUser}
          onClose={() => setShowAddUser(false)}
          onCreated={(newUser) => {
            addUserOptimistic(newUser);
            setShowAddUser(false);
          }}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* ══ Add to Section Modal ══ */}
      {selectedUserId && (
        <AddToSectionModal
          userId={selectedUserId}
          userSections={
            users.find((u) => u.id === selectedUserId)?.sections || []
          }
          onClose={() => setSelectedUserId(null)}
          onSuccess={() => {
            setSelectedUserId(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
