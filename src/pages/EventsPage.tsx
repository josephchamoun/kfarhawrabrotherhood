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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

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
    if (isSharedEvent(event)) return hasRole(AMIN_SER, 1);
    return event.sections.some((s) => hasRole(AMIN_SER, s.id));
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

  const isSharedEvent = (event: Event) => {
    const ids = event.sections
      .map((s) => s.id)
      .sort()
      .join(",");
    return ids === "1,2,3";
  };

  // ---------------------------
  // Permissions
  // ---------------------------
  const canEditDetails = (event: Event) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;

    if (isSharedEvent(event))
      return isPresidentOrNe2b(1) || hasRole(AMIN_SER, 1);

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
    if (isEventLocked(event)) return false;
    return isHighAdmin() || event.sections.some((s) => isPresidentOrNe2b(s.id));
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

  const isEventLocked = (event: Event) => {
    const eventDate = new Date(event.event_date);
    const lockDate = new Date(eventDate);
    lockDate.setMonth(lockDate.getMonth() + 1);

    return new Date() > lockDate;
  };

  const calculateProfit = (event: Event) =>
    parseFloat(event.total_revenue) - parseFloat(event.total_spent);

  const canShowAddButton =
    isHighAdmin() ||
    isPresidentOrNe2b(1) ||
    isPresidentOrNe2b(2) ||
    isPresidentOrNe2b(3);

  // Get unique years from events
  const availableYears = Array.from(
    new Set(
      events.map((event) =>
        new Date(event.event_date).getFullYear().toString(),
      ),
    ),
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const filteredEvents = events.filter((event) => {
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

    return matchesSearch && matchesSection && matchesYear;
  });

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
                    {/* Card Header with Actions */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 relative">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-white mb-1 pr-2">
                            {event.title}
                          </h2>
                          <p className="text-blue-100 text-sm">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {canEditDetails(event) && (
                            <button
                              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsEditOpen(true);
                              }}
                              title="Edit Details"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          {canEditFinancials(event) && (
                            <button
                              className="bg-yellow-500/80 hover:bg-yellow-500 text-white p-2 rounded-lg transition-all"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsFinancialsOpen(true);
                              }}
                              title="Edit Financials"
                            >
                              <CurrencyDollarIcon className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete(event) && (
                            <button
                              className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                              onClick={() => handleDeleteEvent(event.id)}
                              title="Delete Event"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Date */}
                      <div className="flex items-center gap-2 mb-4 text-gray-600">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Financials */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            Revenue
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            ${parseFloat(event.total_revenue).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            Spent
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            ${parseFloat(event.total_spent).toFixed(2)}
                          </span>
                        </div>
                        <div
                          className={`flex justify-between items-center p-3 ${
                            isProfitable ? "bg-blue-50" : "bg-orange-50"
                          } rounded-lg border-2 ${
                            isProfitable
                              ? "border-blue-200"
                              : "border-orange-200"
                          }`}
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            Net Profit
                          </span>
                          <span
                            className={`text-xl font-bold ${
                              isProfitable ? "text-blue-600" : "text-orange-600"
                            }`}
                          >
                            ${profit.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {event.notes && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            NOTES
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {event.notes}
                          </p>
                        </div>
                      )}

                      {event.drive_Link && (
                        <div className="mb-4">
                          <a
                            href={event.drive_Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            View Drive Files
                          </a>
                        </div>
                      )}

                      {/* Sections & Shared Badge */}
                      <div className="flex flex-wrap gap-2">
                        {isSharedEvent(event) && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Shared Event
                          </span>
                        )}
                        {event.sections.map((section: any) => (
                          <span
                            key={section.id}
                            className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                      {isEventLocked(event) && (
                        <span className="inline-flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          🔒 Locked
                        </span>
                      )}
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
        onCreated={(newEvent) => {
          setEvents((prev) => [newEvent, ...prev]);
        }}
        isGlobalAdmin={
          JSON.parse(localStorage.getItem("user_info") || "{}").is_global_admin
        }
      />

      <EditEventDetailsModal
        open={isEditOpen}
        event={selectedEvent}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEvent(null);
        }}
        canEdit={
          selectedEvent ? isHighAdmin() || isAminSer(selectedEvent) : false
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
              isNe2b(selectedEvent)
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
