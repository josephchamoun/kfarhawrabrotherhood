/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaEdit,
  FaTimes,
  FaTag,
  FaCalendarAlt,
  FaAlignLeft,
  FaLink,
  FaStickyNote,
  FaSave,
} from "react-icons/fa";
import api from "../api/api";
import type { Event } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onUpdated: (event: Event) => void;
  canEdit: boolean;
}

export default function EditEventDetailsModal({
  open,
  onClose,
  event,
  onUpdated,
  canEdit,
}: Props) {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        type: event.type,
        notes: event.notes,
        drive_link: event.drive_Link,
        event_date: event.event_date,
      });
    }
  }, [event]);

  if (!open || !event) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/events/${event.id}/details`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      onUpdated(res.data.event);
      onClose();
    } catch {
      alert("Failed to update event details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all animate-slideUp max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="edit-event-pattern"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M20 5 L20 35 M5 20 L35 20"
                    stroke="white"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#edit-event-pattern)"
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaEdit className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Event Details</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {canEdit
                    ? "Update event information"
                    : "View event details (read-only)"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="space-y-5">
            {/* Read-only notice */}
            {!canEdit && (
              <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded-lg">
                <p className="font-semibold text-sm">
                  You are viewing this event in read-only mode. Only admins can
                  edit event details.
                </p>
              </div>
            )}

            {/* Title (READ ONLY) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaTag className="text-gray-400" />
                Event Title
                <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Read-only
                </span>
              </label>
              <input
                type="text"
                value={form.title || ""}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Event Date (READ ONLY) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaCalendarAlt className="text-gray-400" />
                Event Date
                <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Read-only
                </span>
              </label>
              <input
                type="text"
                value={form.event_date || ""}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaTag
                  className={canEdit ? "text-blue-600" : "text-gray-400"}
                />
                Event Type
              </label>
              <input
                type="text"
                name="type"
                value={form.type || ""}
                onChange={handleChange}
                disabled={!canEdit}
                placeholder="e.g., Prayer, Festival"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                  canEdit
                    ? "border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-gray-900 placeholder-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaAlignLeft
                  className={canEdit ? "text-blue-600" : "text-gray-400"}
                />
                Description
              </label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                disabled={!canEdit}
                rows={4}
                placeholder="Enter event description"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all resize-none ${
                  canEdit
                    ? "border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-gray-900 placeholder-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Drive Link */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaLink
                  className={canEdit ? "text-blue-600" : "text-gray-400"}
                />
                Google Drive Link
              </label>
              <input
                type="url"
                name="drive_link"
                value={form.drive_link || ""}
                onChange={handleChange}
                disabled={!canEdit}
                placeholder="https://drive.google.com/..."
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                  canEdit
                    ? "border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-gray-900 placeholder-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaStickyNote
                  className={canEdit ? "text-blue-600" : "text-gray-400"}
                />
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
                disabled={!canEdit}
                rows={4}
                placeholder="Additional notes"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all resize-none ${
                  canEdit
                    ? "border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-gray-900 placeholder-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all transform hover:scale-105"
          >
            {canEdit ? "Cancel" : "Close"}
          </button>

          {canEdit && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaSave />
                  Save Changes
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
