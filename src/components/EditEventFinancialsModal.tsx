/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaDollarSign,
  FaTimes,
  FaChartLine,
  FaSave,
  FaArrowUp,
  FaArrowDown,
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

  const revenue = parseFloat(form.total_revenue || 0);
  const spent = parseFloat(form.total_spent || 0);
  const profit = revenue - spent;
  const isProfit = profit >= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-t-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="financials-pattern"
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
                fill="url(#financials-pattern)"
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaDollarSign className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Event Financials</h2>
                <p className="text-emerald-100 text-sm mt-1">
                  {canEdit
                    ? "Manage revenue and expenses"
                    : "View financial details (read-only)"}
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

        {/* Body */}
        <div className="p-8">
          <div className="space-y-5">
            {/* Read-only notice */}
            {!canEdit && (
              <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-4 rounded-lg">
                <p className="font-semibold text-sm">
                  You are viewing financials in read-only mode. Only treasurers
                  can edit financial data.
                </p>
              </div>
            )}

            {/* Total Revenue */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <FaArrowUp className="text-green-600" />
                </div>
                Total Revenue
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  name="total_revenue"
                  value={form.total_revenue || ""}
                  onChange={handleChange}
                  disabled={!canEdit}
                  placeholder="0.00"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all ${
                    canEdit
                      ? "border-gray-200 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-600 text-gray-900 placeholder-gray-400"
                      : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            {/* Total Spent */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <FaArrowDown className="text-red-600" />
                </div>
                Total Spent
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  name="total_spent"
                  value={form.total_spent || ""}
                  onChange={handleChange}
                  disabled={!canEdit}
                  placeholder="0.00"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all ${
                    canEdit
                      ? "border-gray-200 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600 text-gray-900 placeholder-gray-400"
                      : "border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
                  }`}
                />
              </div>
            </div>

            {/* Profit/Loss Card */}
            <div
              className={`p-6 rounded-xl border-2 ${
                isProfit
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isProfit ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {isProfit ? "Net Profit" : "Net Loss"}
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        isProfit ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      ${Math.abs(profit).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    isProfit
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {isProfit ? "+" : "-"}${Math.abs(profit).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-green-600">
                  +${revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expenses</span>
                <span className="font-semibold text-red-600">
                  -${spent.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                <span className="text-gray-700">Balance</span>
                <span className={isProfit ? "text-green-600" : "text-red-600"}>
                  ${profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex gap-3">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
