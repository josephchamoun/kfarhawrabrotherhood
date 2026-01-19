/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
} from "react-icons/fa";
import api from "../api/api";
import Navbar from "../components/Navbar";
import AddShopModal from "../components/AddShopModal";
import type { Shop } from "../types";

export default function ShopsPage() {
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user_info") || "{}");
  const canAddShop =
    user?.is_global_admin ||
    user?.roles?.some((r: any) =>
      [
        "Chabiba President",
        "Forsan President",
        "Tala2e3 President",
        "Ne2b al Ra2is",
        "Amin sandou2",
      ].includes(r.role_name),
    );

  // Fetch all shops once
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/shops", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setAllShops(res.data);
        setShops(res.data);
      } catch {
        setError("Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Frontend search/filter
  useEffect(() => {
    const filtered = allShops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.phone_number || "").includes(searchTerm),
    );
    setShops(filtered);
  }, [searchTerm, allShops]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Add Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name, location, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-sm hover:shadow-md text-gray-900"
              />
            </div>

            {/* Add Shop Button */}
            {canAddShop && (
              <button
                onClick={() => setOpenModal(true)}
                className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 whitespace-nowrap"
              >
                <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                <span>Add Shop</span>
              </button>
            )}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="mt-4 text-gray-600 text-sm">
              {shops.length === 0
                ? "No shops found"
                : `Showing ${shops.length} ${shops.length === 1 ? "shop" : "shops"}`}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-16 bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-6 rounded-xl shadow-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Shops Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-t-4 border-blue-600"
              >
                {/* Card Header with Icon */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                        {shop.name}
                      </h2>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FaStore className="text-white text-xl" />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <FaMapMarkerAlt className="text-blue-600 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Location
                      </p>
                      <p className="text-gray-800 font-medium">{shop.place}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <FaPhone className="text-indigo-600 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Phone
                      </p>
                      <a
                        href={`tel:${shop.phone_number}`}
                        className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                      >
                        {shop.phone_number}
                      </a>
                    </div>
                  </div>

                  {shop.description && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {shop.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && shops.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaStore className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No shops found
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No shops available at the moment"}
            </p>
            {canAddShop && !searchTerm && (
              <button
                onClick={() => setOpenModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-3"
              >
                <FaPlus className="text-lg" />
                <span>Add First Shop</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AddShopModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={(shop: Shop) => {
          setAllShops([shop, ...allShops]);
          setShops([shop, ...shops]);
        }}
      />
    </div>
  );
}
