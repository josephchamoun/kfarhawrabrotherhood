/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import api from "../api/api";
import type { Event } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (event: Event) => void;
}

export default function AddEventModal({ open, onClose, onCreated }: Props) {
  const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [form, setForm] = useState({
    title: "",
    type: "",

    description: "",
    event_date: now,
    total_spent: "0",
    total_revenue: "0",
    notes: "",
    drive_link: "",

    sections: [] as number[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        event_date: form.event_date || now,
      };

      const res = await api.post("/addevent", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      onCreated({
        ...res.data.event,
        sections: [],
      });

      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-md space-y-3"
      >
        <h2 className="text-xl font-bold">Add Event</h2>

        {/* REQUIRED */}
        <input
          name="title"
          placeholder="Title *"
          required
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="type"
          placeholder="Type *"
          required
          value={form.type}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        {/* OPTIONAL */}
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="date"
          name="event_date"
          value={form.event_date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="number"
          name="total_spent"
          placeholder="Total Spent"
          value={form.total_spent}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="number"
          name="total_revenue"
          placeholder="Total Revenue"
          value={form.total_revenue}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="url"
          name="drive_link"
          placeholder="Google Drive link (optional)"
          value={form.drive_link}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-gray-500">
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-white transition
              ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
