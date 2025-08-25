"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LocateFixed, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import CategoryTabs from "@/components/discovery/CategoryTabs";

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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of Earth in km
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

  // Apply filters
  const filteredPlaces = places.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.type === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Grouping
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

        {/* Search bar + Category */}
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

        {/* CategoryTabs component */}
        <CategoryTabs business={business} events={events} others={others} />
      </div>
    </div>
  );
}
