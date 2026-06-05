/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import AddEventModal from "../components/AddEventModal";
import EditEventDetailsModal from "../components/EditEventDetailsModal";
import EditEventFinancialsModal from "../components/EditEventFinancialsModal";
import { useEvents } from "../hooks/useEvents";
import api from "../api/api";

import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

import type { Event as AppEvent, UserRole } from "../types";

const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");

const CHABIBA_PRESIDENT = "Chabiba President";
const TALA2E3_PRESIDENT = "Tala2e3 President";
const FORSAN_PRESIDENT = "Forsan President";
const NE2B = "Ne2b al Ra2is";
const AMIN_SER = "Amin Ser";
const AMIN_SANDOU2 = "Amin sandou2";
const WAKIL_TANCHI2A = "wakil tanchi2a";

const rolesStatic: UserRole[] = currentUser.roles || [];

const hasRoleStatic = (role: string, sectionId?: number) =>
  rolesStatic.some(
    (r) =>
      r.role_name === role &&
      r.end_date === null &&
      (!sectionId || r.section_id === sectionId),
  );

const isHighAdminStatic = currentUser.is_global_admin === true;

const isChabibaLeaderSection1Static =
  hasRoleStatic("Chabiba President", 1) ||
  hasRoleStatic("Ne2b al Ra2is", 1) ||
  hasRoleStatic("Amin Ser", 1);

const userSectionStatic =
  hasRoleStatic("Tala2e3 President", 2) ||
  hasRoleStatic("Ne2b al Ra2is", 2) ||
  hasRoleStatic("Amin Ser", 2)
    ? 2
    : hasRoleStatic("Forsan President", 3) ||
        hasRoleStatic("Ne2b al Ra2is", 3) ||
        hasRoleStatic("Amin Ser", 3)
      ? 3
      : null;

const canPickAnySections = isHighAdminStatic || isChabibaLeaderSection1Static;
const forcedSection = canPickAnySections ? null : userSectionStatic;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const SECTION_COLORS: Record<
  number,
  { bg: string; text: string; dot: string }
> = {
  1: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  2: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
  3: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
};

