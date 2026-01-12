import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/solid";

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
const AMIN_SANDOU2 = "Amin sandou2"; // Fixed: capital "S"

// ---------------------------
// Component
// ---------------------------
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const hasRole = (role: string, sectionId?: number) =>
    roles.some(
      (r) =>
        r.role_name === role &&
        r.end_date === null &&
        (!sectionId || r.section_id === sectionId)
    );

  const isHighAdmin = () => currentUser.is_global_admin === true;

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
    if (isHighAdmin()) return true;

    if (isSharedEvent(event))
      return isPresidentOrNe2b(1) || hasRole(AMIN_SER, 1);

    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SER, s.id)
    );
  };

  const canEditFinancials = (event: Event) => {
    if (isHighAdmin()) return true;

    if (isSharedEvent(event))
      return isPresidentOrNe2b(1) || hasRole(AMIN_SANDOU2, 1);

    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SANDOU2, s.id)
    );
  };

  const canDelete = (event: Event) =>
    isHighAdmin() || event.sections.some((s) => isPresidentOrNe2b(s.id));

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

  const calculateProfit = (event: Event) =>
    parseFloat(event.total_revenue) - parseFloat(event.total_spent);

  const canShowAddButton =
    isHighAdmin() ||
    isPresidentOrNe2b(1) ||
    hasRole(AMIN_SER, 1) ||
    hasRole(AMIN_SANDOU2, 1) ||
    isPresidentOrNe2b(2) ||
    isPresidentOrNe2b(3);

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Events</h1>

        {canShowAddButton && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mb-6 flex items-center gap-1"
            onClick={() => alert("Open Add Event modal")}
          >
            <PlusIcon className="w-5 h-5" />
            Add Event
          </button>
        )}

        {loading && <p className="text-gray-500">Loading events...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <div className="flex justify-end gap-2 mb-2">
                {canEditDetails(event) && (
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => alert(`Edit Details ${event.id}`)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
                {canEditFinancials(event) && (
                  <button
                    className="text-yellow-600 hover:text-yellow-800"
                    onClick={() => alert(`Edit Financials ${event.id}`)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
                {canDelete(event) && (
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-sm">
                Date: {new Date(event.event_date).toLocaleDateString()}
              </p>
              <p className="text-sm">Revenue: ${event.total_revenue}</p>
              <p className="text-sm">Spent: ${event.total_spent}</p>
              <p className="text-sm">Notes: {event.notes || "N/A"}</p>
              <p className="text-sm">Drive Link: {event.drive_Link || "N/A"}</p>
              <p className="font-bold mt-2">
                Profit: ${calculateProfit(event).toFixed(2)}
              </p>

              {isSharedEvent(event) && (
                <span className="mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  Shared Event 🔒
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
