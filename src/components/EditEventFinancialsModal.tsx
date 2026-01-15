/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import type { Event } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onUpdated: (event: Event) => void;
  canEdit: boolean;
}

export default function EditEventFinancialsModal({
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
        total_spent: event.total_spent,
        total_revenue: event.total_revenue,
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
      const res = await api.put(`/events/${event.id}/financials`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      onUpdated(res.data.event);
      onClose();
    } catch {
      alert("Failed to update financials");
    } finally {
      setLoading(false);
    }
  };

  const profit =
    parseFloat(form.total_revenue || 0) - parseFloat(form.total_spent || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Edit Financials</h2>

        {!canEdit && (
          <p className="text-sm text-gray-500 mb-3">
            You can view financials but you cannot edit them.
          </p>
        )}

        <label className="block text-sm font-medium">Total Revenue</label>
        <input
          type="number"
          name="total_revenue"
          value={form.total_revenue || ""}
          onChange={handleChange}
          disabled={!canEdit}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        <label className="block text-sm font-medium">Total Spent</label>
        <input
          type="number"
          name="total_spent"
          value={form.total_spent || ""}
          onChange={handleChange}
          disabled={!canEdit}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        <p className="font-semibold mt-2">Profit: ${profit.toFixed(2)}</p>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Close
          </button>

          {canEdit && (
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded"
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
