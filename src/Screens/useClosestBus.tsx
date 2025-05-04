import { createContext, useContext, useState, ReactNode } from 'react';

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

interface ClosestBusContextType {
  closest: ClosestBusItem | null;
  setClosest: (bus: ClosestBusItem | null) => void;
  closestBuses: ClosestBusItem[];
  setClosestBuses: (buses: ClosestBusItem[]) => void;
}

const ClosestBusContext = createContext<ClosestBusContextType | undefined>(undefined);

interface ClosestBusProviderProps {
  children: ReactNode;
}

export const ClosestBusProvider = ({ children }: ClosestBusProviderProps) => {
  const [closest, setClosest] = useState<ClosestBusItem | null>(null);
  const [closestBuses, setClosestBuses] = useState<ClosestBusItem[]>([]);

  return (
    <ClosestBusContext.Provider value={{ closest, setClosest, closestBuses, setClosestBuses }}>
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
