// ClosestStopContext.tsx
import React, { createContext, useContext, useState } from 'react';

type ClosestStopContextType = {
  closestStopName: string | null;
  setClosestStopName: (name: string) => void;
};

const ClosestStopContext = createContext<ClosestStopContextType | undefined>(undefined);

export const ClosestStopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [closestStopName, setClosestStopName] = useState<string | null>(null);

  return (
    <ClosestStopContext.Provider value={{ closestStopName, setClosestStopName }}>
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
