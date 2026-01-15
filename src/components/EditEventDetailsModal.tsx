/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import type { Event } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onUpdated: (event: Event) => void;
  canEdit: boolean; // ONLY Amin Ser = true
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Edit Event Details</h2>

        {/* Title (READ ONLY) */}
        <label className="block text-sm font-medium">Title</label>
        <input
          value={form.title || ""}
          disabled
          className="w-full border rounded px-3 py-2 mb-3 bg-gray-100"
        />

        {/* Event Date (READ ONLY) */}
        <label className="block text-sm font-medium">Event Date</label>
        <input
          value={form.event_date || ""}
          disabled
          className="w-full border rounded px-3 py-2 mb-3 bg-gray-100"
        />

        {/* Type */}
        <label className="block text-sm font-medium">Type</label>
        <input
          name="type"
          value={form.type || ""}
          onChange={handleChange}
          disabled={!canEdit}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        {/* Description */}
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          disabled={!canEdit}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        {/* Drive Link */}
        <label className="block text-sm font-medium">Drive Link</label>
        <input
          name="drive_link"
          value={form.drive_link || ""}
          onChange={handleChange}
          disabled={!canEdit}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        {/* Notes */}
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          disabled={!canEdit}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>

          {canEdit && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSubmit}
              disabled={loading}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
