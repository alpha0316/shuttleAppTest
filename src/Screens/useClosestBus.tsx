import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Driver {
  busID: string;
  coords: Coordinates;
}

export interface ClosestBusItem {
  driver: Driver;
  distance: number;
}


export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  transitionDuration?: number;
}

interface ClosestBusContextType {
  closest: ClosestBusItem | null;
  setClosest: (bus: ClosestBusItem | null) => void;
  closestBuses: ClosestBusItem[];
  setClosestBuses: (buses: ClosestBusItem[]) => void;
  mapViewState: MapViewState;
  setMapViewState: (state: MapViewState) => void;
  updateMapToFollowBus: (immediately?: boolean) => void;
}

const DEFAULT_LONGITUDE = -1.573568;
const DEFAULT_LATITUDE = 6.678045;
const DEFAULT_ZOOM = 14.95;
const DEFAULT_TRANSITION_DURATION = 500


const ClosestBusContext = createContext<ClosestBusContextType>({
  closest: null,
  setClosest: () => {},
  closestBuses: [] as ClosestBusItem[],  // Explicitly typed empty array
  setClosestBuses: () => {},
  mapViewState: {
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: DEFAULT_ZOOM,
    transitionDuration: DEFAULT_TRANSITION_DURATION
  },
  setMapViewState: () => {},
  updateMapToFollowBus: () => {}
});

interface ClosestBusProviderProps {
  children: ReactNode;
}

export const ClosestBusProvider = ({ children }: ClosestBusProviderProps) => {
  const [closest, setClosest] = useState<ClosestBusItem | null>(null);
  const [closestBuses, setClosestBuses] = useState<ClosestBusItem[]>([]);
  const [mapViewState, setMapViewState] = useState<MapViewState>({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: DEFAULT_ZOOM,
    transitionDuration: DEFAULT_TRANSITION_DURATION
  });

  const updateMapToFollowBus = (immediately: boolean = false) => {
    if (closest?.driver?.coords) {
      setMapViewState(prevState => ({
        ...prevState,
        longitude: closest.driver.coords.longitude,
        latitude: closest.driver.coords.latitude,
        transitionDuration: immediately ? 0 : DEFAULT_TRANSITION_DURATION
      }));
      console.log('Updating map view to follow closest bus:', closest.driver.busID);
    }
  };

  useEffect(() => {
    if (closest?.driver?.coords) {
      updateMapToFollowBus();
    }
  }, [closest]);

  return (
    <ClosestBusContext.Provider value={{ closest, setClosest, closestBuses, setClosestBuses,  mapViewState,
      setMapViewState,
      updateMapToFollowBus }}>
      {children}
    </ClosestBusContext.Provider>
  );
};

export const useClosestBus = () => {
  const context = useContext(ClosestBusContext);
  if (!context) {
    throw new Error('useClosestBus must be used within a ClosestBusProvider');
  }
  return context;
};
