/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaLink,
  FaUsers,
  FaEdit,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaLock,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import api from "../api/api";
import EditMeetingLinkModal from "../components/EditMeetingLinkModal";

interface MeetingSection {
  id: number;
  key: "chabiba" | "talaee" | "forsan";
  title: string;
  driveLinks: string[];
}

export default function MeetingsPage() {
  const user = JSON.parse(localStorage.getItem("user_info") || "{}");

  const [sections, setSections] = useState<MeetingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<MeetingSection | null>(
    null,
  );

  /* ---------------- PERMISSIONS ---------------- */
  const canManageSection = (sectionId: number) => {
    if (user?.is_global_admin || user?.is_super_admin) return true;

    const presidentMap: Record<number, string> = {
      1: "Chabiba President",
      2: "Tala2e3 President",
      3: "Forsan President",
    };

    return user?.roles?.some((r: any) => {
      if (r.section_id !== sectionId) return false;
      if (r.role_name === presidentMap[sectionId]) return true;
      return ["Ne2b al Ra2is", "wakil tanchi2a"].includes(r.role_name);
    });
  };

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get("/meetings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        const transformed = res.data.map((section: any) => ({
          id: section.id,
          key: section.name.toLowerCase(),
          title: section.name + " Meetings",
          driveLinks: section.meetings?.map((m: any) => m.drive_link) ?? [],
        }));

        setSections(transformed);
      } catch {
        setSections([
          { key: "chabiba", id: 1, title: "Chabiba Meetings", driveLinks: [] },
          { key: "talaee", id: 2, title: "Tala2e3 Meetings", driveLinks: [] },
          { key: "forsan", id: 3, title: "Forsan Meetings", driveLinks: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Color themes for each section
  const sectionThemes = {
    chabiba: {
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50",
      border: "border-yellow-500",
      text: "text-yellow-600",
      hover: "hover:bg-yellow-50",
      icon: "text-yellow-600",
    },
    talaee: {
      gradient: "from-red-600 to-rose-600",
      bgGradient: "from-red-50 to-rose-50",
      border: "border-red-500",
      text: "text-red-600",
      hover: "hover:bg-red-50",
      icon: "text-red-600",
    },
    forsan: {
      gradient: "from-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      border: "border-blue-500",
      text: "text-blue-600",
      hover: "hover:bg-blue-50",
      icon: "text-blue-600",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Meetings Archive
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Access meeting records and links for all sections
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const canEdit = canManageSection(section.id);
              const theme = sectionThemes[section.key] || sectionThemes.chabiba;

              return (
                <div
                  key={section.key}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  {/* Gradient Top Bar */}
                  <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />

                  {/* Header */}
                  <div
                    className={`bg-gradient-to-br ${theme.bgGradient} p-6 border-b border-gray-100`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <FaUsers className="text-white text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {section.title}
                          </h2>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {section.driveLinks?.length || 0}{" "}
                            {section.driveLinks?.length === 1
                              ? "link"
                              : "links"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {/* Empty State */}
                    {section.driveLinks?.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaLink className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">
                          No meetings yet
                        </p>
                        <p className="text-sm text-gray-500">
                          {canEdit
                            ? "Add your first meeting link below"
                            : "Check back later for updates"}
                        </p>
                      </div>
                    )}

                    {/* Meeting Links */}
                    <div className="space-y-3 mb-4">
                      {section.driveLinks?.map((link, idx) => (
                        <div
                          key={link}
                          className={`group/link flex items-center gap-3 p-4 rounded-xl border-2 ${theme.border} ${theme.hover} transition-all`}
                        >
                          <div
                            className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border ${theme.border}`}
                          >
                            <FaLink className={theme.icon} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-semibold mb-1">
                              Meeting Link #{idx + 1}
                            </p>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-medium ${theme.text} hover:underline truncate block group-hover/link:text-opacity-80`}
                            >
                              {link}
                            </a>
                          </div>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border ${theme.border} ${theme.hover} transition-all`}
                          >
                            <FaExternalLinkAlt className={theme.icon} />
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Edit Button */}
                    {canEdit ? (
                      <button
                        onClick={() => {
                          setSelectedSection(section);
                          setModalOpen(true);
                        }}
                        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-105`}
                      >
                        <FaEdit className="text-lg" />
                        <span>Edit Meeting Link</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-4 rounded-xl">
                        <FaLock />
                        <span className="text-sm font-medium">View Only</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedSection && (
        <EditMeetingLinkModal
          open={modalOpen}
          section={selectedSection}
          onClose={() => {
            setModalOpen(false);
            setSelectedSection(null);
          }}
          onSaved={(link) => {
            setSections((prev) =>
              prev.map((s) =>
                s.key === selectedSection.key
                  ? { ...s, driveLinks: [link] }
                  : s,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
