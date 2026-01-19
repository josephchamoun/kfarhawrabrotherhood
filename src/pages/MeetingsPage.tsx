/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FaLink, FaPlus, FaUsers } from "react-icons/fa";
import Navbar from "../components/Navbar";
import api from "../api/api";

interface MeetingSection {
  key: "chabiba" | "tala2e3" | "forsan";
  title: string;
  driveLinks: string[]; // one link per section in your case
}

export default function MeetingsPage() {
  const user = JSON.parse(localStorage.getItem("user_info") || "{}");

  const [sections, setSections] = useState<MeetingSection[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- PERMISSIONS ---------------- */
  const canManageSection = (sectionKey: string) => {
    return (
      user?.is_global_admin ||
      user?.roles?.some(
        (r: any) =>
          r.section_key === sectionKey &&
          ["President", "Ne2b al Ra2is", "wakil tanchi2a"].includes(
            r.role_name,
          ),
      )
    );
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

        // Transform backend sections to frontend format
        const transformed = res.data.map((section: any) => ({
          key: section.name.toLowerCase(), // "chabiba", "talaee", "forsan"
          title: section.name + " Meetings",
          driveLinks: section.meetings?.map((m: any) => m.drive_link) ?? [],
        }));

        setSections(transformed);
      } catch {
        // fallback if backend fails
        setSections([
          { key: "chabiba", title: "Chabiba Meetings", driveLinks: [] },
          { key: "tala2e3", title: "Tala2e3 Meetings", driveLinks: [] },
          { key: "forsan", title: "Forsan Meetings", driveLinks: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  /* ---------------- ADD LINK ---------------- */
  const addDriveLink = (sectionKey: string) => {
    const link = prompt("Paste Google Drive link:");
    if (!link) return;

    setSections((prev) =>
      prev.map((s) =>
        s.key === sectionKey
          ? { ...s, driveLinks: [link] } // one link per section
          : s,
      ),
    );

    // TODO: POST to backend
    // await api.post(`/meetings/${sectionKey}/drive-link`, { link })
  };

  /* ===================================================== */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">
          Meetings Archive
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section) => {
              const canEdit = canManageSection(section.key);

              return (
                <div
                  key={section.key}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-blue-600"
                >
                  {/* HEADER */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                        <FaUsers className="text-white text-xl" />
                      </div>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-6 space-y-4">
                    {(!section.driveLinks ||
                      section.driveLinks.length === 0) && (
                      <p className="text-gray-500 text-sm">
                        No meeting links added yet.
                      </p>
                    )}

                    {section.driveLinks
                      ?.filter((link) => link) // remove undefined / empty
                      .map((link) => (
                        <a
                          key={`${section.key}-${link}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border hover:bg-blue-50 transition"
                        >
                          <FaLink className="text-blue-600" />
                          <span className="text-sm text-gray-700 truncate">
                            {link}
                          </span>
                        </a>
                      ))}
                  </div>

                  {/* FOOTER */}
                  {canEdit && (
                    <div className="p-6 border-t bg-gray-50">
                      <button
                        onClick={() => addDriveLink(section.key)}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
                      >
                        <FaPlus />
                        Add Drive Link
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
