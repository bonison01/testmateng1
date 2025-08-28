"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LocateFixed, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import EventHero from "@/components/events/EventHero";
import EventCategoryIcons from "@/components/events/EventCategoryIcons";
import BusinessList from "@/components/discovery/BusinessList";
import OthersList from "@/components/discovery/OthersList";

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

export default function DiscoverPage() {
  const dispatch = useDispatch();

  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<"Business" | "Events" | "Others">("Business");

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
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

  // Filter and categorize places
  const filteredPlaces = places.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const events = filteredPlaces.filter((p) => p.type.toLowerCase() === "event");
  const business = filteredPlaces.filter((p) => p.type.toLowerCase() === "business");
  const others = filteredPlaces.filter(
    (p) => p.type.toLowerCase() !== "event" && p.type.toLowerCase() !== "business"
  );

  const featuredEvent =
    events.find((e) => e.name === "Echoes of Earth, 2025") || events[0];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 pt-20">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        {/* Main Tabs */}
        <div className="flex gap-6 border-b border-gray-700 mb-4">
          {["Business", "Events", "Others"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "Business" | "Events" | "Others")}
              className={`px-4 py-2 font-semibold ${
                activeTab === tab
                  ? "border-b-2 border-purple-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-1/2">
          <Input
            placeholder={`Search ${activeTab === "Events" ? "events" : "places"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-gray-200"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
        </div>

        {/* Active Tab Content */}
        {activeTab === "Events" ? (
  <>
    <EventCategoryIcons /> {/* Always show icons */}

    {events.length === 0 ? (
  <div className="flex flex-col items-center justify-center mt-10 gap-4">
    <img
      src="/coming-soon.svg" // or use a suitable icon from your assets
      alt="Coming Soon"
      className="w-40 h-40 opacity-70"
    />
    <h2 className="text-xl font-bold text-gray-100">Coming Soon!</h2>
    <p className="text-gray-400 text-center max-w-sm">
      We're working on bringing exciting events to your area. Check back later!
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

        <div className="w-full mt-4">
          <h2 className="text-xl font-semibold text-white mb-4">Other Events</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {events
              .filter((e) => e.id !== featuredEvent?.id)
              .map((event) => (
                <div
                  key={event.id}
                  onClick={() => (window.location.href = `/booking/${event.id}`)}
                  className="relative flex flex-col items-center justify-end p-4 rounded-lg bg-gray-800 text-gray-200 min-w-[150px] aspect-square shadow-lg hover:bg-gray-700 transition-colors cursor-pointer overflow-hidden"
                >
                  <img
                    src={event.image || "/placeholder.jpg"}
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                  <div className="relative z-10 w-full bg-black bg-opacity-60 rounded-b-lg p-2 text-center">
                    <h3 className="text-sm font-semibold truncate">{event.name}</h3>
                    <p className="text-xs text-gray-300 mt-1">
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
  <BusinessList business={business} />
) : (
  <OthersList others={others} />
)}

      </div>
    </div>
  );
}
