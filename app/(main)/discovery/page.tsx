"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/cart/cartSlice";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { LocateFixed, Search } from "lucide-react";
import GetCurrentLocation from "@/components/map/GetCurrentLocation";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation"; // ✅ for App Router (app directory)





// const MapView = dynamic(() => import("@/components/discover/MapView"), {
//   ssr: false,
// });

interface Place {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  distance?: number; // km
  rating?: number;
  openingHours?: string;
  image?: string;
}

export default function DiscoverPage() {
  const dispatch = useDispatch();
const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch places from Supabase (with optional distance calculation)
  const fetchPlaces = async (lat?: number, lng?: number) => {
    try {
      const { data, error } = await supabase.from("places").select("*");

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      if (!data) return;

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
        };
      });

      setPlaces(placesData);
      setFilteredPlaces(placesData);

      const cats = Array.from(new Set(placesData.map((p) => p.type)));
      setCategories(["All", ...cats]);
    } catch (err) {
      console.error(err);
    }
  };

  // Attempt to get user location on mount — if denied, mark locationDenied and load places without distance
  useEffect(() => {
    if (!navigator.geolocation) {
      // Geolocation not supported, load all places
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
        console.warn("Location access denied or unavailable:", error.message);
        setLocationDenied(true);
        fetchPlaces(); // fetch without location
      }
    );
  }, []);

  // Filter places by search and category
  useEffect(() => {
    let filtered = [...places];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.type === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlaces(filtered);
  }, [searchQuery, places, selectedCategory]);

  // Distance calculator helper (Haversine formula)
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  const handleAddToCart = (place: Place) => {
    const product = {
      id: Number(place.id),
      name: place.name,
      price_inr: 100,
      discounted_price: 80,
      media_urls: place.image ? [place.image] : [],
      quantity: 1,
      unit_quantity: "1 unit",
    };
    dispatch(addToCart(product));
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 pt-20  text-gray-200">
    <div className="w-full max-w-6xl flex flex-col gap-4">
      {/* Rest of your content stays unchanged here */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discover Nearby</h1>
        {currentLocation && (
          <Button
            variant="outline"
            onClick={() => {
              fetchPlaces(currentLocation[0], currentLocation[1]);
            }}
          >
            <LocateFixed className="mr-2" size={16} />
            Near Me
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-1/2">
          <Input
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2" size={16} />
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

      {/* Map View */}
      <div className="h-96 rounded overflow-hidden shadow-lg mb-6">
        {/* Uncomment when ready */}
        {/* <MapView places={filteredPlaces} currentLocation={currentLocation} /> */}
      </div>

      {/* Places Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => (
          <div key={place.id} className="bg-gray-800 rounded-lg p-4 flex flex-col">
            {place.image && (
              <img
                src={place.image}
                alt={place.name}
                className="h-36 w-full object-cover rounded-md mb-2"
              />
            )}
            <h3 className="text-lg font-semibold">{place.name}</h3>
            {place.distance !== undefined && currentLocation && (
              <p className="text-sm">Distance: {place.distance.toFixed(1)} km</p>
            )}
            {place.rating !== undefined && <p className="text-sm">Rating: {place.rating}</p>}
            {place.openingHours && <p className="text-sm">{place.openingHours}</p>}
            {/* <Button
              variant="secondary"
              className="mt-auto"
              onClick={() => handleAddToCart(place)}
            >
              Navigate & Add to Cart
            </Button> */}
            <Button
  variant="secondary"
  className="mt-auto"
  onClick={() => router.push(`/booking/${place.id}`)}
>
  Book Now
</Button>

          </div>
        ))}
      </div>
    </div>
  </div>
);

}
