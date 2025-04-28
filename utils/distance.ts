// utils/distance.ts
interface Coordinates {
    longitude: number;
    latitude: number;
  }

export function haversineDistance(
    coord1: Coordinates,
    coord2: Coordinates,
    unit: 'km' | 'miles' = 'km'
  ): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;
  
    const R = unit === 'km' ? 6371 : 3958.8; // Earth's radius in km or miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
  
    return distance;
  }