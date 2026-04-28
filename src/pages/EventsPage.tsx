/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Navbar from "../components/Navbar";
import AddEventModal from "../components/AddEventModal";
import EditEventDetailsModal from "../components/EditEventDetailsModal";
import EditEventFinancialsModal from "../components/EditEventFinancialsModal";
import { useEvents } from "../hooks/useEvents";
import api from "../api/api";

import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";

import type { Event as AppEvent, UserRole } from "../types";

const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");

const CHABIBA_PRESIDENT = "Chabiba President";
const TALA2E3_PRESIDENT = "Tala2e3 President";
const FORSAN_PRESIDENT = "Forsan President";
const NE2B = "Ne2b al Ra2is";
const AMIN_SER = "Amin Ser";
const AMIN_SANDOU2 = "Amin sandou2";
const WAKIL_TANCHI2A = "wakil tanchi2a";

const rolesStatic: UserRole[] = currentUser.roles || [];

const hasRoleStatic = (role: string, sectionId?: number) =>
  rolesStatic.some(
    (r) =>
      r.role_name === role &&
      r.end_date === null &&
      (!sectionId || r.section_id === sectionId),
  );

const isHighAdminStatic = currentUser.is_global_admin === true;

const isChabibaLeaderSection1Static =
  hasRoleStatic("Chabiba President", 1) ||
  hasRoleStatic("Ne2b al Ra2is", 1) ||
  hasRoleStatic("Amin Ser", 1);

const userSectionStatic =
  hasRoleStatic("Tala2e3 President", 2) ||
  hasRoleStatic("Ne2b al Ra2is", 2) ||
  hasRoleStatic("Amin Ser", 2)
    ? 2
    : hasRoleStatic("Forsan President", 3) ||
        hasRoleStatic("Ne2b al Ra2is", 3) ||
        hasRoleStatic("Amin Ser", 3)
      ? 3
      : null;

const canPickAnySections = isHighAdminStatic || isChabibaLeaderSection1Static;
const forcedSection = canPickAnySections ? null : userSectionStatic;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const SECTION_COLORS: Record<
  number,
  { bg: string; text: string; dot: string }
> = {
  1: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  2: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
  3: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
};

