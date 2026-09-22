/**
 * Location Service: Manages real device geolocation, user manual city/neighborhood,
 * and builds real Google Maps / Waze URLs without fake data.
 */

export interface UserLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  cityOrNeighborhood?: string;
  source: 'gps' | 'manual' | 'none';
}

const LOCATION_STORAGE_KEY = 'qual_e_a_sua_dor:user_location';

export const locationService = {
  getStoredLocation(): UserLocation {
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { source: 'none' };
  },

  saveLocation(loc: UserLocation): void {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // ignore
    }
  },

  async requestCurrentGps(): Promise<UserLocation> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocalização não suportada no seu navegador.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            source: 'gps',
          };
          this.saveLocation(loc);
          resolve(loc);
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  setManualLocation(cityOrNeighborhood: string): UserLocation {
    const loc: UserLocation = {
      cityOrNeighborhood: cityOrNeighborhood.trim(),
      source: 'manual',
    };
    this.saveLocation(loc);
    return loc;
  },

  clearLocation(): void {
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Generates a real Google Maps search URL based on the real location or query.
   * Never invents fake establishments.
   */
  buildGoogleMapsSearchUrl(searchQuery: string, userLoc?: UserLocation): string {
    const loc = userLoc || this.getStoredLocation();
    const query = searchQuery.trim();

    if (loc.source === 'gps' && loc.latitude && loc.longitude) {
      // If we have exact GPS coords, search near those coordinates
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=&center=${loc.latitude},${loc.longitude}`;
    }

    if (loc.source === 'manual' && loc.cityOrNeighborhood) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} em ${loc.cityOrNeighborhood}`)}`;
    }

    // Default: search query near user's IP/browser location in Google Maps
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} perto de mim`)}`;
  },

  /**
   * Generates a direct Google Maps Directions URL
   */
  buildDirectionsUrl(destinationQuery: string, userLoc?: UserLocation): string {
    const loc = userLoc || this.getStoredLocation();
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`;
    if (loc.source === 'gps' && loc.latitude && loc.longitude) {
      url += `&origin=${loc.latitude},${loc.longitude}`;
    }
    return url;
  },
};
