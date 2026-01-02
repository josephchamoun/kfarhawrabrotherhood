import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import type { Event } from "../types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<number | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  // Filtered events based on search and year
  const filteredEvents = events.filter((event) => {
    const eventYear = new Date(event.event_date).getFullYear();
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.creator.name.toLowerCase().includes(search.toLowerCase());
    const matchesYear = yearFilter === "All" || eventYear === yearFilter;
    return matchesSearch && matchesYear;
  });

  // Calculate profit for each event
  const calculateProfit = (event: Event) =>
    parseFloat(event.total_revenue) - parseFloat(event.total_spent);

  // Total profit for filtered events
  const totalProfit = filteredEvents.reduce(
    (acc, event) => acc + calculateProfit(event),
    0
  );

  // All available years
  const years = Array.from(
    new Set(events.map((e) => new Date(e.event_date).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Events</h1>

        {/* Search + Year Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(
                e.target.value === "All" ? "All" : parseInt(e.target.value)
              )
            }
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-500">Loading events...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {event.title}
              </h2>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium"></span> {event.description}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Date:</span>{" "}
                {new Date(event.event_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Type:</span> {event.type}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Creator:</span>{" "}
                {event.creator.name}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Revenue:</span> $
                {event.total_revenue}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Spent:</span> ${event.total_spent}
              </p>
              <p className="text-gray-700 font-semibold mt-2">
                Profit: ${calculateProfit(event).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Total Profit */}
        <div className="mt-6 p-4 bg-blue-100 rounded shadow">
          <h3 className="text-lg font-bold text-blue-800">
            Total Profit: ${totalProfit.toFixed(2)}
          </h3>
        </div>
      </div>
    </div>
  );
}
