"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/cart/cartSlice";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { LocateFixed, Search } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
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

// Tab component
const CategoryTabs: React.FC<{
  events: Place[];
  others: Place[];
  business: Place[];
}> = ({ events, others, business }) => {

  // const [activeTab, setActiveTab] = useState<"Events" | "Others">("Events");
  const [activeTab, setActiveTab] = useState<"Events" | "Others" | "Business">("Business");


  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const s = new Date(start).toLocaleDateString(undefined, opts);
    const e = new Date(end).toLocaleDateString(undefined, opts);
    return `${s} – ${e}`;
  };

  const router = useRouter();

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

{activeTab === "Business" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {business.length === 0 && <p className="text-center text-gray-400 col-span-full">No businesses found.</p>}
    {business.map((biz) => (
      <div key={biz.id} className="place-card bg-gray-800 p-5 rounded-lg shadow-md flex flex-col">
        <h3 className="text-xl font-bold mb-2">{biz.name}</h3>

        {biz.image ? (
          <img
            src={biz.image}
            alt={biz.name}
            className="w-full h-48 object-cover rounded mb-4"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded mb-4">
            <span className="text-gray-400">No image available</span>
          </div>
        )}

        <p className="text-sm mb-1"><span className="font-semibold">Category:</span> {biz.type}</p>
        <p className="text-sm mb-1">{biz.description}</p>
        <p className="text-sm mb-1"><span className="font-semibold">Location:</span> {biz.location}</p>
        <div className="mb-2">
          <span className="font-semibold">Features:</span>
          <ul className="list-disc list-inside">
            {biz.features.map((f, i) => (
              <li key={i} className="text-sm">{f}</li>
            ))}
          </ul>
        </div>
        {biz.contact && <p className="text-sm"><span className="font-semibold">Contact:</span> {biz.contact}</p>}
        <Button
          variant="secondary"
          className="mt-auto"
          onClick={() => router.push(`/booking/${biz.id}`)}
        >
          Book Now
        </Button>
      </div>
    ))}
  </div>
)}

      {/* Content */}
      {activeTab === "Events" && (
        // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">

          {events.length === 0 && <p className="text-center text-gray-400 col-span-full">No events found.</p>}
          {events.map((ev) => (
            // <div key={ev.id} className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col">
            <div key={ev.id} className="place-card bg-gray-800 p-5 rounded-lg shadow-md flex flex-col">

              <h3 className="text-xl font-bold mb-2">{ev.name}</h3>

              {/* Image */}
              {ev.image ? (
                <img
                  src={ev.image}
                  alt={ev.name}
                  className="w-full h-48 object-cover rounded mb-4"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded mb-4">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}

              <p className="text-sm mb-1">{formatDateRange(ev.start_date, ev.end_date)}</p>
              {ev.price !== undefined && <p className="text-sm mb-1">Starting from ₹{ev.price}</p>}
              <p className="text-sm mb-2"><span className="font-semibold">Location:</span> {ev.location}</p>
              <div className="mb-2">
                <span className="font-semibold">Features:</span>
                <ul className="list-disc list-inside">
                  {ev.features.map((f, i) => (
                    <li key={i} className="text-sm">{f}</li>
                  ))}
                </ul>
              </div>
              {ev.contact && <p className="text-sm"><span className="font-semibold">Contact:</span> {ev.contact}</p>}
              <Button
                variant="secondary"
                className="mt-auto"
                onClick={() => router.push(`/booking/${ev.id}`)}
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Others" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.length === 0 && <p className="text-center text-gray-400 col-span-full">No places found.</p>}
          {others.map((item) => (
            // <div key={item.id} className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col">
            <div key={item.id} className="place-card bg-gray-800 p-5 rounded-lg shadow-md flex flex-col">
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>

              {/* Image */}
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

              <p className="text-sm mb-1"><span className="font-semibold">Category:</span> {item.type}</p>
              <p className="text-sm mb-1">{item.description}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Location:</span> {item.location}</p>
              <div className="mb-2">
                <span className="font-semibold">Features:</span>
                <ul className="list-disc list-inside">
                  {item.features.map((f, i) => (
                    <li key={i} className="text-sm">{f}</li>
                  ))}
                </ul>
              </div>
              {item.contact && <p className="text-sm"><span className="font-semibold">Contact:</span> {item.contact}</p>}
              <Button
                variant="secondary"
                className="mt-auto"
                onClick={() => router.push(`/booking/${item.id}`)}
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  const fetchPlaces = async (lat?: number, lng?: number) => {
    try {
      const { data, error } = await supabase.from("places").select("*");
      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      const placesData: Place[] = data.map((p: any) => {
        let distance;
        if (lat !== undefined && lng !== undefined) {
          distance = getDistanceFromLatLonInKm(lat, lng, p.latitude, p.longitude);
        }

        return {
          id: p.id,
          name: p.name,
          type: p.type,
          coordinates: [p.latitude, p.longitude],
          distance,
          rating: p.rating,
          openingHours: p.opening_hours,
          image: p.image_url,
          description: p.description,
          contact: p.contact,
          start_date: p.start_date,
          end_date: p.end_date,
          price: p.price,
          location: p.location,
          features: Array.isArray(p.features) ? p.features : [],
        };
      });

      setPlaces(placesData);
      const cats = Array.from(new Set(placesData.map((p) => p.type)));
      setCategories(["All", ...cats]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchPlaces();
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        fetchPlaces(latitude, longitude);
      },
      (error) => {
        console.warn("Location access denied:", error.message);
        setLocationDenied(true);
        fetchPlaces();
      }
    );
  }, []);

  // Filtering logic based on search and category
  const filteredPlaces = places.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.type === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate places into events and others
const events = filteredPlaces.filter((p) => p.type.toLowerCase() === "event");
const business = filteredPlaces.filter((p) => p.type.toLowerCase() === "business");
const others = filteredPlaces.filter(
  (p) => p.type.toLowerCase() !== "event" && p.type.toLowerCase() !== "business"
);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 pt-20">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Discover Nearby</h1>
          {currentLocation && (
            <Button
              variant="outline"
              onClick={() => fetchPlaces(currentLocation[0], currentLocation[1])}
            >
              <LocateFixed className="mr-2" size={16} />
              Near Me
            </Button>
          )}
        </div>

        {/* Search bar + category selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-1/2">
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              size={16}
            />
          </div>
          <select
            className="bg-gray-800 text-gray-200 rounded p-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs with events and others */}
        {/* <CategoryTabs events={events} others={others} /> */}
        <CategoryTabs business={business} events={events} others={others}  />

      </div>
    </div>
  );
}
