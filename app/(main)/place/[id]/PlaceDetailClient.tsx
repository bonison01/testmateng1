"use client";

import { useRouter } from "next/navigation";
import styles from "../PlaceDetail.module.css";

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

export function PlaceDetailClient({ place }: { place: Place }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 pt-20">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        ← Back
      </button>

      <div className={styles.container}>
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
      </div>
    </div>
  );
}
