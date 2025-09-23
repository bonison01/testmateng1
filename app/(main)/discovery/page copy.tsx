"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import EventHero from "@/components/events/EventHero";
import EventCategoryIcons from "@/components/events/EventCategoryIcons";
import BusinessList from "@/components/discovery/BusinessList";
import OthersList from "@/components/discovery/OthersList";
import HangoutList from "@/components/discovery/HangoutList";
import FeedbackForm from "@/components/FeedbackForm";

interface Place {
  id: string;
  name: string;
  type: string;
  category?: string;
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
  ads?: string;
  ads_url?: string;
  ads_no?: number;
}

interface Banner {
  id: string;
  image: string;
  link?: string;
}

// Simple Switch component to avoid missing import
function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-400 dark:bg-gray-600 peer-checked:bg-green-600 transition"></div>
      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        {checked ? "Dark" : "Light"}
      </span>
    </label>
  );
}

export default function DiscoverPage() {
  const dispatch = useDispatch();

  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeTab, setActiveTab] = useState<"Business" | "Events" | "Others" | "Hangout & Foods">("Hangout & Foods");
  const [isDarkMode, setIsDarkMode] = useState(true);

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
    return (deg * Math.PI) / 180;
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
          category: p.category,
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
          ads: p.ads,
          ads_url: p.ads_url,
          ads_no: p.ads_no,
        };
      });

      setPlaces(placesData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase.from("banners").select("*");
      if (error) {
        console.error("Error fetching banners:", error);
        return;
      }

      const formattedBanners: Banner[] = data.map((b: any) => ({
        id: b.id,
        image: b.image_url,
        link: b.link,
      }));

      setBanners(formattedBanners);
    } catch (err) {
      console.error("Banner fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchBanners();

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

  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const events = filteredPlaces.filter((p) => p.type.trim().toLowerCase() === "event");
  const business = filteredPlaces.filter((p) => p.type.trim().toLowerCase() === "business");
  const others = filteredPlaces.filter((p) => {
    const t = p.type.trim().toLowerCase();
    return t !== "event" && t !== "business";
  });

  const hangouts = filteredPlaces.filter((p) => {
    const cat = (p.category || "").trim().toLowerCase();
    const isHangoutOrFood = cat.includes("hangout") || cat.includes("food");
    const isNotEvent = p.type.trim().toLowerCase() !== "event";
    return isHangoutOrFood && isNotEvent;
  });

  // Insert sample ad into hangouts
  // hangouts.unshift({
  //   id: "sample-ad-1",
  //   name: "Sample Ad",
  //   type: "place",
  //   category: "Food",
  //   coordinates: [0, 0],
  //   features: [],
  //   ads: "Yes",
  //   ads_url: "https://via.placeholder.com/800x400.png?text=Sample+Ad+Banner",
  //   ads_no: 1,
  // });

  const featuredEvent =
    events.find((e) => e.name === "Echoes of Earth, 2025") || events[0];

  return (
    <div
      className={`min-h-screen pt-10 px-4 ${isDarkMode
        ? "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-200"
        : "bg-white text-gray-900"
        }`}
    >
      <div className="w-full mx-auto flex flex-col gap-6">

        {/* === Sticky Header === */}
        <div
          className={`sticky top-15 z-30 pb-4 ${isDarkMode
            ? "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 border-b border-gray-700"
            : "bg-white border-b border-gray-300"
            }`}
        >
          {/* === Tabs + Search + Switch === */}
          <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-2 ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
            {/* Tabs */}
            <div className="flex flex-wrap gap-4">
              {["Hangout & Foods","Business",  "Events", "Others"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`relative pb-2 text-sm sm:text-base font-medium transition-colors duration-200 ${isActive
                      ? isDarkMode
                        ? "text-white"
                        : "text-green-600"
                      : isDarkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-green-600"
                      }`}
                  >
                    {tab}
                    {isActive && (
                      <span
                        className={`absolute left-0 bottom-0 w-full h-0.5 rounded-full ${isDarkMode ? "bg-green-500" : "bg-green-600"
                          }`}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Switch */}
            {/* Search + Switch */}
<div className="w-full flex flex-col sm:flex-row sm:items-center sm:gap-4 sm:ml-auto mt-2 sm:mt-0">
  {/* Search Input */}

  {/* Dark Mode Switch */}
  <div className="mt-2 sm:mt-0 sm:ml-2">
    <Switch checked={isDarkMode} onChange={setIsDarkMode} />
  </div>
  <div className="relative w-full sm:w-64">
    <Input
      placeholder={`Search ${activeTab === "Events"
        ? "events"
        : activeTab === "Hangout & Foods"
          ? "hangouts or food places"
          : "places"
        }...`}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.currentTarget.value)}
      className={`pl-10 pr-4 py-2 rounded-lg shadow focus:ring-2 focus:outline-none text-sm sm:text-base ${isDarkMode
        ? "bg-gray-800 border border-gray-700 text-gray-200 focus:ring-green-500"
        : "bg-gray-100 border border-gray-300 text-gray-900 focus:ring-green-600"
        }`}
    />
    <Search
      className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}
      size={16}
    />
  </div>

  
</div>

          </div>
        </div>

        {/* === Main Content === */}
        <div className="pt-6">
          {activeTab === "Events" ? (
            <>
              <EventCategoryIcons />
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-10 gap-4 text-center">
                  <img
                    src="/coming-soon.svg"
                    alt="Coming Soon"
                    className="w-32 h-32 opacity-70"
                  />
                  <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-900">
                    Coming Soon!
                  </h2>
                  <p className="text-gray-400 dark:text-white-700 max-w-sm">
                    We’re working on bringing exciting events to your area. Check back soon!
                  </p>
                </div>
              ) : (
                <>
                  {featuredEvent && (
                    <EventHero
                      event={{
                        id: featuredEvent.id,
                        name: featuredEvent.name,
                        location: featuredEvent.location,
                        start_date: featuredEvent.start_date ?? "",
                        end_date: featuredEvent.end_date ?? "",
                        price: featuredEvent.price ?? 0,
                        image: featuredEvent.image ?? "/placeholder.jpg",
                      }}
                    />
                  )}

                  <div className="w-full mt-6">
                    <h2
                      className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                      Other Events
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {events
                        .filter((e) => e.id !== featuredEvent?.id)
                        .map((event) => (
                          <div
                            key={event.id}
                            onClick={() => (window.location.href = `/booking/${event.id}`)}
                            className={`relative group rounded-xl overflow-hidden shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer ${isDarkMode ? "bg-gray-800" : "bg-gray-100"
                              }`}
                          >
                            <img
                              src={event.image || "/placeholder.jpg"}
                              alt={event.name}
                              className="w-full h-40 object-cover group-hover:opacity-90 transition"
                            />
                            <div
                              className={`absolute bottom-0 w-full p-2 text-center ${isDarkMode ? "bg-black/60" : "bg-white/80"
                                }`}
                            >
                              <h3
                                className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                              >
                                {event.name}
                              </h3>
                              <p
                                className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                  }`}
                              >
                                {event.start_date
                                  ? new Date(event.start_date).toLocaleDateString()
                                  : "TBA"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : activeTab === "Business" ? (
            <BusinessList business={business} banners={banners} isDarkMode={isDarkMode} />
          ) : activeTab === "Hangout & Foods" ? (
            <HangoutList hangouts={hangouts} isDarkMode={isDarkMode} />
          ) : (
            <OthersList others={others} />
          )}
        </div>
      </div>
      <FeedbackForm isDarkMode={isDarkMode} />

    </div>
  );
}
