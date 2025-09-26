"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

const categories = ["Business", "Hangout", "Food", "Events", "Other"];

export default function AddPlacePage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [features, setFeatures] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Upload all images and return JSON stringified array of public URLs
  const uploadImages = async (files: File[]): Promise<string | null> => {
    const urls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `place-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("places-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("places-images")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        urls.push(publicUrlData.publicUrl);
      }
    }

    return JSON.stringify(urls);
  };

  const handleSubmit = async () => {
    setUploading(true);
    setSuccessMessage("");

    let imageUrl: string | null = null;

    if (imageFiles.length > 0) {
      imageUrl = await uploadImages(imageFiles);
      if (!imageUrl) {
        alert("❌ Failed to upload images.");
        setUploading(false);
        return;
      }
    }

    const parsedPrice = parseFloat(price);
    const validPrice = !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : null;

    const featuresArray = features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const { error } = await supabase.from("places").insert([
      {
        name: name || null,
        type: type || null,
        opening_hours: openingHours || null,
        image_url: imageUrl,
        description: description || null,
        contact: contact || null,
        start_date: type === "Events" ? startDate || null : null,
        end_date: type === "Events" ? endDate || null : null,
        price: type === "Events" ? validPrice : null,
        location: location || null,
        features: featuresArray.length > 0 ? featuresArray : null,
        // nearby_places: nearbyPlaces || null,
        nearby_places: nearbyPlaces
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0) || null,

      },
    ]);

    setUploading(false);

    if (error) {
      console.error("Insert error:", error);
      alert("❌ Failed to add place: " + error.message);
    } else {
      setSuccessMessage("✅ Place added successfully!");
      // Reset form
      setName("");
      setType("");
      setOpeningHours("");
      setDescription("");
      setContact("");
      setStartDate("");
      setEndDate("");
      setPrice("");
      setLocation("");
      setFeatures("");
      setNearbyPlaces("");
      setImageFiles([]);
    }
  };

  const handleCSVUpload = (file: File) => {
    setUploading(true);
    setSuccessMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as Record<string, any>[];

        try {
          const { error } = await supabase.from("places").insert(
            data.map((row) => ({
              name: row.name || null,
              type: row.type || null,
              latitude: row.latitude ? parseFloat(row.latitude) : null,
              longitude: row.longitude ? parseFloat(row.longitude) : null,
              rating: row.rating ? parseFloat(row.rating) : null,
              opening_hours: row.opening_hours || null,
              image_url: row.image_url || null,
              description: row.description || null,
              contact: row.contact || null,
              start_date: row.start_date || null,
              end_date: row.end_date || null,
              price: row.price ? parseFloat(row.price) : null,
              location: row.location || null,
              features: row.features
                ? row.features.split(",").map((f: string) => f.trim())
                : null,
              nearby_places: row.nearby_places || null,
              category: row.category || null,
              user_id: row.user_id || null,
              ads: row.ads || null,
              ads_url: row.ads_url || null,
              ads_no: row.ads_no || null,
            }))
          );

          if (error) {
            console.error("Bulk insert error:", error);
            alert("❌ Bulk insert failed: " + error.message);
          } else {
            setSuccessMessage("✅ Bulk upload successful!");
          }
        } catch (err) {
          console.error("Unexpected error:", err);
          alert("❌ Unexpected error during bulk upload.");
        }
        setUploading(false);
      },
      error: (err) => {
        alert("❌ CSV parse error: " + err.message);
        setUploading(false);
      },
    });
  };

  const handleDownloadSample = () => {
    const sampleCSV = `name,type,latitude,longitude,rating,opening_hours,image_url,description,contact,start_date,end_date,price,location,features,nearby_places,category,user_id,ads,ads_url,ads_no
Sample Place,Business,12.9716,77.5946,4.5,9am-9pm,,A sample description,1234567890,,,,Sample Location,"Wifi,Parking","Mall, Metro Station",Business,userid123,,,`;

    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_places.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">➕ Add New Place</h1>

        <label className="block mb-1">Place Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sunset Cafe"
          className="mb-4"
        />

        <label className="block mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded mb-4"
        >
          <option value="">-- Select Type --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="block mb-1">Opening Hours</label>
        <Input
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          placeholder="e.g., 10:00 AM - 9:00 PM"
          className="mb-4"
        />

        <label className="block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the place"
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white resize-none"
          rows={3}
        />

        <label className="block mb-1">Contact</label>
        <Input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
          className="mb-4"
        />

        {type === "Events" && (
          <>
            <label className="block mb-1">Start Date</label>
            <Input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              className="mb-4"
            />

            <label className="block mb-1">End Date</label>
            <Input
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              type="date"
              className="mb-4"
            />

            <label className="block mb-1">Price (₹)</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 499.99"
              className="mb-4"
            />
          </>
        )}

        <label className="block mb-1">Location</label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Address or area"
          className="mb-4"
        />

        <label className="block mb-1">Features (comma separated)</label>
        <Input
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="e.g., Wifi, Parking, Pet Friendly"
          className="mb-4"
        />

        <label className="block mb-1">Nearby Places (comma separated)</label>
        <Input
          value={nearbyPlaces}
          onChange={(e) => setNearbyPlaces(e.target.value)}
          placeholder="e.g., Mall, Metro, Park"
          className="mb-6"
        />

        <label className="block mb-1">Images (multiple allowed)</label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="mb-4"
        />

        {imageFiles.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-4">
            {imageFiles.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt={`Preview ${idx}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={uploading} className="w-full mb-6">
          {uploading ? "Saving..." : "Save Place"}
        </Button>

        {successMessage && (
          <p className="text-green-400 mb-6">{successMessage}</p>
        )}

        {/* Bulk Upload */}
        <div className="border-t border-gray-600 pt-6">
          <label className="block mb-1">📄 Bulk Upload via CSV</label>
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleCSVUpload(e.target.files[0]);
              }
            }}
            className="mb-2"
          />
          <Button variant="outline" className="w-full" onClick={handleDownloadSample}>
            ⬇️ Download Sample CSV
          </Button>
          <p className="text-sm text-gray-400 mt-2">
            Columns must match:<br />
            <code>
              name, type, latitude, longitude, rating, opening_hours, image_url, description, contact,
              start_date, end_date, price, location, features, nearby_places, category, user_id, ads, ads_url, ads_no
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
