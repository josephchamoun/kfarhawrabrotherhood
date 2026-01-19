/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
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
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-blue-600"
              >
                <div className="bg-blue-50 p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      {contact.name}
                    </h2>
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <FaUser className="text-white text-lg" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <FaMapMarkerAlt className="text-blue-600 mt-1" />
                    <p className="font-medium text-gray-800">
                      {contact.town_name}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <FaPhone className="text-indigo-600 mt-1" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-medium text-gray-800 hover:text-blue-600"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
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
