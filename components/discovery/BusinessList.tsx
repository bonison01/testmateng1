"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Place {
  id: string;
  name: string;
  type: string;
  category?: string;
  location?: string;
  image?: string;
  start_date?: string;
  end_date?: string;
  price?: number;
}

interface Banner {
  id: string;
  image: string;
  link?: string;
}

type Item = Place | { isBanner: true; banner: Banner };

interface BusinessListProps {
  business: Place[];
  banners: Banner[];
}

export default function BusinessList({ business, banners }: BusinessListProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const handleCardClick = (id: string) => {
    router.push(`/place/${id}`);
  };

  // ✅ Grouping by category
  const groupByCategory = (places: Place[]) => {
    return places.reduce((groups: Record<string, Place[]>, place) => {
      const category = place.category || "Uncategorized";
      if (!groups[category]) groups[category] = [];
      groups[category].push(place);
      return groups;
    }, {});
  };

  // ✅ Build list with random banners
  const buildItemsWithBanners = (places: Place[], banners: Banner[]): Item[] => {
    let items: Item[] = [...places];
    let results: Item[] = [];

    items.forEach((place, index) => {
      results.push(place);

      // 25% chance to insert a banner after a place
      if (Math.random() < 0.25 && banners.length > 0) {
        const randomBanner = banners[Math.floor(Math.random() * banners.length)];
        results.push({ isBanner: true, banner: randomBanner });
      }
    });

    return results;
  };

  // ✅ Filtering by category
  const filteredPlaces = useMemo(() => {
    if (selectedCategory === "All") return business;
    return business.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, business]);

  const grouped = groupByCategory(filteredPlaces);

  const allCategories = ["All", ...Object.keys(groupByCategory(business))];

  return (
    <div className="flex flex-col gap-10">
      {/* Category Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700"
        >
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Render grouped places */}
      {Object.keys(grouped).map((category) => {
        const items = buildItemsWithBanners(grouped[category], banners);

        return (
          <div key={category}>
            <h2 className="text-xl font-bold text-white mb-4">{category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {items.map((item, index) => {
                if ("isBanner" in item && item.isBanner) {
                  return (
                    <div
                      key={`banner-${item.banner.id}-${index}`}
                      className="col-span-2 md:col-span-3"
                    >
                      <img
                        src={item.banner.image}
                        alt="Ad Banner"
                        className="w-full h-40 object-cover rounded-lg cursor-pointer"
                        onClick={() => {
                          if (item.banner.link) router.push(item.banner.link);
                        }}
                      />
                    </div>
                  );
                }

                const place = item as Place;
                return (
                  <div
  key={place.id}
  onClick={() => handleCardClick(place.id)}
  // Added group, transitions, and enhanced hover effects
  className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow-lg 
             transition-all duration-300 ease-in-out
             hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
>
  {/* Image container for zoom effect */}
  <div className="overflow-hidden">
    {place.image && (
      <img
        src={place.image}
        alt={place.name}
        // Added transition and group-hover for a subtle zoom effect
        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out 
                   group-hover:scale-105"
      />
    )}
  </div>
  {/* Using space-y for cleaner vertical spacing */}
  <div className="p-4 space-y-2">
    <h3 className="text-lg font-semibold text-white transition-colors duration-200 
                   group-hover:text-green-400">
      {place.name}
    </h3>
    {place.location && (
      <p className="text-sm text-gray-400">{place.location}</p>
    )}
    {place.start_date && (
      <p className="text-sm text-gray-400">
        Starts: {new Date(place.start_date).toLocaleDateString()}
      </p>
    )}
    {place.price && (
      <p className="text-lg text-green-400 font-bold">
        ₹{place.price}
      </p>
    )}
  </div>
</div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
