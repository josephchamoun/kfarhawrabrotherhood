/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AddEventModal from "../components/AddEventModal";
import EditEventDetailsModal from "../components/EditEventDetailsModal";
import EditEventFinancialsModal from "../components/EditEventFinancialsModal";

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

import type { Event, UserRole } from "../types";

// ---------------------------
// Load current user
// ---------------------------
const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");

// ---------------------------
// Role constants
// ---------------------------
const CHABIBA_PRESIDENT = "Chabiba President";
const TALA2E3_PRESIDENT = "Tala2e3 President";
const FORSAN_PRESIDENT = "Forsan President";
const NE2B = "Ne2b al Ra2is";
const AMIN_SER = "Amin Ser";
const AMIN_SANDOU2 = "Amin sandou2";
const WAKIL_TANCHI2A = "wakil tanchi2a";

// ---------------------------
// Determine user permissions for AddEventModal
// ---------------------------
const roles: UserRole[] = currentUser.roles || [];

const hasRole = (role: string, sectionId?: number) =>
  roles.some(
    (r) =>
      r.role_name === role &&
      r.end_date === null &&
      (!sectionId || r.section_id === sectionId),
  );

const isHighAdmin = currentUser.is_global_admin === true;

// Chabiba leaders in section 1
const isChabibaLeaderSection1 =
  hasRole("Chabiba President", 1) ||
  hasRole("Ne2b al Ra2is", 1) ||
  hasRole("Amin Ser", 1);

// Other leaders (section 2 or 3)
const userSection =
  hasRole("Tala2e3 President", 2) ||
  hasRole("Ne2b al Ra2is", 2) ||
  hasRole("Amin Ser", 2)
    ? 2
    : hasRole("Forsan President", 3) ||
        hasRole("Ne2b al Ra2is", 3) ||
        hasRole("Amin Ser", 3)
      ? 3
      : null;

// Decide what the user can do
const canPickAnySections = isHighAdmin || isChabibaLeaderSection1;
const forcedSection = canPickAnySections ? null : userSection;

