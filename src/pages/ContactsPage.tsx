/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AddContactModal from "../components/AddContactModal";
import type { Contact } from "../types";

export default function ContactsPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user_info") || "{}");

  const canAddContact =
    user?.is_global_admin ||
    user?.roles?.some((r: any) =>
      [
        "Wakil Risele",
        "Ne2b al Ra2is",
        "Chabiba President",
        "Forsan President",
        "Tala2e3 President",
      ].includes(r.role_name),
    );

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/contacts", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setAllContacts(res.data);
        setContacts(res.data);
      } catch {
        setError("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = allContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.town_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm),
    );
    setContacts(filtered);
  }, [searchTerm, allContacts]);
  const handleDeleteContact = async (contactId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/contacts/${contactId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setAllContacts((prev) => prev.filter((c) => c.id !== contactId));
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch {
      alert("Failed to delete contact");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search + Add */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name, town, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm hover:shadow-md"
              />
            </div>

            {canAddContact && (
              <button
                onClick={() => setOpenModal(true)}
                className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
              >
                <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                Add Contact
              </button>
            )}
          </div>

          {!loading && (
            <p className="mt-4 text-gray-600 text-sm">
              {contacts.length === 0
                ? "No contacts found"
                : `Showing ${contacts.length} ${
                    contacts.length === 1 ? "contact" : "contacts"
                  }`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-6 rounded-xl">
            {error}
          </div>
        )}

        {/* Contacts Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
              >
                {/* Top accent border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* User Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                        <FaUser className="text-white text-xl" />
                      </div>

                      {/* Contact Name */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                          {contact.name}
                        </h2>
                        <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-transparent rounded-full mt-2 group-hover:w-20 transition-all"></div>
                      </div>
                    </div>

                    {/* Delete Button – only for authorized users */}
                    {canAddContact && (
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="w-9 h-9 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md group/delete flex-shrink-0"
                        title="Delete contact"
                      >
                        <FaTrash className="text-sm group-hover/delete:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FaMapMarkerAlt className="text-blue-600 text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-700 font-semibold mb-0.5 uppercase tracking-wide">
                          Location
                        </p>
                        <p className="text-gray-900 font-medium text-sm truncate">
                          {contact.town_name}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FaPhone className="text-indigo-600 text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-700 font-semibold mb-0.5 uppercase tracking-wide">
                          Phone
                        </p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-gray-900 font-medium text-sm hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group/phone"
                        >
                          <span>{contact.phone}</span>
                          <svg
                            className="w-3 h-3 opacity-0 group-hover/phone:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom hover effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && contacts.length === 0 && (
          <div className="text-center py-16">
            <FaUser className="text-6xl text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900">
              No contacts found
            </h3>
            {canAddContact && !searchTerm && (
              <button
                onClick={() => setOpenModal(true)}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Add First Contact
              </button>
            )}
          </div>
        )}
      </div>

      <AddContactModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={(contact: Contact) => {
          setAllContacts([contact, ...allContacts]);
          setContacts([contact, ...contacts]);
        }}
      />
    </div>
  );
}
