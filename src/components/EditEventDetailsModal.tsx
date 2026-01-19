/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaEdit,
  FaTimes,
  FaCalendarAlt,
  FaTag,
  FaAlignLeft,
  FaStickyNote,
  FaLink,
  FaSave,
} from "react-icons/fa";
import api from "../api/api";
import type { Event } from "../types";

/* =====================================================
   TYPES
===================================================== */

type EditMode = "full" | "description" | "none";

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onUpdated: (event: Event) => void;
  editMode: EditMode;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function EditEventDetailsModal({
  open,
  onClose,
  event,
  onUpdated,
  editMode,
}: Props) {
  /* ---------------- STATE ---------------- */

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    notes: "",
    drive_link: "",
    event_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEditFull = editMode === "full";
  const canEditDescription = editMode === "description";
  const canEditAnything = editMode !== "none";

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title ?? "",
        description: event.description ?? "",
        type: event.type ?? "",
        notes: event.notes ?? "",
        drive_link: event.drive_Link ?? "",
        event_date: event.event_date ?? "",
      });
    }
  }, [event]);

  if (!open || !event) return null;

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    let payload: any = {};

    if (editMode === "description") {
      payload = {
        description: form.description,
      };
    } else if (editMode === "full") {
      payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        notes: form.notes,
        drive_link: form.drive_link,
        event_date: form.event_date,
      };
    } else {
      setLoading(false);
      return;
    }

    try {
      const res = await api.put(`/events/${event.id}/details`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      onUpdated(res.data.event);
      onClose();
    } catch (err) {
      setError("Failed to update event details");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaEdit className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Event Details</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {editMode === "full" && "You can edit all event details"}
                  {editMode === "description" &&
                    "You can edit the description only"}
                  {editMode === "none" && "Read-only event view"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {error}
            </div>
          )}

          {editMode === "description" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded">
              You are allowed to update the event description only.
            </div>
          )}

          {editMode === "none" && (
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded">
              You do not have permission to edit this event.
            </div>
          )}

          {/* -------- TITLE -------- */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Event Title
            </label>
            <div className="relative">
              <FaTag className="absolute left-3 top-3.5 text-gray-400" />
              <input
                value={form.title}
                disabled
                className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          {/* -------- DATE -------- */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Event Date
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
              <input
                value={form.event_date}
                disabled
                className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          {/* -------- TYPE -------- */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Event Type
            </label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={!canEditFull}
              className={`w-full px-4 py-3 border-2 rounded-xl ${
                canEditFull
                  ? "border-gray-200"
                  : "bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>

          {/* -------- DESCRIPTION -------- */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Description
            </label>
            <div className="relative">
              <FaAlignLeft className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                disabled={!(canEditFull || canEditDescription)}
                className={`pl-10 w-full px-4 py-3 border-2 rounded-xl resize-none ${
                  canEditFull || canEditDescription
                    ? "border-gray-200"
                    : "bg-gray-50 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* -------- DRIVE LINK -------- */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Drive Link
            </label>
            <div className="relative">
              <FaLink className="absolute left-3 top-3.5 text-gray-400" />
              <input
                name="drive_link"
                value={form.drive_link}
                onChange={handleChange}
                disabled={!canEditFull}
                className={`pl-10 w-full px-4 py-3 border-2 rounded-xl ${
                  canEditFull
                    ? "border-gray-200"
                    : "bg-gray-50 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* -------- NOTES -------- */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Notes
            </label>
            <div className="relative">
              <FaStickyNote className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                disabled={!canEditFull}
                className={`pl-10 w-full px-4 py-3 border-2 rounded-xl resize-none ${
                  canEditFull
                    ? "border-gray-200"
                    : "bg-gray-50 cursor-not-allowed"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="border-t bg-gray-50 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl"
          >
            {canEditAnything ? "Cancel" : "Close"}
          </button>

          {canEditAnything && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl disabled:opacity-50"
            >
              <FaSave className="inline mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* ================= ANIMATIONS ================= */}
      <style>{`
        .animate-slideUp {
          animation: slideUp .3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
