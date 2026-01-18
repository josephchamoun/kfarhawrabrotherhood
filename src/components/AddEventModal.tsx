/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaTimes,
  FaTag,
  FaAlignLeft,
  FaDollarSign,
  FaStickyNote,
  FaLink,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import api from "../api/api";
import type { Event } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (event: Event) => void;
  isGlobalAdmin: boolean;
}

export default function AddEventModal({
  open,
  onClose,
  onCreated,
  isGlobalAdmin,
}: Props) {
  const now = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    event_date: now,
    total_spent: "0",
    total_revenue: "0",
    notes: "",
    drive_link: "",
    shared_event: false,
  });

  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        type: "",
        description: "",
        event_date: now,
        total_spent: "0",
        total_revenue: "0",
        notes: "",
        drive_link: "",
        shared_event: false,
      });
      setSelectedSections([]);
      setShowOptional(false);
    }
  }, [open, now]);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.currentTarget;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.currentTarget;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let sectionsToSend = [...selectedSections];
      if (sectionsToSend.includes(4)) {
        sectionsToSend = [1, 2, 3];
      }

      const payload = {
        title: form.title,
        type: form.type,
        description: form.description,
        event_date: form.event_date || now,
        total_spent: form.total_spent,
        total_revenue: form.total_revenue,
        notes: form.notes,
        drive_link: form.drive_link,
        shared_event: form.shared_event,
        sections: isGlobalAdmin ? sectionsToSend : undefined,
      };

      const res = await api.post("/addevent", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      onCreated(res.data.event);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <form
        onSubmit={handleSubmit}
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
                  id="event-modal-pattern"
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
                fill="url(#event-modal-pattern)"
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Add New Event</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Create a community event
                </p>
              </div>
            </div>

            <button
              type="button"
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
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaTag className="text-blue-600" />
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter event title"
                required
                value={form.title}
                onChange={handleFieldChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Type and Date - Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaTag className="text-blue-600" />
                  Event Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="type"
                  placeholder="e.g., Prayer, Festival"
                  required
                  value={form.type}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaCalendarAlt className="text-blue-600" />
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={form.event_date}
                  onChange={handleFieldChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Global Admin Section Selector */}
            {isGlobalAdmin && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaUsers className="text-blue-600" />
                  Select Sections
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 1, name: "Chabiba" },
                    { id: 2, name: "Tala2e3" },
                    { id: 3, name: "Forsan" },
                    { id: 4, name: "Shared (All)" },
                  ].map((section) => (
                    <label
                      key={section.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedSections.includes(section.id)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.includes(section.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSections([
                              ...selectedSections,
                              section.id,
                            ]);
                          } else {
                            setSelectedSections(
                              selectedSections.filter((s) => s !== section.id),
                            );
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">
                        {section.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Event Checkbox (Non-Admin) */}
            {!isGlobalAdmin && (
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  name="shared_event"
                  checked={form.shared_event}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">
                  Mark as Shared Event
                </span>
              </label>
            )}

            {/* Optional Fields Accordion */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-700">
                  Optional Fields
                </span>
                {showOptional ? (
                  <FaChevronUp className="text-gray-600" />
                ) : (
                  <FaChevronDown className="text-gray-600" />
                )}
              </button>

              {showOptional && (
                <div className="p-5 space-y-5 bg-white">
                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaAlignLeft className="text-blue-600" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Enter event description"
                      value={form.description}
                      onChange={handleFieldChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>

                  {/* Financial Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FaDollarSign className="text-red-600" />
                        Total Spent
                      </label>
                      <input
                        type="number"
                        name="total_spent"
                        placeholder="0"
                        value={form.total_spent}
                        onChange={handleFieldChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FaDollarSign className="text-green-600" />
                        Total Revenue
                      </label>
                      <input
                        type="number"
                        name="total_revenue"
                        placeholder="0"
                        value={form.total_revenue}
                        onChange={handleFieldChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaStickyNote className="text-blue-600" />
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      placeholder="Additional notes"
                      value={form.notes}
                      onChange={handleFieldChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>

                  {/* Drive Link */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FaLink className="text-blue-600" />
                      Google Drive Link
                    </label>
                    <input
                      type="url"
                      name="drive_link"
                      placeholder="https://drive.google.com/..."
                      value={form.drive_link}
                      onChange={handleFieldChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
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
                Creating...
              </span>
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>

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
