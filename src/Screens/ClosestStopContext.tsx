import React, { createContext, useContext, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  speed?: number;        
  timestamp?: number;  
}

export interface Driver {
  busID: string;
  coords: Coordinates;
}

export interface ClosestBusItem {
  driver: Driver;
  distance: number;
}

export interface BusStop {
  latitude: number;
  longitude: number;
  name: string;
}


type ClosestStopContextType = {
  closestStopName: string | null;
  setClosestStopName: (name: string) => void;
  closestStop: BusStop | null;
  setClosestStop: (stop: BusStop | null) => void;
};


const ClosestStopContext = createContext<ClosestStopContextType | undefined>(undefined);

export const ClosestStopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [closestStopName, setClosestStopName] = useState<string | null>(null);
  const [closestStop, setClosestStop] = useState<BusStop | null>(null);

  return (
    <ClosestStopContext.Provider value={{ closestStopName, setClosestStopName, closestStop, setClosestStop }}>
      {children}
    </ClosestStopContext.Provider>
  );
};

export const useClosestStop = () => {
  const context = useContext(ClosestStopContext);
  if (!context) {
    throw new Error('useClosestStop must be used within ClosestStopProvider');
  }
  return context;
};
