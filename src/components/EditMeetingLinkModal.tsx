/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "../api/api";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  section: any;
  onClose: () => void;
  onSaved: (link: string) => void;
}

// ✅ URL validator
const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export default function EditMeetingLinkModal({
  open,
  section,
  onClose,
  onSaved,
}: Props) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill existing link
  useEffect(() => {
    setLink(section?.driveLinks?.[0] ?? "");
    setError(null);
  }, [section]);

  if (!open || !section) return null;

  const submit = async () => {
    setError(null);

    // ❌ Empty input
    if (!link) {
      setError("Link is required");
      return;
    }

    // ❌ Invalid URL
    if (!isValidUrl(link)) {
      setError("Please enter a valid link (https://...)");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/addmeetinglink",
        {
          section_id: section.id,
          drive_link: link,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      onSaved(link);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to save link. Please check the URL.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !link || !isValidUrl(link);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Edit {section.title}
        </h2>

        <input
          type="text"
          placeholder="https://drive.google.com/..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 ${
            error
              ? "border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
          }`}
        />

        {/* ❌ Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isDisabled}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