export default function EventsPage() {
  const {
    events,
    loading,
    syncing,
    error,
    addEventOptimistic,
    deleteEventOptimistic,
    updateEventOptimistic,
  } = useEvents();
  const [openExportMenu, setOpenExportMenu] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"all" | "1" | "2" | "3">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">(
    "all",
  );
  const [expanded, setExpanded] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const LOCK_AFTER_DAYS = 30;
  const WARNING_DAYS = 30;

  const getDaysSinceEvent = (eventDate: string) => {
    const eventTime = new Date(eventDate).getTime();
    const now = new Date().getTime();
    return Math.floor((now - eventTime) / (1000 * 60 * 60 * 24));
  };

  const getDaysRemainingBeforeLock = (eventDate: string) =>
    LOCK_AFTER_DAYS - getDaysSinceEvent(eventDate);

  const isInWarningPeriod = (eventDate: string) => {
    const remaining = getDaysRemainingBeforeLock(eventDate);
    return remaining > 0 && remaining <= WARNING_DAYS;
  };

  const roles: UserRole[] = currentUser.roles || [];

  const hasRole = (role: string, sectionId?: number) =>
    roles.some(
      (r) =>
        r.role_name === role &&
        r.end_date === null &&
        (!sectionId || r.section_id === sectionId),
    );

  const isHighAdmin = () => currentUser.is_global_admin === true;

  const isSharedEvent = (event: AppEvent) => {
    const ids = event.sections
      .map((s) => s.id)
      .sort()
      .join(",");
    return ids === "1,2,3";
  };

  useEffect(() => {
    const close = () => setOpenExportMenu(null);
    window.addEventListener("scroll", close);
    return () => window.removeEventListener("scroll", close);
  }, []);

  const isAminSer = (event: AppEvent) => {
    if (hasRole(AMIN_SER, 1)) return true;
    if (isSharedEvent(event)) return hasRole(AMIN_SER, 1);
    return event.sections.some((s) => hasRole(AMIN_SER, s.id));
  };

  const isWakilTanchi2a = (event: AppEvent) => {
    if (isSharedEvent(event)) return false;
    return event.sections.some((s) => hasRole(WAKIL_TANCHI2A, s.id));
  };

  const isAminSandou2 = (event: AppEvent) => {
    if (isSharedEvent(event)) return hasRole(AMIN_SANDOU2, 1);
    return event.sections.some((s) => hasRole(AMIN_SANDOU2, s.id));
  };

  const isNe2b = (event: AppEvent) =>
    event.sections.some((s) => hasRole(NE2B, s.id));

  const isPresidentOrNe2b = (sectionId: number) => {
    if (hasRole(NE2B, sectionId)) return true;
    if (sectionId === 1 && hasRole(CHABIBA_PRESIDENT, 1)) return true;
    if (sectionId === 2 && hasRole(TALA2E3_PRESIDENT, 2)) return true;
    if (sectionId === 3 && hasRole(FORSAN_PRESIDENT, 3)) return true;
    return false;
  };

  const isPresidentOrNe2bedit = (event: AppEvent) => {
    if (!event.sections) return false;
    if (isSharedEvent(event)) return hasRole(CHABIBA_PRESIDENT, 1);
    return event.sections.some((s) => {
      if (s.id === 1) return hasRole(CHABIBA_PRESIDENT, 1);
      if (s.id === 2) return hasRole(TALA2E3_PRESIDENT, 2);
      if (s.id === 3) return hasRole(FORSAN_PRESIDENT, 3);
      return false;
    });
  };

  const isUpcomingEvent = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event >= today;
  };

  const isPastEvent = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    return event < today;
  };

  const isChabibaLeaderSection1 =
    hasRole(CHABIBA_PRESIDENT, 1) || hasRole(NE2B, 1) || hasRole(AMIN_SER, 1);

  const isLeaderAnySection =
    hasRole(TALA2E3_PRESIDENT, 2) ||
    hasRole(FORSAN_PRESIDENT, 3) ||
    hasRole(NE2B, 2) ||
    hasRole(NE2B, 3) ||
    hasRole(AMIN_SER, 2) ||
    hasRole(AMIN_SER, 3);

  const canShowAddButton =
    isHighAdmin() || isChabibaLeaderSection1 || isLeaderAnySection;

  const isEventLocked = (event: AppEvent): boolean => {
    const lockDate = new Date(event.event_date);
    lockDate.setDate(lockDate.getDate() + LOCK_AFTER_DAYS);
    return new Date() > lockDate;
  };

  const canEditDetails = (event: AppEvent) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;
    if (hasRole(AMIN_SER, 1)) return true;
    if (isWakilTanchi2a(event)) return true;
    if (isSharedEvent(event)) return isPresidentOrNe2b(1);
    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SER, s.id),
    );
  };

  const canEditFinancials = (event: AppEvent) => {
    if (isEventLocked(event)) return false;
    if (isHighAdmin()) return true;
    if (isSharedEvent(event))
      return isPresidentOrNe2b(1) || hasRole(AMIN_SANDOU2, 1);
    return event.sections.some(
      (s) => isPresidentOrNe2b(s.id) || hasRole(AMIN_SANDOU2, s.id),
    );
  };

  const canDelete = (event: AppEvent) => {
    if (isHighAdmin()) return true;
    if (isEventLocked(event)) return false;
    if (hasRole(AMIN_SER, 1)) return true;
    if (isSharedEvent(event)) return isPresidentOrNe2b(1);
    return event.sections.some((s) => isPresidentOrNe2b(s.id));
  };

  const canEditDetailsWithDate = (event: AppEvent) =>
    !isEventLocked(event) && canEditDetails(event);
  const canEditFinancialsWithDate = (event: AppEvent) =>
    !isEventLocked(event) && canEditFinancials(event);
  const canDeleteWithDate = (event: AppEvent) => {
    if (isHighAdmin()) return true;
    if (isEventLocked(event)) return false;
    return canDelete(event);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${eventId}`, { headers: getAuthHeader() });
      deleteEventOptimistic(eventId);
    } catch {
      alert("Failed to delete event");
    }
  };

  const calculateProfit = (event: AppEvent) =>
    parseFloat(event.total_revenue) - parseFloat(event.total_spent);

  // ── Download as PDF (via browser print dialog) ──────────────────────────
  const handleDownloadPDF = () => {
    setShowDownloadMenu(false);

    const totalRevenue = filteredEvents.reduce(
      (s, e) => s + parseFloat(e.total_revenue),
      0,
    );
    const totalSpent = filteredEvents.reduce(
      (s, e) => s + parseFloat(e.total_spent),
      0,
    );
    const totalProfit = totalRevenue - totalSpent;

    const exportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const sectionLabel =
      sectionFilter === "all"
        ? "All Sections"
        : sectionFilter === "1"
          ? "Chabiba"
          : sectionFilter === "2"
            ? "Tala2e3"
            : "Forsan";

    const eventsHTML = filteredEvents
      .map((event) => {
        const profit = calculateProfit(event);
        const isProfitable = profit >= 0;
        const upcoming = isUpcomingEvent(event.event_date);
        const locked = isEventLocked(event);
        const sections = event.sections.map((s: any) => s.name).join(", ");

        return `
        <div class="event-card">
          <div class="event-header">
            <div class="event-title-row">
              <h2 class="event-title">${event.title}</h2>
              <div class="badges">
                <span class="badge ${upcoming ? "badge-upcoming" : "badge-done"}">${upcoming ? "Upcoming" : "Done"}</span>
                ${locked ? '<span class="badge badge-locked">Locked</span>' : ""}
              </div>
            </div>
            <div class="event-meta">
              <span>📅 ${new Date(event.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span>🏷 ${sections}</span>
            </div>
          </div>

          <p class="event-description">${event.description || "—"}</p>

          <div class="financials">
            <div class="fin-item">
              <span class="fin-label">Revenue</span>
              <span class="fin-value revenue">$${parseFloat(event.total_revenue).toFixed(2)}</span>
            </div>
            <div class="fin-divider"></div>
            <div class="fin-item">
              <span class="fin-label">Spent</span>
              <span class="fin-value spent">$${parseFloat(event.total_spent).toFixed(2)}</span>
            </div>
            <div class="fin-divider"></div>
            <div class="fin-item">
              <span class="fin-label">Net Profit</span>
              <span class="fin-value ${isProfitable ? "profit" : "loss"}">$${profit.toFixed(2)}</span>
            </div>
          </div>

          ${
            event.notes
              ? `<div class="notes"><strong>Notes:</strong> ${event.notes}</div>`
              : ""
          }
          ${
            event.drive_link || event.photo_link
              ? `<div class="links">
              ${event.drive_link ? `<a href="${event.drive_link}">Drive ↗</a>` : ""}
              ${event.photo_link ? `<a href="${event.photo_link}">Photos ↗</a>` : ""}
            </div>`
              : ""
          }
        </div>
      `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Events Export — ${exportDate}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #111; background: white; padding: 32px; }

          .report-header { margin-bottom: 28px; border-bottom: 2px solid #111; padding-bottom: 16px; }
          .report-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .report-header p { color: #666; font-size: 12px; margin-top: 4px; }

          .summary { display: flex; gap: 16px; margin-bottom: 28px; }
          .summary-item { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px; }
          .summary-item .s-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
          .summary-item .s-value { font-size: 20px; font-weight: 800; }
          .s-revenue { color: #059669; }
          .s-spent { color: #e11d48; }
          .s-profit { color: #2563eb; }
          .s-loss { color: #ea580c; }

          .event-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 14px; page-break-inside: avoid; }
          .event-header { margin-bottom: 10px; }
          .event-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
          .event-title { font-size: 15px; font-weight: 700; color: #111; }
          .badges { display: flex; gap: 4px; flex-shrink: 0; }
          .badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 7px; border-radius: 999px; }
          .badge-upcoming { background: #d1fae5; color: #065f46; }
          .badge-done { background: #f3f4f6; color: #6b7280; }
          .badge-locked { background: #1f2937; color: white; }
          .event-meta { display: flex; gap: 14px; font-size: 11px; color: #6b7280; }
          .event-description { font-size: 12px; color: #374151; line-height: 1.6; margin-bottom: 12px; }

          .financials { display: flex; gap: 0; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 10px; background: #f9fafb; }
          .fin-item { flex: 1; padding: 8px 12px; text-align: center; }
          .fin-divider { width: 1px; background: #e5e7eb; }
          .fin-label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 3px; }
          .fin-value { font-size: 14px; font-weight: 700; }
          .revenue { color: #059669; }
          .spent { color: #e11d48; }
          .profit { color: #2563eb; }
          .loss { color: #ea580c; }

          .notes { font-size: 11px; color: #6b7280; background: #f9fafb; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; line-height: 1.5; }
          .links { font-size: 11px; }
          .links a { color: #2563eb; text-decoration: none; margin-right: 12px; }

          .footer { margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }

          @media print {
            body { padding: 16px; }
            .event-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Events Report</h1>
          <p>Exported on ${exportDate} · ${sectionLabel} · ${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` · ${yearFilter}` : ""}${dateFilter !== "all" ? ` · ${dateFilter === "upcoming" ? "Upcoming" : "Done"}` : ""}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="s-label">Total Revenue</div>
            <div class="s-value s-revenue">$${totalRevenue.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="s-label">Total Spent</div>
            <div class="s-value s-spent">$${totalSpent.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="s-label">Net Profit</div>
            <div class="s-value ${totalProfit >= 0 ? "s-profit" : "s-loss"}">$${totalProfit.toFixed(2)}</div>
          </div>
        </div>

        ${eventsHTML}

        <div class="footer">
          <span>Brotherhood Events System</span>
          <span>${filteredEvents.length} events · Generated ${exportDate}</span>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to export PDF.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ── Download as CSV ──────────────────────────────────────────────────────
  const handleDownloadCSV = () => {
    setShowDownloadMenu(false);

    const headers = [
      "Title",
      "Date",
      "Status",
      "Sections",
      "Revenue",
      "Spent",
      "Profit",
      "Description",
      "Notes",
      "Drive Link",
      "Photo Link",
    ];

    const rows = filteredEvents.map((event) => {
      const profit = calculateProfit(event);
      const upcoming = isUpcomingEvent(event.event_date);
      const sections = event.sections.map((s: any) => s.name).join(" / ");
      const escape = (val: string | null | undefined) => {
        if (!val) return "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };
      return [
        escape(event.title),
        new Date(event.event_date).toLocaleDateString("en-US"),
        upcoming ? "Upcoming" : "Done",
        escape(sections),
        parseFloat(event.total_revenue).toFixed(2),
        parseFloat(event.total_spent).toFixed(2),
        profit.toFixed(2),
        escape(event.description),
        escape(event.notes),
        escape(event.drive_link),
        escape(event.photo_link),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `events_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadEventPDF = (event: AppEvent) => {
    const profit = calculateProfit(event);
    const isProfitable = profit >= 0;
    const upcoming = isUpcomingEvent(event.event_date);
    const locked = isEventLocked(event);
    const sections = event.sections.map((s: any) => s.name).join(", ");
    const exportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${event.title} — ${exportDate}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #111; background: white; padding: 32px; }
        .report-header { margin-bottom: 28px; border-bottom: 2px solid #111; padding-bottom: 16px; }
        .report-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .report-header p { color: #666; font-size: 12px; margin-top: 4px; }
        .event-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
        .event-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .event-title { font-size: 15px; font-weight: 700; color: #111; }
        .badges { display: flex; gap: 4px; flex-shrink: 0; }
        .badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 7px; border-radius: 999px; }
        .badge-upcoming { background: #d1fae5; color: #065f46; }
        .badge-done { background: #f3f4f6; color: #6b7280; }
        .badge-locked { background: #1f2937; color: white; }
        .event-meta { display: flex; gap: 14px; font-size: 11px; color: #6b7280; margin-bottom: 10px; }
        .event-description { font-size: 12px; color: #374151; line-height: 1.6; margin-bottom: 12px; }
        .financials { display: flex; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 10px; background: #f9fafb; }
        .fin-item { flex: 1; padding: 8px 12px; text-align: center; }
        .fin-divider { width: 1px; background: #e5e7eb; }
        .fin-label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 3px; }
        .fin-value { font-size: 14px; font-weight: 700; }
        .revenue { color: #059669; }
        .spent { color: #e11d48; }
        .profit { color: #2563eb; }
        .loss { color: #ea580c; }
        .notes { font-size: 11px; color: #6b7280; background: #f9fafb; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; line-height: 1.5; }
        .links { font-size: 11px; margin-top: 8px; }
        .links a { color: #2563eb; text-decoration: none; margin-right: 12px; }
        .footer { margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1>${event.title}</h1>
        <p>Exported on ${exportDate}</p>
      </div>
      <div class="event-card">
        <div class="event-title-row">
          <span class="event-title">${event.title}</span>
          <div class="badges">
            <span class="badge ${upcoming ? "badge-upcoming" : "badge-done"}">${upcoming ? "Upcoming" : "Done"}</span>
            ${locked ? '<span class="badge badge-locked">Locked</span>' : ""}
          </div>
        </div>
        <div class="event-meta">
          <span>📅 ${new Date(event.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span>🏷 ${sections}</span>
        </div>
        <p class="event-description">${event.description || "—"}</p>
        <div class="financials">
          <div class="fin-item">
            <span class="fin-label">Revenue</span>
            <span class="fin-value revenue">$${parseFloat(event.total_revenue).toFixed(2)}</span>
          </div>
          <div class="fin-divider"></div>
          <div class="fin-item">
            <span class="fin-label">Spent</span>
            <span class="fin-value spent">$${parseFloat(event.total_spent).toFixed(2)}</span>
          </div>
          <div class="fin-divider"></div>
          <div class="fin-item">
            <span class="fin-label">Net Profit</span>
            <span class="fin-value ${isProfitable ? "profit" : "loss"}">$${profit.toFixed(2)}</span>
          </div>
        </div>
        ${event.notes ? `<div class="notes"><strong>Notes:</strong> ${event.notes}</div>` : ""}
        ${
          event.drive_link || event.photo_link
            ? `
          <div class="links">
            ${event.drive_link ? `<a href="${event.drive_link}">Drive ↗</a>` : ""}
            ${event.photo_link ? `<a href="${event.photo_link}">Photos ↗</a>` : ""}
          </div>`
            : ""
        }
      </div>
      <div class="footer">
        <span>Brotherhood Events System</span>
        <span>Generated ${exportDate}</span>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to export PDF.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDownloadEventCSV = (event: AppEvent) => {
    const profit = calculateProfit(event);
    const upcoming = isUpcomingEvent(event.event_date);
    const sections = event.sections.map((s: any) => s.name).join(" / ");
    const escape = (val: string | null | undefined) => {
      if (!val) return "";
      return `"${String(val).replace(/"/g, '""')}"`;
    };
    const headers = [
      "Title",
      "Date",
      "Status",
      "Sections",
      "Revenue",
      "Spent",
      "Profit",
      "Description",
      "Notes",
      "Drive Link",
      "Photo Link",
    ];
    const row = [
      escape(event.title),
      new Date(event.event_date).toLocaleDateString("en-US"),
      upcoming ? "Upcoming" : "Done",
      escape(sections),
      parseFloat(event.total_revenue).toFixed(2),
      parseFloat(event.total_spent).toFixed(2),
      profit.toFixed(2),
      escape(event.description),
      escape(event.notes),
      escape(event.drive_link),
      escape(event.photo_link),
    ].join(",");
    const csvContent = [headers.join(","), row].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const availableYears = Array.from(
    new Set(events.map((e) => new Date(e.event_date).getFullYear().toString())),
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const filteredEvents = events
    .filter((event) => {
      const text = (
        event.title +
        event.description +
        (event.notes || "")
      ).toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesSection =
        sectionFilter === "all" ||
        event.sections.some((s) => String(s.id) === sectionFilter);
      const matchesYear =
        yearFilter === "all" ||
        new Date(event.event_date).getFullYear().toString() === yearFilter;
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && isUpcomingEvent(event.event_date)) ||
        (dateFilter === "past" && isPastEvent(event.event_date));
      return matchesSearch && matchesSection && matchesYear && matchesDate;
    })
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );

  const totalRevenue = filteredEvents.reduce(
    (s, e) => s + parseFloat(e.total_revenue),
    0,
  );
  const totalSpent = filteredEvents.reduce(
    (s, e) => s + parseFloat(e.total_spent),
    0,
  );
  const totalProfit = totalRevenue - totalSpent;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page header ── */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Events
              </h1>
              {syncing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  <svg
                    className="animate-spin h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Syncing
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track brotherhood events and finances
            </p>
          </div>

          {/* ── Header actions ── */}
          <div className="flex items-center gap-2">
            {/* Download dropdown */}
            <div className="relative" ref={downloadMenuRef}>
              <button
                onClick={() => setShowDownloadMenu((v) => !v)}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm border border-gray-200"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
                <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showDownloadMenu && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDownloadMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-base">📄</span>
                      <div>
                        <p className="font-semibold">Save as PDF</p>
                        <p className="text-xs text-gray-400">
                          Opens print dialog
                        </p>
                      </div>
                    </button>
                    <div className="h-px bg-gray-100" />
                    <button
                      onClick={handleDownloadCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-base">📊</span>
                      <div>
                        <p className="font-semibold">Save as CSV</p>
                        <p className="text-xs text-gray-400">
                          Opens in Excel / Sheets
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {canShowAddButton && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Revenue",
              value: totalRevenue,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              icon: <BanknotesIcon className="w-4 h-4 text-emerald-500" />,
            },
            {
              label: "Spent",
              value: totalSpent,
              color: "text-rose-600",
              bg: "bg-rose-50",
              border: "border-rose-100",
              icon: <CurrencyDollarIcon className="w-4 h-4 text-rose-500" />,
            },
            {
              label: "Net Profit",
              value: totalProfit,
              color: totalProfit >= 0 ? "text-blue-600" : "text-orange-600",
              bg: totalProfit >= 0 ? "bg-blue-50" : "bg-orange-50",
              border:
                totalProfit >= 0 ? "border-blue-100" : "border-orange-100",
              icon: <CalendarIcon className="w-4 h-4 text-blue-500" />,
            },
          ].map(({ label, value, color, bg, border, icon }) => (
            <div
              key={label}
              className={`${bg} ${border} border rounded-2xl px-5 py-4 flex items-center justify-between`}
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className={`text-2xl font-bold ${color}`}>
                  ${value.toFixed(2)}
                </p>
              </div>
              <div
                className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center border ${border}`}
              >
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filters ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or notes…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all bg-gray-50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                showFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {(sectionFilter !== "all" ||
                yearFilter !== "all" ||
                dateFilter !== "all") && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              {/* Section filter */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Section
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "all", label: "All" },
                      { val: "1", label: "Chabiba" },
                      { val: "2", label: "Tala2e3" },
                      { val: "3", label: "Forsan" },
                    ] as const
                  ).map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setSectionFilter(val)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        sectionFilter === val
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year filter */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Year
                </p>
                <div className="flex flex-wrap gap-2">
                  {["all", ...availableYears].map((year) => (
                    <button
                      key={year}
                      onClick={() => setYearFilter(year)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        yearFilter === year
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {year === "all" ? "All years" : year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date filter */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { val: "all", label: "All" },
                      { val: "upcoming", label: "Upcoming" },
                      { val: "past", label: "Done" },
                    ] as const
                  ).map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setDateFilter(val)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        dateFilter === val
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>
              {filteredEvents.length} of {events.length} events
            </span>
            {(searchTerm ||
              sectionFilter !== "all" ||
              yearFilter !== "all" ||
              dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSectionFilter("all");
                  setYearFilter("all");
                  setDateFilter("all");
                }}
                className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">Loading events…</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* ── Events grid ── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const profit = calculateProfit(event);
                const isProfitable = profit >= 0;
                const upcoming = isUpcomingEvent(event.event_date);
                const locked = isEventLocked(event);
                const warning = isInWarningPeriod(event.event_date);

                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
                  >
                    {/* ── Top accent bar: color indicates upcoming vs done ── */}
                    <div
                      className={`h-1 w-full ${upcoming ? "bg-emerald-400" : "bg-gray-200"}`}
                    />

                    {/* ── Card body ── */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Row 1: status badges + action buttons */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {upcoming ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Upcoming
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                              Done
                            </span>
                          )}
                          {locked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gray-800 text-white px-2.5 py-1 rounded-full">
                              🔒
                              <span className="ml-1 text-gray-300 text-[8px] font-normal uppercase tracking-widest">
                                Cannot be edited anymore
                              </span>
                            </span>
                          )}
                          {!locked && warning && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                              ⏳ {getDaysRemainingBeforeLock(event.event_date)}d
                              left to edit
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          {canEditDetailsWithDate(event) && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsEditOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                              title="Edit Details"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEditFinancialsWithDate(event) && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsFinancialsOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-500 hover:text-amber-700 transition-colors"
                              title="Edit Financials"
                            >
                              <CurrencyDollarIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDeleteWithDate(event) && (
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors"
                              title="Delete Event"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Per-event export dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenExportMenu(
                                openExportMenu === event.id ? null : event.id,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors"
                            title="Export Event"
                          >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                          </button>

                          {openExportMenu === event.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenExportMenu(null)}
                              />
                              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                <button
                                  onClick={() => {
                                    handleDownloadEventPDF(event);
                                    setOpenExportMenu(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                  <span>📄</span>
                                  <div>
                                    <p className="font-semibold">Save as PDF</p>
                                    <p className="text-xs text-gray-400">
                                      Opens print dialog
                                    </p>
                                  </div>
                                </button>
                                <div className="h-px bg-gray-100" />
                                <button
                                  onClick={() => {
                                    handleDownloadEventCSV(event);
                                    setOpenExportMenu(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                  <span>📊</span>
                                  <div>
                                    <p className="font-semibold">Save as CSV</p>
                                    <p className="text-xs text-gray-400">
                                      Opens in Excel / Sheets
                                    </p>
                                  </div>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Row 2: title + date */}
                      <h2 className="text-[15px] font-extrabold text-gray-900 leading-snug mb-1.5 tracking-tight">
                        {event.title}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                        <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {new Date(event.event_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Row 3: section pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {isSharedEvent(event) && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                            Shared
                          </span>
                        )}
                        {event.sections.map((section: any) => {
                          const c = SECTION_COLORS[section.id] ?? {
                            bg: "bg-gray-100",
                            text: "text-gray-600",
                            dot: "bg-gray-400",
                          };
                          return (
                            <span
                              key={section.id}
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${c.bg} ${c.text} px-2.5 py-1 rounded-full`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${c.dot}`}
                              />
                              {section.name}
                            </span>
                          );
                        })}
                      </div>

                      {/* Row 4: description */}
                      <div className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                        <p className={expanded ? "" : "line-clamp-3"}>
                          {event.description}
                        </p>
                        {event.description?.length > 180 && (
                          <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-blue-500 hover:text-blue-700 mt-1 font-semibold transition-colors"
                          >
                            {expanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>

                      {/* Row 5: financials strip */}
                      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border border-gray-100 rounded-xl mb-4 overflow-hidden">
                        <div className="py-2.5 px-3 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                            Revenue
                          </p>
                          <p className="text-sm font-extrabold text-emerald-600">
                            ${parseFloat(event.total_revenue).toFixed(2)}
                          </p>
                        </div>
                        <div className="py-2.5 px-3 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                            Spent
                          </p>
                          <p className="text-sm font-extrabold text-rose-500">
                            ${parseFloat(event.total_spent).toFixed(2)}
                          </p>
                        </div>
                        <div className="py-2.5 px-3 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                            Profit
                          </p>
                          <p
                            className={`text-sm font-extrabold ${isProfitable ? "text-blue-600" : "text-orange-500"}`}
                          >
                            ${profit.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Row 6: link buttons */}
                      {(event.drive_link || event.photo_link) && (
                        <div className="flex gap-2 mb-4">
                          {event.drive_link && (
                            <a
                              href={event.drive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-gray-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58q0-1.95 1.17-3.48 1.18-1.53 3.08-1.95.51-2.18 2.2-3.67Q9.14 4 11.5 4q2.72 0 4.61 1.88Q18 7.75 18 10.5v.5q1.73-.02 2.87 1.06Q22 13.12 22 14.85q0 1.64-1.18 2.74-1.17 1.11-2.82 1.11H13q-.82 0-1.41-.59-.59-.58-.59-1.41v-4.77l-1.5 1.5-1.41-1.41L12 8.33l3.91 3.91-1.41 1.41L13 12.18v4.82h5q.83 0 1.42-.59.58-.58.58-1.41 0-.83-.58-1.42Q18.83 13 18 13h-1.5v-2.5q0-1.88-1.31-3.19Q13.88 6 12 6q-1.88 0-3.19 1.31Q7.5 8.62 7.5 10.5H7q-1.25 0-2.12.88Q4 12.25 4 13.5q0 1.25.88 2.12Q5.75 16.5 7 16.5h1.5V18H7q-1.25 0-2.12-.88Q4 16.25 4 15H3.5" />
                              </svg>
                              Drive
                              <svg
                                className="w-2.5 h-2.5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                            </a>
                          )}
                          {event.photo_link && (
                            <a
                              href={event.photo_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                              </svg>
                              Photos
                              <svg
                                className="w-2.5 h-2.5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Row 7: notes */}
                      {event.notes && (
                        <details className="group/notes">
                          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors select-none">
                            <svg
                              className="w-3.5 h-3.5 transition-transform group-open/notes:rotate-90"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                              />
                            </svg>
                            Notes
                          </summary>
                          <p className="mt-2 text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-3">
                            {event.notes}
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  No events found
                </p>
                <p className="text-xs text-gray-400">
                  {searchTerm || sectionFilter !== "all" || yearFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first event to get started"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <AddEventModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={(newEvent: AppEvent) => addEventOptimistic(newEvent)}
        isGlobalAdmin={currentUser.is_global_admin}
        canPickAnySections={canPickAnySections}
        forcedSection={forcedSection}
      />

      <EditEventDetailsModal
        open={isEditOpen}
        event={selectedEvent}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEvent(null);
        }}
        editMode={
          selectedEvent
            ? isHighAdmin()
              ? "full"
              : isAminSer(selectedEvent)
                ? "full"
                : isPresidentOrNe2bedit(selectedEvent)
                  ? "full"
                  : isWakilTanchi2a(selectedEvent)
                    ? "description"
                    : "none"
            : "none"
        }
        onUpdated={(updatedEvent) => updateEventOptimistic(updatedEvent)}
      />

      <EditEventFinancialsModal
        open={isFinancialsOpen}
        event={selectedEvent}
        onClose={() => {
          setIsFinancialsOpen(false);
          setSelectedEvent(null);
        }}
        canEdit={
          selectedEvent
            ? isHighAdmin() ||
              isAminSandou2(selectedEvent) ||
              isNe2b(selectedEvent) ||
              isPresidentOrNe2bedit(selectedEvent)
            : false
        }
        onUpdated={(updatedEvent) => updateEventOptimistic(updatedEvent)}
      />
    </div>
  );
}
