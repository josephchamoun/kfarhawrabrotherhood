/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FaUsers, FaTimes, FaPlus } from "react-icons/fa";
import api from "../api/api";

interface Props {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
  userSections: Section[];
}

interface Section {
  id: number;
  name: string;
}

export default function AddToSectionModal({
  userId,
  onClose,
  onSuccess,
}: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sections from backend
  useEffect(() => {
    api
      .get("/sections", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setSections(res.data))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((_err) => setError("Failed to fetch sections"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return setError("Please select a section");

    setLoading(true);
    setError(null);

    try {
      await api.post(
        `/user/${userId}/add-to-section`,
        { section_id: selectedSection },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add user to section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-t-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="section-modal-pattern"
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
                fill="url(#section-modal-pattern)"
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Add to Section</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Assign user to a section
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

        {/* Body */}
        <div className="p-8">
          <div className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Section Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FaUsers className="text-blue-600" />
                Select Section
              </label>

              <div className="space-y-3">
                {sections.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaUsers className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">Loading sections...</p>
                  </div>
                ) : (
                  sections.map((section) => (
                    <label
                      key={section.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedSection === section.id
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="section"
                        value={section.id}
                        checked={selectedSection === section.id}
                        onChange={(e) =>
                          setSelectedSection(Number(e.target.value))
                        }
                        className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedSection === section.id
                              ? "bg-blue-600"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaUsers
                            className={`text-lg ${
                              selectedSection === section.id
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <span
                          className={`font-semibold ${
                            selectedSection === section.id
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {section.name}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedSection}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                Adding...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaPlus />
                Add to Section
              </span>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
