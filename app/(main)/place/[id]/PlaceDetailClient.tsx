"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../PlaceDetail.module.css";
import { CommentsSection } from "./CommentsSection"; // Adjust path as needed

// ---------------------
// Type Definitions
// ---------------------

interface Place {
  id: string;
  name: string;
  image?: string;
  description?: string;
  location?: string;
  features: string[];
  contact?: string;
  type: string;
  price?: number;
}

interface Product {
  id: string;
  place_id: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
}

// ---------------------
// Main Component
// ---------------------

export function PlaceDetailClient({ place }: { place: Place }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromTab = searchParams.get("fromTab") || "Hangout & Foods"; // default tab
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);

  // Fetch Products for the place
  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("place_id", place.id);

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(productData || []);
    };

    fetchProducts();
  }, [place.id]);

  const handleBack = () => {
    // fallback: if no history (e.g., direct URL access), redirect manually
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(
        `/discover?tab=${encodeURIComponent(fromTab)}&search=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 pt-20">
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        ← Back
      </button>

      <div className={styles.container}>
        {/* Left Pane */}
        <div className={styles.leftPane}>
          {/* Place Details */}
          <div className={styles.content}>
            <h1 className={styles.title}>{place.name}</h1>

            {place.image ? (
              <img src={place.image} alt={place.name} className={styles.image} />
            ) : (
              <div className={styles.noImage}>
                <span>No image available</span>
              </div>
            )}

            <p className={styles.description}>{place.description}</p>

            <p className={styles.detail}>
              <strong>Type:</strong> {place.type}
            </p>
            <p className={styles.detail}>
              <strong>Location:</strong> {place.location}
            </p>

            {place.price && (
              <p className={styles.detail}>
                <strong>Price:</strong> ₹{place.price}
              </p>
            )}

            {place.contact && (
              <p className={styles.detail}>
                <strong>Contact:</strong>{" "}
                <a href={`mailto:${place.contact}`} className={styles.contactLink}>
                  {place.contact}
                </a>
              </p>
            )}

            <div>
              <strong>Features:</strong>
              <ul className={styles.featuresList}>
                {place.features.map((feature, i) => (
                  <li key={i} className={styles.featureItem} title={feature}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {place.contact && (
              <a href={`mailto:${place.contact}`} className={styles.buttonContact}>
                Contact Now
              </a>
            )}
          </div>

          {/* Products */}
          {products.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Products Available</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800 p-4 rounded shadow text-sm"
                  >
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                    )}
                    <p className="mb-1">{product.description}</p>
                    {product.price && (
                      <p className="text-blue-400 font-semibold">₹{product.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane */}
        <div className={styles.rightPane}>
          {/* Import and render the separated CommentsSection */}
          <CommentsSection placeId={place.id} />
        </div>
      </div>
    </div>
  );
}