export default function EventsPage() {
  const {
    events,
    loading,
    syncing,
    error,
    addEventOptimistic,
    deleteEventOptimistic,
    updateEventOptimistic,
  } = useEvents();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"all" | "1" | "2" | "3">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">(
    "all",
  );
  const [expanded, setExpanded] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const LOCK_AFTER_DAYS = 30;
  const WARNING_DAYS = 30;

  const getDaysSinceEvent = (eventDate: string) => {
    const eventTime = new Date(eventDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - eventTime) / (1000 * 60 * 60 * 24));
  };

  const getDaysRemainingBeforeLock = (eventDate: string) =>
    LOCK_AFTER_DAYS - getDaysSinceEvent(eventDate);

  const isInWarningPeriod = (eventDate: string) => {
    const remaining = getDaysRemainingBeforeLock(eventDate);
    return remaining > 0 && remaining <= WARNING_DAYS;
  };

  const roles: UserRole[] = currentUser.roles || [];

  const hasRole = (role: string, sectionId?: number) =>
    roles.some(
      (r) =>
        r.role_name === role &&
        r.end_date === null &&
        (!sectionId || r.section_id === sectionId),
    );

  const isHighAdmin = () => currentUser.is_global_admin === true;

  const isSharedEvent = (event: AppEvent) => {
    const ids = event.sections
      .map((s) => s.id)
      .sort()
      .join(",");
    return ids === "1,2,3";
  };

  const isAminSer = (event: AppEvent) => {
    if (hasRole(AMIN_SER, 1)) return true;
    if (isSharedEvent(event)) return hasRole(AMIN_SER, 1);
    return event.sections.some((s) => hasRole(AMIN_SER, s.id));
  };

  const isWakilTanchi2a = (event: AppEvent) => {
    if (isSharedEvent(event)) return false;
    return event.sections.some((s) => hasRole(WAKIL_TANCHI2A, s.id));
  };

  const isAminSandou2 = (event: AppEvent) => {
    if (isSharedEvent(event)) return hasRole(AMIN_SANDOU2, 1);
    return event.sections.some((s) => hasRole(AMIN_SANDOU2, s.id));
  };

  const isNe2b = (event: AppEvent) =>
    event.sections.some((s) => hasRole(NE2B, s.id));

  const isPresidentOrNe2b = (sectionId: number) => {
    if (hasRole(NE2B, sectionId)) return true;
    if (sectionId === 1 && hasRole(CHABIBA_PRESIDENT, 1)) return true;
    if (sectionId === 2 && hasRole(TALA2E3_PRESIDENT, 2)) return true;
    if (sectionId === 3 && hasRole(FORSAN_PRESIDENT, 3)) return true;
    return false;
  };

  const isPresidentOrNe2bedit = (event: AppEvent) => {
    if (!event.sections) return false;
    if (isSharedEvent(event)) return hasRole(CHABIBA_PRESIDENT, 1);
    return event.sections.some((s) => {
      if (s.id === 1) return hasRole(CHABIBA_PRESIDENT, 1);
      if (s.id === 2) return hasRole(TALA2E3_PRESIDENT, 2);
      if (s.id === 3) return hasRole(FORSAN_PRESIDENT, 3);
      return false;
    });
  };

  const isUpcomingEvent = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event >= today;
  };

  const isPastEvent = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event < today;
  };

  const isChabibaLeaderSection1 =
    hasRole(CHABIBA_PRESIDENT, 1) || hasRole(NE2B, 1) || hasRole(AMIN_SER, 1);

  const isLeaderAnySection =
    hasRole(TALA2E3_PRESIDENT, 2) ||
    hasRole(FORSAN_PRESIDENT, 3) ||
    hasRole(NE2B, 2) ||
    hasRole(NE2B, 3) ||
    hasRole(AMIN_SER, 2) ||
    hasRole(AMIN_SER, 3);

  const canShowAddButton =
    isHighAdmin() || isChabibaLeaderSection1 || isLeaderAnySection;

  const isEventLocked = (event: AppEvent): boolean => {
    const lockDate = new Date(event.event_date);
    lockDate.setDate(lockDate.getDate() + LOCK_AFTER_DAYS);
    return new Date() > lockDate;
  };

  const canEditDetails = (event: AppEvent) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;
    if (hasRole(AMIN_SER, 1)) return true;
    if (isWakilTanchi2a(event)) return true;
    if (isSharedEvent(event)) return isPresidentOrNe2b(1);
    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SER, s.id),
    );
  };

  const canEditFinancials = (event: AppEvent) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;
    if (isSharedEvent(event))
      return isPresidentOrNe2b(1) || hasRole(AMIN_SANDOU2, 1);
    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SANDOU2, s.id),
    );
  };

  const canDelete = (event: AppEvent) => {
    if (isHighAdmin()) return true;
    if (isEventLocked(event)) return false;
    if (hasRole(AMIN_SER, 1)) return true;
    if (isSharedEvent(event)) return isPresidentOrNe2b(1);
    return event.sections.some((s) => isPresidentOrNe2b(s.id));
  };

  const canEditDetailsWithDate = (event: AppEvent) =>
    !isEventLocked(event) && canEditDetails(event);
  const canEditFinancialsWithDate = (event: AppEvent) =>
    !isEventLocked(event) && canEditFinancials(event);
  const canDeleteWithDate = (event: AppEvent) => {
    if (isHighAdmin()) return true;
    if (isEventLocked(event)) return false;
    return canDelete(event);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${eventId}`, { headers: getAuthHeader() });
      deleteEventOptimistic(eventId);
    } catch {
      alert("Failed to delete event");
    }
  };

  const calculateProfit = (event: AppEvent) =>
    parseFloat(event.total_revenue) - parseFloat(event.total_spent);

  const availableYears = Array.from(
    new Set(events.map((e) => new Date(e.event_date).getFullYear().toString())),
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const filteredEvents = events
    .filter((event) => {
      const text = (
        event.title +
        event.description +
        (event.notes || "")
      ).toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesSection =
        sectionFilter === "all" ||
        event.sections.some((s) => String(s.id) === sectionFilter);
      const matchesYear =
        yearFilter === "all" ||
        new Date(event.event_date).getFullYear().toString() === yearFilter;
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && isUpcomingEvent(event.event_date)) ||
        (dateFilter === "past" && isPastEvent(event.event_date));
      return matchesSearch && matchesSection && matchesYear && matchesDate;
    })
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );

  const totalRevenue = filteredEvents.reduce(
    (s, e) => s + parseFloat(e.total_revenue),
    0,
  );
  const totalSpent = filteredEvents.reduce(
    (s, e) => s + parseFloat(e.total_spent),
    0,
  );
  const totalProfit = totalRevenue - totalSpent;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page header ── */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Events
              </h1>
              {syncing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  <svg
                    className="animate-spin h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Syncing
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track brotherhood events and finances
            </p>
          </div>

          {canShowAddButton && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Revenue",
              value: totalRevenue,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              icon: <BanknotesIcon className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Spent",
              value: totalSpent,
              color: "text-rose-600",
              bg: "bg-rose-50",
              border: "border-rose-100",
              icon: <CurrencyDollarIcon className="w-4 h-4 text-rose-500" />,
            },
            {
              label: "Net Profit",
              value: totalProfit,
              color: totalProfit >= 0 ? "text-blue-600" : "text-orange-600",
              bg: totalProfit >= 0 ? "bg-blue-50" : "bg-orange-50",
              border:
                totalProfit >= 0 ? "border-blue-100" : "border-orange-100",
              icon: <CalendarIcon className="w-4 h-4 text-blue-500" />,
            },
          ].map(({ label, value, color, bg, border, icon }) => (
            <div
              key={label}
              className={`${bg} ${border} border rounded-2xl px-5 py-4 flex items-center justify-between`}
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={`text-2xl font-bold ${color}`}>
                  ${value.toFixed(2)}
                </p>
              </div>
              <div
                className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center border ${border}`}
              >
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filters ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or notes…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all bg-gray-50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                showFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {(sectionFilter !== "all" ||
                yearFilter !== "all" ||
                dateFilter !== "all") && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              {/* Section filter */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Section
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "all", label: "All" },
                      { val: "1", label: "Chabiba" },
                      { val: "2", label: "Tala2e3" },
                      { val: "3", label: "Forsan" },
                    ] as const
                  ).map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setSectionFilter(val)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        sectionFilter === val
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year filter */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Year
                </p>
                <div className="flex flex-wrap gap-2">
                  {["all", ...availableYears].map((year) => (
                    <button
                      key={year}
                      onClick={() => setYearFilter(year)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        yearFilter === year
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {year === "all" ? "All years" : year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date filter */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "all", label: "All" },
                      { val: "upcoming", label: "Upcoming" },
                      { val: "past", label: "Done" },
                    ] as const
                  ).map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setDateFilter(val)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        dateFilter === val
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>
              {filteredEvents.length} of {events.length} events
            </span>
            {(searchTerm ||
              sectionFilter !== "all" ||
              yearFilter !== "all" ||
              dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSectionFilter("all");
                  setYearFilter("all");
                  setDateFilter("all");
                }}
                className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">Loading events…</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* ── Events grid ── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const profit = calculateProfit(event);
                const isProfitable = profit >= 0;
                const upcoming = isUpcomingEvent(event.event_date);
                const locked = isEventLocked(event);
                const warning = isInWarningPeriod(event.event_date);

                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    {/* Card header */}
                    <div className="p-5 border-b border-gray-100">
                      {/* Top row: badges + actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {upcoming ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Upcoming
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              Done
                            </span>
                          )}
                          {locked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-gray-800 text-white px-2 py-0.5 rounded-full">
                              🔒 Locked
                            </span>
                          )}
                          {!locked && warning && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              ⏳ {getDaysRemainingBeforeLock(event.event_date)}d
                              left
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          {canEditDetailsWithDate(event) && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsEditOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                              title="Edit Details"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEditFinancialsWithDate(event) && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsFinancialsOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                              title="Edit Financials"
                            >
                              <CurrencyDollarIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDeleteWithDate(event) && (
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
                              title="Delete Event"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-bold text-gray-900 leading-snug mb-1">
                        {event.title}
                      </h2>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </div>

                      {/* Description — bigger, more breathing room */}
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p className={expanded ? "" : "line-clamp-4"}>
                          {event.description}
                        </p>
                        {event.description?.length > 180 && (
                          <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-gray-400 hover:text-gray-600 mt-1 font-medium transition-colors"
                          >
                            {expanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Financials — compact row */}
                    <div className="px-5 py-3 flex items-center gap-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex-1 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                          Revenue
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          ${parseFloat(event.total_revenue).toFixed(2)}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="flex-1 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                          Spent
                        </p>
                        <p className="text-sm font-bold text-rose-500">
                          ${parseFloat(event.total_spent).toFixed(2)}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="flex-1 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                          Profit
                        </p>
                        <p
                          className={`text-sm font-bold ${isProfitable ? "text-blue-600" : "text-orange-500"}`}
                        >
                          ${profit.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Footer: sections + links */}
                    <div className="px-5 py-3 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex flex-wrap gap-1.5">
                        {isSharedEvent(event) && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Shared
                          </span>
                        )}
                        {event.sections.map((section: any) => {
                          const c = SECTION_COLORS[section.id] ?? {
                            bg: "bg-gray-100",
                            text: "text-gray-600",
                            dot: "bg-gray-400",
                          };
                          return (
                            <span
                              key={section.id}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${c.bg} ${c.text} px-2 py-0.5 rounded-full`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${c.dot}`}
                              />
                              {section.name}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex gap-3">
                        {event.drive_link && (
                          <a
                            href={event.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
                          >
                            Drive ↗
                          </a>
                        )}
                        {event.photo_link && (
                          <a
                            href={event.photo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
                          >
                            Photos ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {event.notes && (
                      <details className="px-5 pb-4">
                        <summary className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors select-none">
                          Notes ▾
                        </summary>
                        <p className="mt-2 text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
                          {event.notes}
                        </p>
                      </details>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  No events found
                </p>
                <p className="text-xs text-gray-400">
                  {searchTerm || sectionFilter !== "all" || yearFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first event to get started"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <AddEventModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={(newEvent: AppEvent) => addEventOptimistic(newEvent)}
        isGlobalAdmin={currentUser.is_global_admin}
        canPickAnySections={canPickAnySections}
        forcedSection={forcedSection}
      />

      <EditEventDetailsModal
        open={isEditOpen}
        event={selectedEvent}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEvent(null);
        }}
        editMode={
          selectedEvent
            ? isHighAdmin()
              ? "full"
              : isAminSer(selectedEvent)
                ? "full"
                : isPresidentOrNe2bedit(selectedEvent)
                  ? "full"
                  : isWakilTanchi2a(selectedEvent)
                    ? "description"
                    : "none"
            : "none"
        }
        onUpdated={(updatedEvent) => updateEventOptimistic(updatedEvent)}
      />

      <EditEventFinancialsModal
        open={isFinancialsOpen}
        event={selectedEvent}
        onClose={() => {
          setIsFinancialsOpen(false);
          setSelectedEvent(null);
        }}
        canEdit={
          selectedEvent
            ? isHighAdmin() ||
              isAminSandou2(selectedEvent) ||
              isNe2b(selectedEvent) ||
              isPresidentOrNe2bedit(selectedEvent)
            : false
        }
        onUpdated={(updatedEvent) => updateEventOptimistic(updatedEvent)}
      />
    </div>
  );
}
