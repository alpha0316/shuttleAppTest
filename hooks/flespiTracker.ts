// config/flespi.ts
export const FLESPI_CONFIG = {
  TOKEN: 'ckunRqa49edO1IQp5lto7rwO0JK8Lxyu5ERKSxRPuPjaVbEfr4IXdaJxba2Sez1T',
  CHANNEL_ID: '1328697',
  API_BASE: 'https://flespi.io',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000,
} as const;

// types/flespi.ts
export interface FlespiMessage {
  timestamp: number;
  'position.latitude'?: number;
  'position.longitude'?: number;
  'position.speed'?: number;
  'position.direction'?: number;
  'position.altitude'?: number;
  ident?: string;
  'device.id'?: number;
  [key: string]: any;
}

export interface TrackerCoordinates {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  altitude: number;
  timestamp: string;
  rawData: FlespiMessage;
}

export interface FlespiHookResult {
  coordinates: TrackerCoordinates[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}