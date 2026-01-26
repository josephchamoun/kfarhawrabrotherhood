import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import EditMoneyboxModal from "../components/EditMoneyboxModal";
import type { Moneybox, UserInfo } from "../types";

export default function MoneyPage() {
  const user: UserInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  const [moneyboxes, setMoneyboxes] = useState<Moneybox[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Moneybox | null>(null);

  /* ---------------- PERMISSIONS ---------------- */
  const canEditMoneybox = (box: Moneybox) => {
    if (user?.is_global_admin || user?.is_super_admin) return true;

    const sectionRolesMap: Record<number, string[]> = {
      1: ["Chabiba President", "Ne2b al Ra2is", "Amin Sandou2"],
      2: ["Talaee President", "Ne2b al Ra2is", "Amin Sandou2"],
      3: ["Forsan President", "Ne2b al Ra2is", "Amin Sandou2"],
    };

    return user.roles?.some(
      (r) =>
        r.section_id === box.section_id &&
        sectionRolesMap[box.section_id]?.includes(r.role_name),
    );
  };

  /* ---------------- SECTION NAME & THEMES ---------------- */
  const sectionNames: Record<number, string> = {
    1: "Chabiba",
    2: "Talaee",
    3: "Forsan",
  };

  const sectionThemes: Record<number, string> = {
    1: "from-yellow-500 to-amber-500",
    2: "from-red-600 to-rose-600",
    3: "from-blue-600 to-indigo-600",
  };

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchMoneyboxes = async () => {
      try {
        const res = await api.get("/moneyboxes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setMoneyboxes(res.data);
      } catch {
        setMoneyboxes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMoneyboxes();
  }, []);

  const totalAmount = moneyboxes.reduce(
    (sum, box) => sum + parseFloat(String(box.amount || 0)),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Moneyboxes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track and manage section funds
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
              <p className="text-gray-600">Loading moneyboxes...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Total Summary Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-white/90 text-sm sm:text-base font-medium mb-1">
                    Total Balance
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                    ${totalAmount.toFixed(2)}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 text-white/20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Moneyboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {moneyboxes.map((box) => {
                const canEdit = canEditMoneybox(box);
                const gradient = sectionThemes[box.section_id];
                const sectionName = sectionNames[box.section_id];
                const amount = parseFloat(String(box.amount || 0));

                return (
                  <div
                    key={box.id}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Card Header */}
                    <div
                      className={`bg-gradient-to-r ${gradient} p-6 sm:p-8 text-center relative overflow-hidden`}
                    >
                      {/* Decorative circles */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 relative z-10">
                        {sectionName}
                      </h2>

                      {/* Amount Display */}
                      <div className="relative z-10">
                        <div className="inline-flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-bold text-white/90">
                            $
                          </span>
                          <span className="text-5xl sm:text-6xl font-bold text-white">
                            {amount.toFixed(0)}
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold text-white/90">
                            .{(amount % 1).toFixed(2).split(".")[1]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6">
                      {canEdit ? (
                        <button
                          onClick={() => {
                            setSelectedBox(box);
                            setModalOpen(true);
                          }}
                          className={`w-full px-6 py-3 sm:py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r ${gradient} hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2`}
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Amount
                        </button>
                      ) : (
                        <div className="w-full px-6 py-3 sm:py-3.5 rounded-xl text-gray-500 bg-gray-100 border-2 border-gray-200 text-center font-medium text-sm sm:text-base flex items-center justify-center gap-2">
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Only
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedBox && (
        <EditMoneyboxModal
          open={modalOpen}
          moneybox={selectedBox}
          onClose={() => {
            setModalOpen(false);
            setSelectedBox(null);
          }}
          onSaved={(newAmount) => {
            setMoneyboxes((prev) =>
              prev.map((m) =>
                m.id === selectedBox.id ? { ...m, amount: newAmount } : m,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
