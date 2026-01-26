/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import AddElectionModal from "../components/AddElectionModal";
import type { Election, UserInfo } from "../types";

export default function ElectionsPage() {
  const user: UserInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const canManageSection = (sectionId: number) => {
    if (user.is_global_admin || user.is_super_admin) return true;

    const sectionRolesMap: Record<number, string[]> = {
      1: ["President", "Ne2b al Ra2is"],
      2: ["President", "Ne2b al Ra2is"],
      3: ["President", "Ne2b al Ra2is"],
    };

    return user.roles?.some(
      (r) =>
        r.section_id === sectionId &&
        sectionRolesMap[sectionId].includes(r.role_name),
    );
  };

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get("/elections", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setElections(res.data);
      } catch {
        setElections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    election: Election | null;
  }>({
    open: false,
    election: null,
  });

  const deleteElection = async (election: Election) => {
    setDeleteConfirm({ open: true, election });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.election) return;

    try {
      await api.delete(`/elections/${deleteConfirm.election.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setElections((prev) =>
        prev.filter((e) => e.id !== deleteConfirm.election!.id),
      );
      setDeleteConfirm({ open: false, election: null });
    } catch (err) {
      alert("Failed to delete election");
    }
  };

  const sectionColors: Record<number, string> = {
    1: "from-yellow-500 to-amber-500",
    2: "from-red-600 to-rose-600",
    3: "from-blue-600 to-indigo-600",
  };

  const groupedElections = elections.reduce(
    (acc, e) => {
      if (!acc[e.section_id]) acc[e.section_id] = [];
      acc[e.section_id].push(e);
      return acc;
    },
    {} as Record<number, Election[]>,
  );

  const sections = [
    { id: 1, name: "Chabiba" },
    { id: 2, name: "Talaee" },
    { id: 3, name: "Forsan" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Elections
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and view elections across all sections
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
              <p className="text-gray-600">Loading elections...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {sections.map((section) => {
              const canManage = canManageSection(section.id);
              const gradient = sectionColors[section.id];
              const sectionElections = groupedElections[section.id] || [];
              const electionCount = sectionElections.length;

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Section Header */}
                  <div className={`bg-gradient-to-r ${gradient} p-5 sm:p-6`}>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {section.name}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {electionCount}{" "}
                      {electionCount === 1 ? "Election" : "Elections"}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    {canManage && (
                      <button
                        onClick={() => {
                          setSelectedSection(section);
                          setModalOpen(true);
                        }}
                        className={`w-full py-3 sm:py-3.5 mb-5 rounded-xl text-white font-semibold bg-gradient-to-r ${gradient} hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] text-sm sm:text-base`}
                      >
                        + Add Election
                      </button>
                    )}

                    {/* Elections List */}
                    <div className="space-y-3">
                      {sectionElections.length > 0 ? (
                        sectionElections.map((e) => (
                          <div
                            key={e.id}
                            className="group p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 mb-1.5 text-sm sm:text-base truncate">
                                  {e.title}
                                </p>
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {new Date(
                                      e.election_date,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              {canManage && (
                                <button
                                  onClick={() => deleteElection(e)}
                                  className="px-3 py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex-shrink-0 font-medium shadow-sm hover:shadow active:scale-95 transform"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 px-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-300 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p className="text-gray-400 text-sm font-medium">
                            No elections yet
                          </p>
                          {canManage && (
                            <p className="text-gray-400 text-xs mt-1">
                              Click "Add Election" to create one
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedSection && (
        <AddElectionModal
          open={modalOpen}
          sectionId={selectedSection.id}
          sectionName={selectedSection.name}
          onClose={() => {
            setModalOpen(false);
            setSelectedSection(null);
          }}
          onSaved={(newElection) => {
            setElections((prev) => [...prev, newElection]);
          }}
        />
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && deleteConfirm.election && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={() => setDeleteConfirm({ open: false, election: null })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Election
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    "{deleteConfirm.election.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteConfirm({ open: false, election: null })
                }
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold text-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Election
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
