import { useState } from "react";
import Navbar from "../components/Navbar";
import EditMoneyboxModal from "../components/EditMoneyboxModal";
import TransactionModal from "../components/TransactionModal";
import { useMoneyboxes } from "../hooks/useMoneyboxes";
import api from "../api/api";
import type { Moneybox, MoneyTransaction, UserInfo } from "../types";

// ─── Section config ───────────────────────────────────────────────────────────
const SECTION_CONFIG: Record<
  number,
  {
    name: string;
    accent: string;
    soft: string;
    border: string;
    text: string;
    badge: string;
  }
> = {
  1: {
    name: "Chabiba",
    accent: "from-amber-400 to-yellow-500",
    soft: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  2: {
    name: "Tala2e3",
    accent: "from-rose-400 to-red-500",
    soft: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-800",
  },
  3: {
    name: "Forsan",
    accent: "from-blue-400 to-indigo-500",
    soft: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
  },
};

// ─── Permissions ──────────────────────────────────────────────────────────────
function usePermissions(user: UserInfo) {
  const isHighAdmin = user?.is_global_admin || user?.is_super_admin;

  // Amin Sandou2 of section 1 = can do everything (edit moneybox + transactions for ALL sections)
  const isAminSandou2Section1 =
    !isHighAdmin &&
    user?.roles?.some(
      (r) => r.section_id === 1 && r.role_name === "Amin Sandou2",
    );

  const canEditMoneybox = (box: Moneybox): boolean => {
    if (isHighAdmin || isAminSandou2Section1) return true;
    return !!user?.roles?.some(
      (r) => r.section_id === box.section_id && r.role_name === "Amin Sandou2",
    );
  };

  // Only admins and Amin Sandou2 of section 1 can manage transactions
  const canManageTransactions = isHighAdmin || !!isAminSandou2Section1;

  return { isHighAdmin, canEditMoneybox, canManageTransactions };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({
  txn,
  canManage,
  onEdit,
  onDelete,
}: {
  txn: MoneyTransaction;
  canManage: boolean;
  onEdit: (t: MoneyTransaction) => void;
  onDelete: (id: number) => void;
}) {
  const isIncome = txn.type === "income";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 group">
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isIncome ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        <svg
          className={`w-4 h-4 ${isIncome ? "text-emerald-600" : "text-red-500"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isIncome ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          )}
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {txn.description || (isIncome ? "Income" : "Expense")}
        </p>
        <p className="text-xs text-gray-400">
          {txn.source === "manual" ? "Manual" : txn.source} ·{" "}
          {timeAgo(txn.created_at)}
        </p>
      </div>

      {/* Amount */}
      <span
        className={`text-sm font-bold flex-shrink-0 ${
          isIncome ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {isIncome ? "+" : "-"}${formatAmount(Math.abs(txn.amount))}
      </span>

      {/* Actions (only for admins/amin sandou2 section 1) */}
      {canManage && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(txn)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
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
          </button>
          <button
            onClick={() => onDelete(txn.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
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
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MoneyPage() {
  const user: UserInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
  const { moneyboxes, transactions, loading, syncing, refetch } =
    useMoneyboxes();
  const { canEditMoneybox, canManageTransactions } = usePermissions(user);

  // Moneybox edit modal
  const [editBoxOpen, setEditBoxOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Moneybox | null>(null);

  // Transaction modal
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<MoneyTransaction | null>(null);
  const [txnMoneyboxId, setTxnMoneyboxId] = useState<number>(0);

  // Expanded section (which card shows transactions)
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const totalAmount = moneyboxes.reduce(
    (sum: number, box: Moneybox) => sum + parseFloat(String(box.amount || 0)),
    0,
  );

  const openAddTxn = (moneyboxId: number) => {
    setEditingTxn(null);
    setTxnMoneyboxId(moneyboxId);
    setTxnModalOpen(true);
  };

  const openEditTxn = (txn: MoneyTransaction) => {
    setEditingTxn(txn);
    setTxnMoneyboxId(txn.moneybox_id);
    setTxnModalOpen(true);
  };

  const deleteTxn = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      refetch();
    } catch {
      alert("Failed to delete transaction");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Treasury
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Section funds & transactions
            </p>
          </div>
          {syncing && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Syncing…
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading treasury…</p>
          </div>
        ) : (
          <>
            {/* ── Total Card ── */}
            <div className="relative overflow-hidden bg-gray-900 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl">
              {/* subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 24px,white 24px,white 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,white 24px,white 25px)`,
                }}
              />
              <div className="relative">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Total Balance
                </p>
                <p className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
                  ${formatAmount(totalAmount)}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Across {moneyboxes.length} section
                  {moneyboxes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* ── Section Cards ── */}
            <div className="grid grid-cols-1 gap-4">
              {moneyboxes.map((box: Moneybox) => {
                const cfg = SECTION_CONFIG[box.section_id] ?? SECTION_CONFIG[1];
                const canEdit = canEditMoneybox(box);
                const amount = parseFloat(String(box.amount || 0));
                const isExpanded = expandedSection === box.section_id;
                const boxTxns = transactions
                  .filter((t: MoneyTransaction) => t.moneybox_id === box.id)
                  .sort(
                    (a: MoneyTransaction, b: MoneyTransaction) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  );

                const income = boxTxns
                  .filter((t: MoneyTransaction) => t.type === "income")
                  .reduce(
                    (s: number, t: MoneyTransaction) => s + Math.abs(t.amount),
                    0,
                  );
                const expense = boxTxns
                  .filter((t: MoneyTransaction) => t.type === "expense")
                  .reduce(
                    (s: number, t: MoneyTransaction) => s + Math.abs(t.amount),
                    0,
                  );

                return (
                  <div
                    key={box.id}
                    className={`bg-white rounded-2xl border ${cfg.border} shadow-sm overflow-hidden transition-all duration-300`}
                  >
                    {/* Card top accent */}
                    <div
                      className={`h-1 w-full bg-gradient-to-r ${cfg.accent}`}
                    />

                    {/* Card Header */}
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
                            >
                              {cfg.name}
                            </span>
                          </div>
                          <p className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums mt-2">
                            ${formatAmount(amount)}
                          </p>

                          {/* Mini income/expense stats */}
                          {boxTxns.length > 0 && (
                            <div className="flex gap-4 mt-3">
                              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                  />
                                </svg>
                                +${formatAmount(income)}
                              </span>
                              <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                  />
                                </svg>
                                -${formatAmount(expense)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setSelectedBox(box);
                                setEditBoxOpen(true);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${cfg.soft} ${cfg.text} border ${cfg.border} hover:opacity-80 transition-all flex items-center gap-1`}
                            >
                              <svg
                                className="w-3.5 h-3.5"
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
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setExpandedSection(
                                isExpanded ? null : box.section_id,
                              )
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                                Hide
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                                Transactions{" "}
                                {boxTxns.length > 0 && `(${boxTxns.length})`}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Transactions Panel */}
                    {isExpanded && (
                      <div
                        className={`border-t ${cfg.border} ${cfg.soft} px-5 sm:px-6 pb-5`}
                      >
                        {/* Transactions header */}
                        <div className="flex items-center justify-between py-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Transactions
                          </span>
                          {canManageTransactions && (
                            <button
                              onClick={() => openAddTxn(box.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r ${cfg.accent} text-white shadow-sm hover:opacity-90 transition-all`}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add
                            </button>
                          )}
                        </div>

                        {/* Transaction list */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                          {boxTxns.length === 0 ? (
                            <div className="py-10 text-center">
                              <p className="text-sm text-gray-400">
                                No transactions yet
                              </p>
                              {canManageTransactions && (
                                <button
                                  onClick={() => openAddTxn(box.id)}
                                  className={`mt-2 text-xs font-semibold ${cfg.text} hover:underline`}
                                >
                                  Add the first one
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="px-4">
                              {boxTxns.map((txn: MoneyTransaction) => (
                                <TransactionRow
                                  key={txn.id}
                                  txn={txn}
                                  canManage={canManageTransactions}
                                  onEdit={openEditTxn}
                                  onDelete={deleteTxn}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Edit Moneybox Modal (kept as-is) */}
      {selectedBox && (
        <EditMoneyboxModal
          open={editBoxOpen}
          moneybox={selectedBox}
          onClose={() => {
            setEditBoxOpen(false);
            setSelectedBox(null);
          }}
          onSaved={() => refetch()}
        />
      )}

      {/* Transaction Modal */}
      <TransactionModal
        open={txnModalOpen}
        moneyboxId={txnMoneyboxId}
        transaction={editingTxn}
        onClose={() => {
          setTxnModalOpen(false);
          setEditingTxn(null);
        }}
        onSaved={refetch}
      />
    </div>
  );
}
