type FixedRateTier = {
  maxKm: number;
  rate: number;
  type: 'fixed';
};

type VariableRateTier = {
  maxKm: number;
  base: number;
  perKm: number;
  type: 'variable';
};

type PricingTier = FixedRateTier | VariableRateTier;

// Define pricing tiers for a two-wheeler vehicle
const twoWheelerTiers: PricingTier[] = [
  { maxKm: 4, rate: 60, type: 'fixed' },
  { maxKm: 7, base: 20, perKm: 15, type: 'variable' },
  { maxKm: 10, rate: 130, type: 'fixed' },
  { maxKm: 17, rate: 150, type: 'fixed' },
  { maxKm: 26, rate: 180, type: 'fixed' },
  { maxKm: 30, rate: 230, type: 'fixed' },
  { maxKm: 33, rate: 250, type: 'fixed' },
  { maxKm: 36, rate: 280, type: 'fixed' },
  { maxKm: Infinity, rate: 330, type: 'fixed' },
];

// Define pricing tiers for a light vehicle
const lightVehicleTiers: PricingTier[] = [
  { maxKm: 5, rate: 150, type: 'fixed' },
  { maxKm: 10, base: 50, perKm: 20, type: 'variable' },
  { maxKm: 20, rate: 350, type: 'fixed' },
  { maxKm: 30, rate: 450, type: 'fixed' },
  { maxKm: 50, rate: 600, type: 'fixed' },
  { maxKm: Infinity, base: 600, perKm: 10, type: 'variable' },
];

/**
 * Calculates the total delivery price based on distance and vehicle type.
 * @param distance The distance of the delivery in kilometers.
 * @param vehicleType The type of vehicle ('two-wheeler' or 'light-vehicle').
 * @returns The final price as a number.
 */
export const calculatePrice = (distance: number, vehicleType: 'two-wheeler' | 'light-vehicle'): number => {
  const tiers = vehicleType === 'two-wheeler' ? twoWheelerTiers : lightVehicleTiers;

  for (const tier of tiers) {
    if (distance <= tier.maxKm) {
      if (tier.type === 'fixed') {
        return tier.rate;
      } else {
        // TypeScript now knows 'tier' must be of type VariableRateTier here
        return tier.base + tier.perKm * distance;
      }
    }
  }

  // This part is a safe fallback, as the 'Infinity' tier should always be matched.
  const lastTier = tiers[tiers.length - 1];
  if (lastTier.type === 'fixed') {
    return lastTier.rate;
  }
  return 0;
};