// ---------------------------
// Component
// ---------------------------
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"all" | "1" | "2" | "3">(
    "all",
  );

  type DateFilter = "all" | "upcoming" | "past";

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
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

  const getDaysRemainingBeforeLock = (eventDate: string) => {
    return LOCK_AFTER_DAYS - getDaysSinceEvent(eventDate);
  };

  const isLocked = (eventDate: string) => {
    return getDaysRemainingBeforeLock(eventDate) <= 0;
  };

  const isInWarningPeriod = (eventDate: string) => {
    const remaining = getDaysRemainingBeforeLock(eventDate);
    return remaining > 0 && remaining <= WARNING_DAYS;
  };

  // ---------------------------
  // Fetch events
  // ---------------------------
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setEvents(res.data);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ---------------------------
  // Roles helpers
  // ---------------------------
  const roles: UserRole[] = currentUser.roles || [];
  const isAminSer = (event: Event) => {
    // ✅ Amin Ser of section 1 = global
    if (hasRole(AMIN_SER, 1)) return true;

    if (isSharedEvent(event)) return hasRole(AMIN_SER, 1);
    return event.sections.some((s) => hasRole(AMIN_SER, s.id));
  };

  const isWakilTanchi2a = (event: Event) => {
    if (isSharedEvent(event)) return false;

    return event.sections.some((s) => hasRole(WAKIL_TANCHI2A, s.id));
  };

  const hasRole = (role: string, sectionId?: number) =>
    roles.some(
      (r) =>
        r.role_name === role &&
        r.end_date === null &&
        (!sectionId || r.section_id === sectionId),
    );

  const isHighAdmin = () => currentUser.is_global_admin === true;
  const isAminSandou2 = (event: Event) => {
    if (isSharedEvent(event)) return hasRole(AMIN_SANDOU2, 1);
    return event.sections.some((s) => hasRole(AMIN_SANDOU2, s.id));
  };

  const isNe2b = (event: Event) =>
    event.sections.some((s) => hasRole(NE2B, s.id));

  const isPresidentOrNe2b = (sectionId: number) => {
    if (hasRole(NE2B, sectionId)) return true;
    if (sectionId === 1 && hasRole(CHABIBA_PRESIDENT, 1)) return true;
    if (sectionId === 2 && hasRole(TALA2E3_PRESIDENT, 2)) return true;
    if (sectionId === 3 && hasRole(FORSAN_PRESIDENT, 3)) return true;
    return false;
  };
  const isPresidentOrNe2bedit = (event: Event) => {
    if (!event.sections) return false;

    // Shared events → only Chabiba President
    if (isSharedEvent(event)) {
      return hasRole(CHABIBA_PRESIDENT, 1); // section 1 = Chabiba
    }

    // Check if user is president of any section of this event
    return event.sections.some((s) => {
      if (s.id === 1) return hasRole(CHABIBA_PRESIDENT, 1);
      if (s.id === 2) return hasRole(TALA2E3_PRESIDENT, 2);
      if (s.id === 3) return hasRole(FORSAN_PRESIDENT, 3);
      return false;
    });
  };

  const isSharedEvent = (event: Event) => {
    const ids = event.sections
      .map((s) => s.id)
      .sort()
      .join(",");
    return ids === "1,2,3";
  };

  //Upcoming & Past events
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

  // ---------------------------
  // Permissions
  // ---------------------------

  const canEditDetailsWithDate = (event: Event) =>
    !isLocked(event.event_date) && canEditDetails(event);

  const canEditFinancialsWithDate = (event: Event) =>
    !isLocked(event.event_date) && canEditFinancials(event);

  const canDeleteWithDate = (event: Event) => {
    // High Admin can ALWAYS delete
    if (isHighAdmin()) return true;

    // If locked (>= 30 days), nobody else can
    if (isEventLocked(event)) return false;

    // Before 30 days → use extended old rules (including Amin Ser 1)
    return canDelete(event);
  };

  const canEditDetails = (event: Event) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;

    // ✅ Amin Ser of Chabiba (section 1) can edit EVERYTHING
    if (hasRole(AMIN_SER, 1)) return true;

    // Wakil Tanchi2a → description only
    if (isWakilTanchi2a(event)) return true;

    if (isSharedEvent(event)) return isPresidentOrNe2b(1);

    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SER, s.id),
    );
  };

  const canEditFinancials = (event: Event) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;

    if (isSharedEvent(event))
      return isPresidentOrNe2b(1) || hasRole(AMIN_SANDOU2, 1);

    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SANDOU2, s.id),
    );
  };

  const canDelete = (event: Event) => {
    if (isHighAdmin()) return true;
    if (isEventLocked(event)) return false;

    // ✅ Amin Ser of Chabiba (section 1) before 30 days
    if (hasRole(AMIN_SER, 1)) return true;

    // Old rules
    if (isSharedEvent(event)) return isPresidentOrNe2b(1);
    return event.sections.some((s) => isPresidentOrNe2b(s.id));
  };

  // ---------------------------
  // Actions
  // ---------------------------
  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      fetchEvents();
    } catch {
      alert("Failed to delete event");
    }
  };

  const isEventLocked = (event: Event): boolean => {
    const eventDate = new Date(event.event_date);

    const lockDate = new Date(eventDate);
    lockDate.setDate(lockDate.getDate() + LOCK_AFTER_DAYS);

    return new Date() > lockDate;
  };

  const calculateProfit = (event: Event) =>
    parseFloat(event.total_revenue) - parseFloat(event.total_spent);

  // Get unique years from events
  const availableYears = Array.from(
    new Set(
      events.map((event) =>
        new Date(event.event_date).getFullYear().toString(),
      ),
    ),
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

      const eventYear = new Date(event.event_date).getFullYear().toString();
      const matchesYear = yearFilter === "all" || eventYear === yearFilter;

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

  // Calculate totals
  const totalRevenue = filteredEvents.reduce(
    (sum, e) => sum + parseFloat(e.total_revenue),
    0,
  );
  const totalSpent = filteredEvents.reduce(
    (sum, e) => sum + parseFloat(e.total_spent),
    0,
  );
  const totalProfit = totalRevenue - totalSpent;

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Events</h1>
              <p className="text-gray-600">
                Manage and track brotherhood events and finances
              </p>
            </div>
            {canShowAddButton && (
              <button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={() => setIsAddOpen(true)}
              >
                <PlusIcon className="w-5 h-5" />
                Add Event
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BanknotesIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Spent
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Net Profit
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      totalProfit >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    ${totalProfit.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${
                    totalProfit >= 0
                      ? "from-blue-500 to-blue-600"
                      : "from-red-500 to-red-600"
                  } rounded-xl flex items-center justify-center`}
                >
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by title, description, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                {/* Section Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filter by Section
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSectionFilter("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        sectionFilter === "all"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Sections
                    </button>
                    <button
                      onClick={() => setSectionFilter("1")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        sectionFilter === "1"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Chabiba
                    </button>
                    <button
                      onClick={() => setSectionFilter("2")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        sectionFilter === "2"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tala2e3
                    </button>
                    <button
                      onClick={() => setSectionFilter("3")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        sectionFilter === "3"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Forsan
                    </button>
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filter by Year
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setYearFilter("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        yearFilter === "all"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Years
                    </button>
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => setYearFilter(year)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          yearFilter === year
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filter by Date
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDateFilter("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        dateFilter === "all"
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Events
                    </button>

                    <button
                      onClick={() => setDateFilter("upcoming")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        dateFilter === "upcoming"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ⏳ Upcoming
                    </button>

                    <button
                      onClick={() => setDateFilter("past")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        dateFilter === "past"
                          ? "bg-gray-700 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ✅ Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">
                Showing {filteredEvents.length} of {events.length} events
              </span>
              {(searchTerm ||
                sectionFilter !== "all" ||
                yearFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSectionFilter("all");
                    setYearFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <CalendarIcon className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading events...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const profit = calculateProfit(event);
                const isProfitable = profit >= 0;

                return (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all transform hover:-translate-y-1"
                  >
                    {/* ================= HEADER ================= */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
                      <div className="flex justify-between items-start">
                        {/* Title & Description */}
                        <div className="flex-1 pr-4">
                          <h2 className="text-xl font-bold text-white mb-1">
                            {event.title}
                          </h2>
                          <div>
                            <p
                              className={`text-blue-100 text-sm ${expanded ? "" : "line-clamp-2"}`}
                            >
                              {event.description}
                            </p>
                            {event.description.length > 100 && (
                              <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-blue-200 text-xs mt-1 hover:underline"
                              >
                                {expanded ? "Show less" : "Read more"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {canEditDetailsWithDate(event) && (
                            <button
                              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:rotate-1"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsEditOpen(true);
                              }}
                              title="Edit Details"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}

                          {canEditFinancialsWithDate(event) && (
                            <button
                              className="bg-yellow-500/80 hover:bg-yellow-500 text-white p-2 rounded-lg transition-all duration-200 hover:scale-110"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsFinancialsOpen(true);
                              }}
                              title="Edit Financials"
                            >
                              <CurrencyDollarIcon className="w-4 h-4" />
                            </button>
                          )}

                          {canDeleteWithDate(event) && (
                            <button
                              className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-110"
                              onClick={() => handleDeleteEvent(event.id)}
                              title="Delete Event"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ================= BODY ================= */}
                    <div className="p-6">
                      {/* Status Badges */}
                      {(isEventLocked(event) ||
                        isInWarningPeriod(event.event_date)) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {isEventLocked(event) && (
                            <span className="inline-flex items-center gap-1 bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
                              🔒 Locked
                            </span>
                          )}

                          {!isEventLocked(event) &&
                            isInWarningPeriod(event.event_date) && (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 text-xs px-3 py-1 rounded-full font-semibold shadow">
                                ⏳{" "}
                                {getDaysRemainingBeforeLock(event.event_date)}{" "}
                                days remaining to edit
                              </span>
                            )}
                        </div>
                      )}

                      {/* Date & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                        {/* Event Date */}
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>

                        {/* Status Badge */}
                        {isUpcomingEvent(event.event_date) ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                            ⏳ Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                            ✅ Done
                          </span>
                        )}
                      </div>

                      {/* Financials */}
                      <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            💰 Revenue
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            ${parseFloat(event.total_revenue).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            💸 Spent
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            ${parseFloat(event.total_spent).toFixed(2)}
                          </span>
                        </div>

                        <div
                          className={`p-4 rounded-xl border-2 flex justify-between items-center ${
                            isProfitable
                              ? "bg-blue-50 border-blue-300"
                              : "bg-orange-50 border-orange-300"
                          }`}
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            📊 Net Profit
                          </span>
                          <span
                            className={`text-2xl font-extrabold ${
                              isProfitable ? "text-blue-600" : "text-orange-600"
                            }`}
                          >
                            ${profit.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {event.notes && (
                        <details className="mb-5 bg-gray-50 rounded-lg p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                            📝 Notes
                          </summary>
                          <p className="mt-2 text-sm text-gray-700">
                            {event.notes}
                          </p>
                        </details>
                      )}

                      {/* Drive Link */}
                      {event.drive_link && (
                        <div className="mb-5">
                          <a
                            href={event.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                          >
                            🔗 View Drive Files
                          </a>
                        </div>
                      )}

                      {/* Photo Link */}
                      {event.photo_link && (
                        <div className="mb-5">
                          <a
                            href={event.photo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                          >
                            🔗 View Event Photos
                          </a>
                        </div>
                      )}

                      {/* Sections & Shared */}
                      <div className="flex flex-wrap gap-2">
                        {isSharedEvent(event) && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            🔐 Shared Event
                          </span>
                        )}

                        {event.sections.map((section: any) => (
                          <span
                            key={section.id}
                            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">
                  No events found
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || sectionFilter !== "all" || yearFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first event to get started"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEventModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={(newEvent) => setEvents((prev) => [newEvent, ...prev])}
        isGlobalAdmin={currentUser.is_global_admin}
        canPickAnySections={canPickAnySections}
        forcedSection={forcedSection} // ✅ use the actual variable
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
        onUpdated={(updatedEvent) => {
          setEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
          );
        }}
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
              isPresidentOrNe2bedit(selectedEvent) // ✅ add this
            : false
        }
        onUpdated={(updatedEvent) => {
          setEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
          );
        }}
      />
    </div>
  );
}
