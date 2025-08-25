"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = ["Food", "Craft", "Music", "Art", "Games", "Other"];

export default function AddPlacePage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `place-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("places-images") // <-- change to your bucket name
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

    return publicUrlData?.publicUrl ?? null;
  };

  // Submit handler
  const handleSubmit = async () => {
    setUploading(true);
    setSuccessMessage("");

    let imageUrl = "";

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        alert("❌ Image upload failed.");
        setUploading(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    // Validate rating: only allow number between 0 and 5, else null
    const parsedRating = parseFloat(rating);
    const validRating =
      !isNaN(parsedRating) && parsedRating >= 0 && parsedRating <= 5
        ? parsedRating
        : null;

    const { error } = await supabase.from("places").insert([
      {
        name: name || null,
        type: type || null,
        rating: validRating,
        opening_hours: openingHours || null,
        image_url: imageUrl,
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
      setRating("");
      setOpeningHours("");
      setImageFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">➕ Add New Place</h1>

        {/* Name */}
        <label className="block mb-1">Place Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sunset Cafe"
          className="mb-4"
        />

        {/* Type */}
        <label className="block mb-1">Category</label>
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

        {/* Rating */}
        <label className="block mb-1">Rating (0 to 5)</label>
        <Input
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="e.g., 4.5"
          type="number"
          step="0.1"
          min="0"
          max="5"
          className="mb-4"
        />

        {/* Opening Hours */}
        <label className="block mb-1">Opening Hours</label>
        <Input
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          placeholder="e.g., 10:00 AM - 9:00 PM"
          className="mb-4"
        />

        {/* Image Upload */}
        <label className="block mb-1">Image</label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mb-6"
        />

        <Button onClick={handleSubmit} disabled={uploading} className="w-full">
          {uploading ? "Saving..." : "Save Place"}
        </Button>

        {successMessage && (
          <p className="text-green-400 mt-4">{successMessage}</p>
        )}
      </div>
    </div>
  );
}
