"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Rate {
  id: string;
  pickup_location: string;
  drop_location: string;
  std_rate: number;
  instant_rate: number;
  light_vehicle_rate: number;
}

export default function RouteRatesPage() {
  const [pickupLocations, setPickupLocations] = useState<string[]>([]);
  const [activePickup, setActivePickup] = useState<string>("");
  const [rates, setRates] = useState<Rate[]>([]);
  const [searchDrop, setSearchDrop] = useState<string>("");

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    const { data, error } = await supabase.from("route_rates").select("*");
    if (error) {
      console.error("Error fetching rates:", error.message);
      return;
    }

    const uniquePickupLocations = Array.from(
      new Set(data.map((r) => r.pickup_location))
    );

    setPickupLocations(uniquePickupLocations);
    setActivePickup(uniquePickupLocations[0]);
    setRates(data);
  };

  const filteredRates = rates
    .filter((r) => r.pickup_location === activePickup)
    .filter((r) =>
      r.drop_location.toLowerCase().includes(searchDrop.toLowerCase())
    );

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Select Your Route</h1>

      {/* Pickup Tabs */}
      <Tabs
        defaultValue={activePickup}
        onValueChange={(v) => setActivePickup(v)}
        className="mb-6"
      >
        <TabsList>
          {pickupLocations.map((loc) => (
            <TabsTrigger key={loc} value={loc}>
              {loc}
            </TabsTrigger>
          ))}
        </TabsList>

        {pickupLocations.map((loc) => (
          <TabsContent key={loc} value={loc}>
            <div className="mb-4">
              <Input
                placeholder="Search drop location..."
                value={searchDrop}
                onChange={(e) => setSearchDrop(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {filteredRates.length === 0 ? (
              <p className="text-gray-400">No matching drop locations.</p>
            ) : (
              <div className="grid gap-4">
                {filteredRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="bg-gray-800 rounded p-4 shadow-md flex justify-between items-center"
                  >
                    <div>
                      <h2 className="text-lg font-semibold">{rate.drop_location}</h2>
                      <p className="text-sm text-gray-400">Standard: ₹{rate.std_rate}</p>
                      <p className="text-sm text-gray-400">Instant: ₹{rate.instant_rate}</p>
                      <p className="text-sm text-gray-400">Light Vehicle: ₹{rate.light_vehicle_rate}</p>
                    </div>
                    <Button variant="secondary">Book Now</Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
