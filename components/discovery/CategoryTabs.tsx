"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Place {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  distance?: number;
  rating?: number;
  openingHours?: string;
  image?: string;
  description?: string;
  contact?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
  location?: string;
  features: string[];
}

interface CategoryTabsProps {
  events: Place[];
  business: Place[];
  others: Place[];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ events, others, business }) => {
  const [activeTab, setActiveTab] = useState<"Events" | "Others" | "Business">("Business");
  const router = useRouter();

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const s = new Date(start).toLocaleDateString(undefined, opts);
    const e = new Date(end).toLocaleDateString(undefined, opts);
    return `${s} – ${e}`;
  };

  const handleCardClick = (id: string) => {
    router.push(`/place/${id}`);
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {["Business", "Events", "Others"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "Events" | "Others" | "Business")}
            className={`px-6 py-2 -mb-px font-semibold ${
              activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400"
            } hover:text-blue-400`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      {["Business", "Events", "Others"].map((type) =>
        activeTab === type ? (
          <div
            key={type}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(type === "Business" ? business : type === "Events" ? events : others).length === 0 ? (
              <p className="text-center text-gray-400 col-span-full">No {type.toLowerCase()} found.</p>
            ) : (
              (type === "Business" ? business : type === "Events" ? events : others).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col cursor-pointer hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded mb-4"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded mb-4">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}

                  {type === "Events" && (
                    <>
                      <p className="text-sm mb-1">{formatDateRange(item.start_date, item.end_date)}</p>
                      {item.price !== undefined && (
                        <p className="text-sm mb-1">Starting from ₹{item.price}</p>
                      )}
                    </>
                  )}

                  <p className="text-sm mb-1"><strong>Category:</strong> {item.type}</p>
                  <p className="text-sm mb-1">{item.description}</p>
                  <p className="text-sm mb-1"><strong>Location:</strong> {item.location}</p>

                  <div className="mb-2">
                    <strong>Features:</strong>
                    <ul className="list-disc list-inside">
                      {item.features.map((f, i) => (
                        <li key={i} className="text-sm">{f}</li>
                      ))}
                    </ul>
                  </div>

                  {item.contact && (
                    <p className="text-sm"><strong>Contact:</strong> {item.contact}</p>
                  )}

                  {type === "Events" && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/booking/${item.id}`);
                      }}
                    >
                      <Button variant="secondary" className="mt-auto w-full">
                        Book Now
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : null
      )}
    </div>
  );
};

export default CategoryTabs;
