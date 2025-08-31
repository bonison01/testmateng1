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
}

interface Banner {
  id: string;
  image: string;
  link?: string;
}

export default function DiscoverPage() {
  const dispatch = useDispatch();

  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeTab, setActiveTab] = useState<"Business" | "Events" | "Others">("Business");

  // Distance calculation
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

  // Filtering
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-200 pt-20 px-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

        {/* Sticky Header: Tabs + Search */}
{/* <div className="sticky top-20 z-30 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 pb-4"> */}
<div className="sticky top-16 z-30 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 pb-4">


  {/* Tabs */}
  <div className="flex justify-center">
    <div className="inline-flex bg-gray-800 rounded-full p-1 shadow-lg">
      {["Business", "Events", "Others"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as "Business" | "Events" | "Others")}
          className={`px-4 py-2 rounded-full text-sm sm:text-base transition-all ${
            activeTab === tab
              ? "bg-green-500 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>

  {/* Search */}
  <div className="relative w-full sm:w-2/3 lg:w-1/2 mx-auto mt-4">
    <Input
      placeholder={`Search ${activeTab === "Events" ? "events" : "places"}...`}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.currentTarget.value)}
      className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 shadow focus:ring-2 focus:ring-green-500 focus:outline-none"
    />
    <Search
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      size={18}
    />
  </div>
</div>


        {/* Content */}
        {activeTab === "Events" ? (
          <>
            <EventCategoryIcons />

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-10 gap-4 text-center">
                <img src="/coming-soon.svg" alt="Coming Soon" className="w-32 h-32 opacity-70" />
                <h2 className="text-2xl font-bold text-gray-100">Coming Soon!</h2>
                <p className="text-gray-400 max-w-sm">We’re working on bringing exciting events to your area. Check back soon!</p>
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
                  <h2 className="text-xl font-semibold text-white mb-4">Other Events</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {events
                      .filter((e) => e.id !== featuredEvent?.id)
                      .map((event) => (
                        <div
                          key={event.id}
                          onClick={() => (window.location.href = `/booking/${event.id}`)}
                          className="relative group rounded-xl overflow-hidden bg-gray-800 shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
                        >
                          <img
                            src={event.image || "/placeholder.jpg"}
                            alt={event.name}
                            className="w-full h-40 object-cover group-hover:opacity-90 transition"
                          />
                          <div className="absolute bottom-0 w-full bg-black/60 p-2 text-center">
                            <h3 className="text-sm font-semibold truncate">{event.name}</h3>
                            <p className="text-xs text-gray-300">
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
          <BusinessList business={business} banners={banners} />
        ) : (
          <OthersList others={others} />
        )}
      </div>
    </div>
  );
}
