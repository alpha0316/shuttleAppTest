// // BusContext.js
// import React, { createContext, useState, useContext, useEffect } from 'react';

// const BusContext = createContext();

// interface BusContext {
//   closestDropPoint: any; // Replace `any` with the actual type of `closestDropPoint`
//   setClosestDropPoint: (value: any) => void; // Replace `any` with the actual type
// }

// export const BusProvider = ({ children }) => {
//   const [closest, setClosest] = useState(null);
//   const [closestDropPoint, setClosestDropPoint] = useState<{
//     latitude: number;
//     longitude: number;
//     name: string;
//   } | null>(null);
//   const [startPoint, setStartPoint] = useState(null);
//   const [filterDrivers, setFilterDrivers] = useState([]);
  
//   // Your existing calculation logic can go here
//   useEffect(() => {
//     if (!closest || filterDrivers.length === 0) {
//       return;
//     }
    
//     // Your calculation logic for closestDropPoint
//     // ...
    
//   }, [closest, filterDrivers, startPoint]);
  
//   const value = {
//     closest,
//     setClosest,
//     closestDropPoint,
//     setClosestDropPoint,
//     startPoint,
//     setStartPoint,
//     filterDrivers,
//     setFilterDrivers
//   };
  
//   return (
//     <BusContext.Provider value={value}>
//       {children}
//     </BusContext.Provider>
//   );
// };

// export const useBus = () => {
//   const context = useContext(BusContext);
//   if (context === undefined) {
//     throw new Error('useBus must be used within a BusProvider');
//   }
//   return context;
// };