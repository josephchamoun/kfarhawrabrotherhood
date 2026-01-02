import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

import type { Shop } from "../types";

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/shops")
      .then((res) => setShops(res.data))
      .catch(() => setError("Failed to load shops"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shops</h1>

        {loading && <p className="text-gray-500">Loading shops...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {shop.name}
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Place:</span> {shop.place}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Phone:</span> {shop.phone_number}
              </p>
              {shop.description && (
                <p className="text-gray-500 mt-2 line-clamp-3">
                  {shop.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
