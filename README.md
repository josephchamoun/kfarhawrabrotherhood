# Kfarhawra Brotherhood Platform — Frontend

A role-based member management system built for a real Lebanese community organization (Kfarhawra Brotherhood), used daily by members to manage events, finances, meetings, elections, and more.

🔗 **Live:** https://kfarhaoura-brotherhood.vercel.app

---

## About the Project

The Brotherhood is divided into three sections: **Chabiba**, **Tala2e3**, and **Forsan**. Each section has up to **8 roles** assigned to members (such as President, Amin Ser, Amin Sandou2, Moustachar, and others). Each role has specific permissions — for example, only the Amin Sandou2 can manage financial records, while other roles manage events, meetings, or member data.

Admins have full control over the system and are the only ones who can create users, assign roles, and assign members to sections.

---

## Pages & Features

| Page | Description |
|---|---|
| **Home (Public)** | Displays total member count, event count, and the date the platform launched — visible without login |
| **Users** | Full member directory with search and filtering |
| **Events** | Create and manage events with details and financial records per event |
| **Moneyboxes** | Tracks financial balances for the Brotherhood and each section |
| **Meetings** | Records of real-life meetings held by each section |
| **Elections** | Manage and track section elections |
| **Shops** | Section-specific shop listings |
| **Contacts** | Member contact directory |
| **Chabiba / Tala2e3 / Forsan** | Section pages showing members belonging to each section |
| **Profile** | Personal profile page for each member |

---

## Role & Permission System

- Users are assigned to one of three sections: **Chabiba**, **Tala2e3**, or **Forsan**
- Each section has **8 roles** with different levels of access
- Role assignments are time-bound — roles are given for a specific period
- **Admins** bypass all role restrictions and have full management access
- All permission checks are enforced on the backend (Laravel API)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React + TypeScript |
| Styling | TailwindCSS |
| Server State | TanStack Query (React Query) — fast data fetching and caching |
| Client-side Cache | Dexie.js (IndexedDB) — used for offline-capable event and member display |
| Database | InstantDB (1GB free cloud storage) |
| Auth | Laravel Sanctum (Bearer tokens) |
| Build Tool | Vite |
| Deployment | Vercel |

---

## Architecture Notes

- **TanStack Query** handles all API calls with automatic background refetching, caching, and loading states — making the UI feel fast and responsive
- **Dexie.js** was used experimentally on the events and users pages to persist data locally in the browser using IndexedDB — reducing load times on repeat visits
- **InstantDB** serves as the cloud database layer, storing all platform data including members, events, finances, meetings, and elections

---

## Related Repository

- [Brotherhood Backend (Laravel)](https://github.com/josephchamoun/brotherhood_backend)

---

## Screenshots

*Coming soon*
