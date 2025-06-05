import { useState, useEffect, useRef, } from 'react';
import Map, { Marker, Source, Layer, GeolocateControl, ViewState as MapViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { solveTSP } from './../components/solveTSP'; 
import { haversineDistance } from './../../utils/distance'
import { useClosestStop, BusStop  } from './../Screens/ClosestStopContext';
import {useClosestBus } from '../Screens/useClosestBus'
// import {useShuttleSocket} from './../../hooks/useShuttleSocket'
import { io, Socket } from 'socket.io-client';


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGhlbG9jYWxnb2RkIiwiYSI6ImNtMm9ocHFhYTBmczQya3NnczhoampiZ3gifQ.lPNutwk6XRi_kH_1R1ebiw';
const SOCKET_SERVER_URL = 'wss://shuttle-backend-0.onrender.com';


interface Coordinates {
  latitude: number;
  longitude: number;
  speed?: number;        
  timestamp?: number;    
}

interface DropPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface Route {
  geometry: GeoJSON.Geometry; 
  distance: number;
  duration: number;
  start: Coordinates;
  end: Coordinates;
  stops: string[];
}



interface MapGLProps {
  selectedLocation: Coordinates | null;
  dropOffLocation: Coordinates | null;
  isHomepage?: boolean;
  pickUpLocation: Coordinates | null;
  dropPoints?: DropPoint[];
  // buses: Bus[];
}


interface Driver  {
  busID: string; 
  active: boolean; 
  busRoute: Route[];
  coords : Coordinates
}

interface ExtendedViewState extends Partial<MapViewState> {
  transitionDuration?: number;
}


interface DropPoint {
  name: string;
  
}




function MapGL({
  selectedLocation,
  dropOffLocation,
  isHomepage = false,
  pickUpLocation,
  dropPoints = [],
  // onClosestStopChange 
}: MapGLProps) {

  
  useEffect(() => {
    // Initialize socket connection
    const socket: Socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    // When socket connects
    socket.on('connect', () => {
      console.log('✅ Connected to server with ID:', socket.id);

      const userData = {
        name: "Test User",
        busStopId: "BUS-STOP-001",
        busStopName: "Main Campus Stop",
      };

      console.log("🚏 Connecting as user at bus stop:", userData);
      socket.emit("user-connect", userData);
    });

    socket.on("user-connected", (response) => {
      console.log("✅ Received response after user-connect:", response);
    });

        socket.on("shuttle-locations", (shuttles) => {
      console.log("\nReceived shuttle locations:");
      shuttles.forEach((shuttle: any) => {
        console.log(`- Shuttle ${shuttle.shuttleId} (${shuttle.name}):`);
        console.log(`  Location: ${JSON.stringify(shuttle.location)}`);
        console.log(`  Route: ${shuttle.route}`);
      });
    });

      // Listen for shuttle status updates
      socket.on("shuttle-status-update", (shuttles) => {
        console.log("\nReceived shuttle status update:");
        shuttles.forEach((shuttle: any) => {
          console.log(`- Shuttle ${shuttle.shuttleId} (${shuttle.name})`);
          console.log(`  Status: ${shuttle.location ? "Moving" : "Stationary"}`);
        });
      });


    // Listen for shuttle location updates
    socket.on("shuttle-locations", (shuttles) => {
      console.log("\n📍 Received shuttle locations:");
      shuttles.forEach((shuttle: { shuttleId: any; name: any; location: any; route: any; }) => {
        console.log(`- Shuttle ${shuttle.shuttleId} (${shuttle.name}):`);
        console.log(`  Location: ${JSON.stringify(shuttle.location)}`);
        console.log(`  Route: ${shuttle.route}`);
      });
    });

    // Optional: disconnect and error handlers
    socket.on('disconnect', () => console.log('❌ Disconnected from server'));
    socket.on('error', (error) => console.error('⚠️ Socket error:', error.message));

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.disconnect();
    };
  }, []);

  
  // const WS_URL = 'ws://localhost:3000'
  // const { driverLocations, shareLocation, isConnected, error } = useDriverWebSocket(WS_URL);
  const { closest, setClosest, closestBuses, setClosestBuses} = useClosestBus();

  const DEFAULT_LONGITUDE = -1.573568;
  const DEFAULT_LATITUDE = 6.678045;
  const DEFAULT_ZOOM = 14.95;
  const TRANSITION_DURATION = 500;

  const [viewState, setViewState] = useState<ExtendedViewState>({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: DEFAULT_ZOOM,
  });
  
  const [transitionOptions, setTransitionOptions] = useState({
    transitionDuration: TRANSITION_DURATION
  });

  

  const [route, setRoute] = useState<Route | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const geolocateControlRef = useRef<any>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filterDrivers, setFilterDrivers] = useState<Driver[]>([]);
  const [selectedBus, setSelectedBus] = useState<Driver[]>([]);
  const [storedDropPoints, setStoredDropPoints] = useState<DropPoint[]>([]);
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null);
  const [arriveInTwo, setArriveInTwo] = useState(false)
  const [arrived, setArrived] = useState(false)


 
  const [closestDropPoint, setClosestDropPoint] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const BASE_CUSTOMER_URL = "https://shuttle-backend-0.onrender.com/api/v1"



  
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/drivers/drivers`);

        if (!response.ok) {
          throw new Error("Failed to fetch drivers");
        }
        
        const data = await response.json();
        setDrivers(data.drivers || [])
        
      } catch (err) {
        console.error("Error fetching drivers:", err);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    setStoredDropPoints(dropPoints);
    if (dropPoints.length > 0) {
      setStartPoint({
        latitude: dropPoints[0].latitude,
        longitude: dropPoints[0].longitude,
        speed: 0,
        timestamp: Date.now(),
      });
    } else {
      setStartPoint(null);
    }
    // console.log('yes', dropOffLocation);
  }, [dropPoints]);

  useEffect(() => {
    // Example: update driver coords from websocket data
    // Suppose useShuttleSocket returns an array of live locations: [{ busID, latitude, longitude, speed, timestamp }]
    // You may need to adjust this logic based on your actual websocket hook implementation

    // Example: get live locations from context or hook
    // const { liveLocations } = useShuttleSocket(); // Uncomment and adjust if your hook provides this

    // For demonstration, assume liveLocations is available
    // if (!liveLocations || liveLocations.length === 0) return;

    // setDrivers(prevDrivers =>
    //   prevDrivers.map(driver => {
    //     const live = liveLocations.find(l => l.busID === driver.busID);
    //     if (live) {
    //       return {
    //         ...driver,
    //         coords: {
    //           latitude: live.latitude,
    //           longitude: live.longitude,
    //           speed: live.speed ?? driver.coords.speed,
    //           timestamp: live.timestamp ?? driver.coords.timestamp,
    //         },
    //       };
    //     }
    //     return driver;
    //   })
    // );

    // If your useShuttleSocket hook provides live locations, use the above logic.
    // Otherwise, replace with your actual websocket data update logic.
  }, [/* liveLocations */]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => console.error('Error getting location', err),
      { enableHighAccuracy: true },
    );
  }, []);


  useEffect(()=> {
    console.log(arriveInTwo)
    console.log(arrived)
    console.log(userCoords)
    // console.log(closest)
  })


  

  useEffect(() => {
    // console.log(drivers)
    
    if (drivers.length > 0) {
      const active = drivers.filter((bus) => bus.active === true);
      // const driverStopsNames = drivers.busRoute[0]?.stops.map((stops) => stops.name)
      setFilterDrivers(active); 
    } else {
      setFilterDrivers([]); 
    }
  }, [drivers]);
  
const getClosestBuses = (
  startPoint: { name: string; coordinates: Coordinates }, // Assuming startPoint has a name and coordinates
  end: Coordinates,
  drivers: Driver[],
  limit: number = 3,
): { driver: Driver; distance: number; isStartInRoute: boolean }[] => {
  if (!startPoint || !end) return [];

  return drivers
    .map(driver => {
      const isStartInRoute = driver.busRoute?.some(route => 
        route.stops?.some(stop => stop === startPoint.name)
      ) ?? false;

      return {
        driver: {
          ...driver,
          coords: {
            ...driver.coords,
            speed: driver.coords.speed !== undefined ? driver.coords.speed : 0,
            timestamp: driver.coords.timestamp !== undefined ? driver.coords.timestamp : Date.now(),
          },
        },
        distance: haversineDistance(startPoint.coordinates, {
          latitude: driver.coords.latitude,
          longitude: driver.coords.longitude,
        }, 'km'),
        isStartInRoute,
      };
    })
    .filter(item => item.distance !== null && !isNaN(item.distance))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

  const { setClosestStopName, setClosestStop } = useClosestStop();

  useEffect(() => {
    if (startPoint && filterDrivers.length > 0 ) {
      // Use startPoint for both start and end if you don't have a separate end point, or replace with the correct end point variable
      const newClosestBuses = getClosestBuses(
        {
          name: storedDropPoints[0]?.name || 'Unknown',
          coordinates: startPoint
        },
        startPoint,
        filterDrivers
      );
     const validDrivers = newClosestBuses.filter(item => 
        item.driver?.coords?.timestamp !== undefined
      );
      setClosestBuses(
        validDrivers.map(item => ({
          ...item,
          driver: {
            ...item.driver,
            coords: {
              ...item.driver.coords,
              timestamp: item.driver.coords.timestamp ?? Date.now(),
            },
          },
        }))
      );

         
       if (newClosestBuses.length > 0 && newClosestBuses[0].driver.coords.latitude === startPoint.latitude && newClosestBuses[0].driver.coords.longitude === startPoint.longitude) {
        // console.log(arrived)
        setArrived(true)

      }

      else if (newClosestBuses.length > 0 && newClosestBuses[0].distance <= 0.1) {
        //  console.log(arriveInTwo)
         setArriveInTwo(true)
        // alert (`A bus is now within 500 meters of your location!`)
      } 

      else {
        console.log(false)
      }
    } 
    
    else {
      setClosestBuses([]);
    }
  }, [startPoint, filterDrivers, setClosestBuses]);

  
  useEffect(() => {
    if (closestBuses.length > 0) {
      // console.log('All close buses:', closestBuses);
      setClosest(closestBuses[0]);
    } else if (startPoint && filterDrivers.length > 0) {
      // console.log('No closest bus found');
      setClosest(null);
    }
  }, [closestBuses, startPoint, filterDrivers, setClosest]);

  const [isManuallyAdjusted, setIsManuallyAdjusted] = useState(false);

  useEffect(() => {
    if (isManuallyAdjusted) return; // Don’t override manual adjustments
  
    if (closest?.driver?.coords) {
      setViewState({
        longitude: closest.driver.coords.longitude,
        latitude: closest.driver.coords.latitude,
        zoom: DEFAULT_ZOOM,
      });
      setTransitionOptions({ transitionDuration: TRANSITION_DURATION });
      // console.log('Updating map view to follow closest bus:', closest.driver);
      return;
    }
  

    const centerLocation = isHomepage ? selectedLocation : pickUpLocation;
    if (centerLocation) {
      setViewState({
        longitude: centerLocation.longitude,
        latitude: centerLocation.latitude,
        zoom: DEFAULT_ZOOM,
      });
      setTransitionOptions({ transitionDuration: TRANSITION_DURATION });
      return;
    }
  
    // Priority 3: Default to DEFAULT_LONGITUDE and DEFAULT_LATITUDE
    setViewState({
      longitude: DEFAULT_LONGITUDE,
      latitude: DEFAULT_LATITUDE,
      zoom: DEFAULT_ZOOM,
    });
    setTransitionOptions({ transitionDuration: TRANSITION_DURATION });
  }, [closest, selectedLocation, pickUpLocation, isHomepage, isManuallyAdjusted]);

  const handleViewStateChange = (evt: { viewState: MapViewState }) => {
    const { longitude, latitude, zoom } = evt.viewState;
    setViewState(prevState => ({
      ...prevState,
      longitude,
      latitude,
      zoom: zoom || prevState.zoom,
    }));
    setIsManuallyAdjusted(true);
  };
  



  useEffect(() => {
    if (storedDropPoints.length === 0 || filterDrivers.length === 0) {
      setSelectedBus([]);
      return;
    }
  
    const matchingDrivers: Driver[] = filterDrivers.filter((driver) => {
      
      const allStopNames = driver.busRoute
        .flatMap(route => route.stops); 
  
      return storedDropPoints.some((point) => 
        allStopNames.includes(point.name)
      );
    });
  
    setSelectedBus(matchingDrivers);

  }, [storedDropPoints, filterDrivers]);
  
  useEffect(() => {
    if (!closest || storedDropPoints.length === 0) {
      setClosestDropPoint(null);
      return;
    }

    const busCoords = closest.driver.coords;

    const filtered = storedDropPoints.filter(
      (point) =>
        // (point.latitude !== startPoint?.latitude ||
        // point.longitude !== startPoint?.longitude) &&

        point.name !== 'Paa Joe Round About'

    );


    if (filtered.length === 0) {
      setClosestDropPoint(null);
      return;
    }

    const dropPointsWithDistances = filtered.map((point) => ({
      point,
      distance: haversineDistance(busCoords, point, 'km'),
    }));

    const sorted = dropPointsWithDistances
      .filter((item) => item.distance !== null && !isNaN(item.distance))
      .sort((a, b) => a.distance - b.distance);

    if (sorted.length > 0) {
      const nearest = sorted[0].point;
      setClosestDropPoint(nearest);
      // console.log('✅ Closest drop point set:', nearest.name);
      // setClosestBusID(nearest.busID);
  
    } 
  }, [closest, storedDropPoints, startPoint]);
  
  

useEffect(() => {
  if (closestDropPoint && setClosestStopName) {
    setClosestStopName(closestDropPoint.name);
    
    const busStop: BusStop = {
      latitude: closestDropPoint.latitude,
      longitude: closestDropPoint.longitude,
      name: closestDropPoint.name
    };
    
    setClosestStop(busStop);
  }
}, [closestDropPoint]);

  
useEffect(() => {
  if (!isHomepage && selectedLocation && pickUpLocation && dropOffLocation) {
    const allWaypoints = [
      { ...selectedLocation, speed: selectedLocation.speed ?? 0, timestamp: selectedLocation.timestamp ?? Date.now() },
      ...dropPoints.map((point) => ({
        longitude: point.longitude,
        latitude: point.latitude,
        speed: 0,
        timestamp: Date.now(),
      })),
      { ...pickUpLocation, speed: pickUpLocation.speed ?? 0, timestamp: pickUpLocation.timestamp ?? Date.now() },
      { ...dropOffLocation, speed: dropOffLocation.speed ?? 0, timestamp: dropOffLocation.timestamp ?? Date.now() },
    ];

    const optimalWaypoints = solveTSP(allWaypoints);
    // Ensure all waypoints have speed and timestamp
    const completeWaypoints = optimalWaypoints.map((point) => ({
      ...point,
      speed: point.speed ?? 0,
      timestamp: point.timestamp ?? Date.now(),
    }));
    fetchRouteWithWaypoints(completeWaypoints, setRoute);
  }
}, [selectedLocation, dropOffLocation, isHomepage, pickUpLocation, dropPoints]);

  const fetchRouteWithWaypoints = async (
    waypoints: Coordinates[],
    setRouteFunction: React.Dispatch<React.SetStateAction<Route | null>>
  ) => {
    // Construct the URL with all waypoints
    const coordinates = waypoints
      .map((point) => `${point.longitude},${point.latitude}`)
      .join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        setRouteFunction({
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          start: waypoints[0],
          end: waypoints[waypoints.length - 1],
          stops: ['SRC Busstop', 'Main Library', 'KSB']
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Reusable Marker Icon Component
  const MarkerIcon = ({ color }: { color: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="48"
      viewBox="0 0 30 48"
      fill="none"
    >
      <g clipPath="url(#clip0_706_132)">
        <path d="M21 42C21 38.6863 18.3137 36 15 36C11.6863 36 9 38.6863 9 42C9 45.3137 11.6863 48 15 48C18.3137 48 21 45.3137 21 42Z" fill="white" />
        <path d="M19 42C19 39.7909 17.2091 38 15 38C12.7909 38 11 39.7909 11 42C11 44.2091 12.7909 46 15 46C17.2091 46 19 44.2091 19 42Z" fill="white" />
        <path d="M19 42C19 39.7909 17.2091 38 15 38C12.7909 38 11 39.7909 11 42C11 44.2091 12.7909 46 15 46C17.2091 46 19 44.2091 19 42Z" stroke={color} strokeWidth="2" />
        <path d="M16 28C16 27.4477 15.5523 27 15 27C14.4477 27 14 27.4477 14 28V42C14 42.5523 14.4477 43 15 43C15.5523 43 16 42.5523 16 42V28Z" fill="black" />
        <path d="M30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30C23.2843 30 30 23.2843 30 15Z" fill={color} />
        <path d="M21 15C21 11.6863 18.3137 9 15 9C11.6863 9 9 11.6863 9 15C9 18.3137 11.6863 21 15 21C18.3137 21 21 18.3137 21 15Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_706_132">
          <rect width="30" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
  
  
  const LocationIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
    >
      <g filter="url(#filter0_d_723_117)">
        <path
          d="M18.3223 53.6777C28.0854 63.4408 43.9146 63.4408 53.6777 53.6777C63.4408 43.9146 63.4408 28.0854 53.6777 18.3223C43.9146 8.55921 28.0854 8.55921 18.3223 18.3223C8.55922 28.0854 8.55922 43.9146 18.3223 53.6777Z"
          fill="white"
          fillOpacity="0.6"
          shapeRendering="crispEdges"
        />
      </g>
      <path
        d="M22.8723 39.4662C21.0235 38.9073 20.7436 36.3888 22.4413 35.588L43.5073 25.6507C45.2671 24.8206 47.1794 26.733 46.3493 28.4927L36.412 49.5587C35.6112 51.2564 33.0927 50.9765 32.5338 49.1276L30.802 43.3989C30.4846 42.3488 29.6513 41.5154 28.6012 41.198L22.8723 39.4662Z"
        fill="black"
      />
      <defs>
        <filter
          id="filter0_d_723_117"
          x="6"
          y="7"
          width="60"
          height="60"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_723_117"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_723_117"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );

   const BusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80" fill="none">
    <g clip-path="url(#clip0_756_599)">
      <path d="M16.0436 30.617C16.1914 30.6061 16.3391 30.5953 16.4913 30.5842C20.2896 37.0297 24.088 43.4753 28.0014 50.1162C31.8702 47.8825 35.739 45.6488 39.7251 43.3475C39.7017 42.8465 39.5733 42.621 39.333 42.1877C39.2524 42.0414 39.1719 41.8951 39.0889 41.7444C39.0009 41.5867 38.913 41.4289 38.8225 41.2664C38.7332 41.1043 38.6439 40.9422 38.5518 40.7751C38.2658 40.2558 37.9786 39.7371 37.6912 39.2186C37.3131 38.5365 36.9362 37.8538 36.5599 37.1708C36.472 37.013 36.3841 36.8553 36.2935 36.6927C36.213 36.5464 36.1324 36.4002 36.0494 36.2495C35.978 36.1207 35.9066 35.9919 35.833 35.8592C35.6778 35.5292 35.6778 35.5292 35.6573 35.0897C35.7728 35.023 35.8883 34.9563 36.0073 34.8876C41.8116 44.9411 47.616 54.9945 53.5963 65.3526C53.3975 65.5418 53.1988 65.7311 52.9941 65.926C52.8651 65.7026 52.7361 65.4792 52.6032 65.249C49.0231 67.316 45.443 69.3829 41.7544 71.5125C40.8193 69.8928 39.8841 68.2731 38.9207 66.6043C38.401 66.9043 37.8813 67.2044 37.3458 67.5135C34.5848 62.7933 31.8247 58.0725 29.0658 53.351C27.7848 51.1589 26.5036 48.967 25.2215 46.7755C24.1044 44.8659 22.9879 42.956 21.8721 41.0456C21.281 40.0336 20.6896 39.0218 20.0975 38.0104C19.5406 37.0593 18.9846 36.1077 18.4292 35.1557C18.2248 34.8056 18.02 34.4558 17.815 34.1061C17.5359 33.6301 17.2579 33.1534 16.9802 32.6766C16.8981 32.5371 16.8161 32.3977 16.7315 32.2541C16.4107 31.7011 16.1668 31.2514 16.0436 30.617Z" fill="#34A853"/>
      <path d="M9.22941 18.9935C6.45385 16.6337 15.9026 11.2913 19.8887 8.98993C19.8654 8.48894 20.7456 9.74419 20.5053 9.31094C20.4247 9.16466 20.8534 9.44848 19.2525 7.38688C20.8353 9.42521 21.1471 9.58962 19.2803 7.2723C19.1824 7.15094 19.0843 7.0296 18.9861 6.90883C19.0896 7.03615 19.1876 7.15728 19.2803 7.2723C19.8095 7.92886 20.3278 8.58605 20.7737 9.15599C20.7686 9.14684 20.778 9.15915 20.7996 9.1892C21.0802 9.54791 21.3312 9.87094 21.537 10.136C21.4392 9.97541 21.3444 9.82039 21.2581 9.68012C21.2368 9.65096 21.2151 9.62122 21.193 9.59088C21.1557 9.53966 21.1171 9.48674 21.0772 9.43208C20.7911 8.91278 21.1692 9.61214 20.8818 9.09358C20.8125 8.96867 20.9009 9.10431 21.0665 9.37031C20.6106 8.56964 20.7024 8.65432 20.8248 8.78798C20.9741 8.95105 21.169 9.18703 20.4704 7.97705L22.1711 10.9226C22.4704 11.4093 22.6011 11.6398 22.6172 11.6954L33.7599 30.9951L33.1577 31.5684L32.7668 30.8914L21.9181 37.155L19.0843 32.2467L17.5095 33.1559C14.7484 28.4357 11.6976 24.0997 9.22941 18.9935Z" fill="#34A853"/>
      <path d="M19.2803 7.2723C19.1876 7.15728 19.0896 7.03615 18.9861 6.90883C19.0843 7.0296 19.1824 7.15094 19.2803 7.2723Z" fill="#34A853"/>
      <path d="M27.931 48.8318C27.8103 48.6222 27.8103 48.6222 27.6872 48.4084C27.5947 48.2488 27.5022 48.0892 27.407 47.9247C27.3056 47.7477 27.2043 47.5707 27.0998 47.3884C26.9931 47.2035 26.8863 47.0186 26.7762 46.8281C26.4216 46.2135 26.0682 45.5982 25.7148 44.9829C25.4699 44.558 25.2249 44.1331 24.9798 43.7082C24.3997 42.702 23.8204 41.6954 23.2414 40.6886C22.4023 39.2294 21.5616 37.7712 20.7211 36.3128C19.5434 34.2692 18.3675 32.2246 17.1912 30.1802C20.829 28.0799 24.4668 25.9796 28.2149 23.8156C31.8588 30.127 35.5026 36.4383 39.2569 42.9409C37.4725 43.9758 35.6881 45.0107 33.8496 46.0769C33.2857 46.4046 32.7218 46.7322 32.1408 47.0697C31.6965 47.3269 31.2523 47.5839 30.8079 47.8409C30.692 47.9085 30.576 47.976 30.4565 48.0456C30.1165 48.2436 29.7757 48.4404 29.435 48.6372C29.2429 48.7486 29.0507 48.86 28.8528 48.9748C28.2397 49.2914 28.2397 49.2914 27.931 48.8318Z" fill="#34A853"/>
      <path d="M3.79725 12.6385C4.08461 12.4629 4.37663 12.2948 4.67215 12.1334C5.14652 12.252 5.32199 12.7045 5.58682 13.0862C5.75713 13.3304 5.75713 13.3304 5.93089 13.5796C6.01794 13.7059 6.10501 13.8322 6.19471 13.9623C6.32202 13.8562 6.44934 13.7501 6.58052 13.6408C6.74937 13.5015 6.91822 13.3621 7.09219 13.2185C7.25878 13.0804 7.42538 12.9423 7.59702 12.8001C8.04244 12.4553 8.47896 12.1735 8.97393 11.9064C8.93493 11.7055 8.89594 11.5046 8.85576 11.2976C9.67415 10.5733 10.5793 9.99889 11.5577 9.51198C11.6477 9.53449 11.7377 9.557 11.8304 9.5802C12.4591 9.25483 12.4591 9.25483 13.0553 8.87303C13.0808 8.78384 13.1063 8.69465 13.1325 8.60276C14.1322 7.92714 15.0954 7.37852 16.3026 7.22383C16.3671 7.33554 16.4316 7.44724 16.4981 7.56233C16.6709 7.45325 16.8437 7.34418 17.0217 7.23179C17.7551 6.83787 18.3401 6.66411 19.1432 6.48649C19.0397 6.17388 18.9362 5.86128 18.8296 5.53921C18.9451 5.47253 19.0606 5.40586 19.1796 5.33716C19.0812 5.17518 18.9829 5.0132 18.8816 4.84631C18.5933 4.32166 18.5933 4.32166 18.6705 4.05139C19.0164 3.84247 19.3664 3.64004 19.7204 3.44524C20.1357 4.22103 20.5495 4.9976 20.963 5.77431C21.0801 5.99297 21.1972 6.21162 21.3178 6.4369C21.4314 6.65059 21.545 6.86426 21.662 7.08442C21.7661 7.27957 21.8703 7.47472 21.9775 7.67579C22.2815 8.28527 22.2815 8.28527 22.5245 8.91016C22.9723 9.98965 23.5739 10.983 24.1591 11.9918C24.2899 12.2187 24.4205 12.4456 24.5511 12.6725C24.8342 13.1641 25.1179 13.6554 25.402 14.1464C25.8642 14.9455 26.3253 15.7452 26.7862 16.545C27.3688 17.5557 27.9517 18.5662 28.535 19.5764C29.6805 21.5606 30.8238 23.546 31.9664 25.5318C32.1464 25.8446 32.3264 26.1574 32.5064 26.4702C32.7791 26.9442 33.0519 27.4182 33.3246 27.8922C34.3519 29.6776 35.3794 31.4628 36.4072 33.2479C36.5011 33.411 36.595 33.5742 36.6918 33.7422C38.2156 36.3886 39.742 39.0336 41.2692 41.6781C42.8373 44.3936 44.4021 47.1111 45.9639 49.8302C46.9274 51.5074 47.8935 53.1829 48.8631 54.8565C49.5268 56.0025 50.1872 57.1504 50.8452 58.2998C51.2251 58.9632 51.6064 59.6256 51.9915 60.286C52.3439 60.8903 52.6922 61.4968 53.0374 62.1053C53.2227 62.4295 53.4123 62.7512 53.6021 63.0728C54.4875 64.6487 54.4875 64.6487 54.2854 65.4658C53.8922 66.2092 53.4919 66.4574 52.7587 66.8814C52.5697 66.993 52.5697 66.993 52.3768 67.1068C51.9612 67.3505 51.5425 67.5879 51.1232 67.8252C50.8324 67.9933 50.5417 68.1616 50.2512 68.3303C49.6425 68.6823 49.0322 69.0314 48.4206 69.3783C47.6376 69.8227 46.8587 70.2737 46.0809 70.727C45.4814 71.0755 44.8801 71.4206 44.2782 71.7648C43.9903 71.9298 43.7029 72.0959 43.4161 72.2629C43.0145 72.496 42.6107 72.7245 42.2059 72.952C41.9768 73.0829 41.7476 73.2138 41.5115 73.3487C40.6938 73.6742 40.4209 73.7181 39.5979 73.4347C39.0463 72.7949 38.6525 72.0686 38.2385 71.3358C38.1066 71.1096 37.9743 70.8836 37.8417 70.6579C37.478 70.0363 37.1198 69.4116 36.7624 68.7863C36.3762 68.1128 35.9849 67.4422 35.5943 66.7712C34.9178 65.6078 34.2446 64.4427 33.5735 63.2763C32.6025 61.5887 31.6266 59.9041 30.6494 58.2202C29.0632 55.4867 27.4809 52.751 25.901 50.0139C24.3676 47.3574 22.8329 44.7016 21.2961 42.0471C21.1542 41.8019 21.1542 41.8019 21.0094 41.5518C19.9764 39.7676 18.9431 37.9836 17.9097 36.1997C17.6356 35.7266 17.3615 35.2534 17.0874 34.7802C16.9067 34.4683 16.726 34.1563 16.5453 33.8444C15.3953 31.8593 14.2466 29.8733 13.0995 27.8865C12.5207 26.884 11.9412 25.8818 11.3616 24.8798C10.9033 24.0872 10.4457 23.2943 9.98862 22.501C9.71109 22.0198 9.43285 21.5389 9.1544 21.0582C8.96672 20.7337 8.77992 20.4087 8.59315 20.0837C8.48118 19.8908 8.36922 19.6978 8.25385 19.499C8.15782 19.3326 8.06179 19.1663 7.96285 18.9949C7.64561 18.4991 7.28541 18.0631 6.90372 17.615C6.75806 17.37 6.61896 17.1209 6.48715 16.8682C5.9693 15.9377 5.32956 15.1184 4.66293 14.2901C4.24271 13.7591 3.9078 13.3181 3.79725 12.6385ZM17.4406 33.4207C20.3365 38.3913 23.2368 43.3594 26.1387 48.3264C27.3653 50.4259 28.5915 52.5256 29.8177 54.6253C32.3267 58.9216 34.8361 63.2177 37.3459 67.5136C37.8656 67.2136 38.3852 66.9135 38.9207 66.6044C39.8558 68.2241 40.791 69.8438 41.7545 71.5126C45.3346 69.4457 48.9146 67.3787 52.6032 65.2491C52.7645 65.5284 52.9257 65.8076 53.0918 66.0953C53.3483 65.8728 53.6047 65.6503 53.869 65.421C43.3889 47.2689 32.9088 29.1168 22.1111 10.4147C21.9956 10.4813 21.8801 10.548 21.7611 10.6167C21.6844 10.5219 21.6078 10.4272 21.5288 10.3295C21.2221 10.0098 21.2221 10.0098 20.8167 9.98958C18.5265 10.1959 16.6719 11.215 14.7057 12.363C14.5821 12.4346 14.4585 12.5062 14.3312 12.58C10.9447 14.4282 10.9447 14.4282 8.59672 17.3145C8.54793 18.08 8.78022 18.54 9.15741 19.1888C9.3305 19.4895 9.3305 19.4895 9.50708 19.7962C9.70089 20.1266 9.70089 20.1266 9.89862 20.4637C10.0367 20.702 10.1747 20.9404 10.3125 21.1788C10.6951 21.8397 11.0799 22.4993 11.4651 23.1586C11.8837 23.8759 12.3002 24.5943 12.7171 25.3126C13.6578 26.9325 14.6013 28.5508 15.5452 30.1688C16.1774 31.2525 16.8091 32.3366 17.4406 33.4207Z" fill="#C4C4C3"/>
      <path d="M29.3921 45.2512C26.7479 40.6713 24.1037 36.0914 21.3793 31.3727C23.2849 30.2725 25.1904 29.1724 27.1537 28.0389C29.7979 32.6188 32.4421 37.1987 35.1664 41.9174C33.2609 43.0176 31.3554 44.1177 29.3921 45.2512Z" fill="#34A853"/>
      <path d="M6.82238 15.5041C6.7535 15.3864 6.68461 15.2686 6.61364 15.1473C6.10771 14.2669 6.10771 14.2669 6.19475 13.9624C6.48936 13.7019 6.79148 13.4496 7.09706 13.2017C7.26296 13.066 7.42886 12.9304 7.59978 12.7907C8.04457 12.453 8.4836 12.1723 8.97398 11.9065C8.93498 11.7056 8.89599 11.5047 8.85581 11.2977C9.6742 10.5734 10.5793 9.99897 11.5578 9.51206C11.6478 9.53457 11.7378 9.55709 11.8305 9.58028C12.4592 9.25491 12.4592 9.25491 13.0553 8.87311C13.0936 8.73933 13.0936 8.73933 13.1326 8.60284C14.1322 7.92722 15.0955 7.3786 16.3027 7.22392C16.3672 7.33562 16.4317 7.44733 16.4981 7.56242C16.6709 7.45334 16.8437 7.34426 17.0218 7.23187C17.7552 6.83795 18.3402 6.66419 19.1433 6.48657C19.072 6.22982 19.0008 5.97307 18.9274 5.70855C19.0429 5.64187 19.1584 5.57519 19.2773 5.5065C19.8457 6.0991 20.2567 6.73195 20.6699 7.43869C20.8524 7.74613 20.8524 7.74613 21.0386 8.05978C21.3089 8.62122 21.3089 8.62122 21.2521 9.33102C21.08 9.36114 20.908 9.39126 20.7307 9.42229C16.3319 10.4941 10.9859 13.6565 7.95365 17.0089C7.38881 16.6468 7.14563 16.0715 6.82238 15.5041Z" fill="#282828"/>
      <path d="M28.0015 50.1162C26.4703 47.4734 24.94 44.83 23.4109 42.1859C22.7009 40.9583 21.9907 39.7309 21.2796 38.5039C20.6601 37.4349 20.0411 36.3655 19.423 35.2957C19.0954 34.7289 18.7676 34.1623 18.439 33.5961C18.0729 32.9649 17.7079 32.3332 17.3432 31.7013C17.2333 31.5123 17.1233 31.3234 17.0101 31.1287C16.9115 30.9574 16.813 30.7862 16.7114 30.6097C16.5816 30.3854 16.5816 30.3854 16.4492 30.1566C16.2755 29.8062 16.2755 29.8062 16.3528 29.5359C16.7086 29.3092 17.072 29.0942 17.4378 28.8839C17.5521 28.8178 17.6665 28.7518 17.7843 28.6837C18.1641 28.4646 18.5445 28.2467 18.9249 28.0289C19.1877 27.8776 19.4504 27.7262 19.7131 27.5748C20.4059 27.1756 21.0993 26.7775 21.7928 26.3797C22.4998 25.9737 23.2063 25.5669 23.9128 25.1601C25.3002 24.3615 26.6881 23.5641 28.0765 22.7672C29.6205 25.4321 31.1635 28.0976 32.7053 30.7637C33.4212 32.0016 34.1374 33.2392 34.8544 34.4764C35.4791 35.5544 36.1031 36.6327 36.7265 37.7115C37.0568 38.283 37.3873 38.8543 37.7186 39.4253C38.0878 40.0617 38.4558 40.6987 38.8236 41.3359C38.9344 41.5264 39.0452 41.7169 39.1594 41.9132C39.3085 42.1723 39.3085 42.1723 39.4606 42.4365C39.5479 42.5873 39.6351 42.7381 39.725 42.8934C39.9002 43.2465 39.9002 43.2465 39.8229 43.5168C39.4802 43.7371 39.1299 43.9458 38.7772 44.1497C38.5509 44.2811 38.3247 44.4124 38.0915 44.5478C37.8421 44.6914 37.5926 44.8349 37.3431 44.9785C37.0893 45.1252 36.8354 45.2719 36.5817 45.4188C36.0489 45.7267 35.5157 46.034 34.9823 46.3409C34.2978 46.7349 33.6142 47.1303 32.9308 47.5262C32.4065 47.8297 31.8818 48.1324 31.3569 48.4348C31.1047 48.5803 30.8525 48.7261 30.6006 48.8721C30.2485 49.0759 29.8957 49.2786 29.5429 49.4812C29.3421 49.5969 29.1412 49.7127 28.9343 49.832C28.4492 50.0834 28.4492 50.0834 28.0015 50.1162ZM28.4083 49.2043C28.7557 49.025 29.0969 48.8333 29.4352 48.6371C29.6554 48.5099 29.8756 48.3828 30.1025 48.2517C30.3377 48.1148 30.5729 47.9778 30.8081 47.8409C31.0211 47.7177 31.2341 47.5945 31.4535 47.4675C32.2528 47.0049 33.0512 46.5408 33.8497 46.0768C35.6342 45.042 37.4186 44.0071 39.2571 42.9408C35.6132 36.6295 31.9694 30.3181 28.2151 23.8155C24.5773 25.9159 20.9394 28.0162 17.1914 30.1801C19.1291 33.548 19.1291 33.548 21.0684 36.915C21.8591 38.2871 22.6497 39.6593 23.4391 41.0321C24.0752 42.1383 24.7122 43.2439 25.3498 44.3493C25.5935 44.7721 25.8369 45.1951 26.0799 45.6183C26.4192 46.2088 26.7595 46.7986 27.1 47.3883C27.2014 47.5653 27.3027 47.7423 27.4071 47.9247C27.4996 48.0843 27.5921 48.2438 27.6873 48.4083C27.7678 48.548 27.8482 48.6877 27.9311 48.8317C28.101 49.1593 28.101 49.1593 28.4083 49.2043Z" fill="#34A853" fill-opacity="0.6"/>
      <path d="M38.9691 72.6063C38.9035 72.4869 38.838 72.3676 38.7705 72.2446C38.6968 72.1187 38.6231 71.9927 38.5472 71.863C38.3011 71.4401 38.0615 71.0139 37.8217 70.5875C37.6466 70.2838 37.4712 69.9803 37.2955 69.677C36.8192 68.8526 36.3483 68.0252 35.8784 67.1971C35.3864 66.3325 34.8896 65.4706 34.3932 64.6085C33.4539 62.9753 32.5191 61.3396 31.5859 59.703C30.5233 57.8399 29.4557 55.9797 28.3877 54.1197C26.1907 50.2933 24.0001 46.4634 21.8135 42.6312C21.9867 42.5311 22.1599 42.4311 22.3384 42.3281C22.4277 42.4839 22.517 42.6397 22.609 42.8002C24.7806 46.5882 26.955 50.3745 29.1327 54.1589C30.1858 55.9891 31.2378 57.8198 32.2875 59.6519C33.2023 61.2484 34.119 62.8439 35.0378 64.4381C35.5244 65.2825 36.0101 66.1275 36.4936 66.9737C36.9485 67.7698 37.4058 68.5644 37.865 69.3581C38.0333 69.6499 38.2007 69.9422 38.3671 70.2351C38.5942 70.6344 38.8244 71.0318 39.0555 71.4287C39.1837 71.6518 39.3118 71.8749 39.4438 72.1047C39.8525 72.6545 40.0732 72.842 40.7455 72.9978C40.951 72.9536 41.1565 72.9095 41.3682 72.864C41.2069 72.5847 41.0457 72.3054 40.8796 72.0177C40.6164 72.0952 40.3531 72.1727 40.0819 72.2526C40.5439 71.9859 41.0058 71.7192 41.4818 71.4444C40.6434 69.9922 39.805 68.54 38.9412 67.0439C38.4792 67.3106 38.0173 67.5773 37.5413 67.8521C37.5091 67.7962 37.4768 67.7404 37.4436 67.6828C37.9633 67.3828 38.483 67.0827 39.0184 66.7736C39.9213 68.3375 40.8242 69.9013 41.7545 71.5126C45.2768 69.479 48.7992 67.4453 52.4283 65.3501C52.654 65.741 52.8797 66.132 53.1123 66.5348C51.5394 67.4638 49.9645 68.3892 48.3868 69.3099C47.6542 69.7375 46.9225 70.1664 46.1923 70.5982C45.4875 71.0149 44.7808 71.4283 44.0726 71.8395C43.803 71.9968 43.5341 72.1554 43.2659 72.3151C42.8896 72.5389 42.5111 72.7583 42.1318 72.9769C41.917 73.1029 41.7022 73.2289 41.4809 73.3588C40.3434 73.8154 39.588 73.6397 38.9691 72.6063Z" fill="#BABABA"/>
      <path d="M38.8949 71.5575C38.7889 71.3758 38.7889 71.3758 38.6807 71.1905C38.4445 70.7844 38.2122 70.3762 37.9797 69.968C37.8112 69.6764 37.6425 69.385 37.4735 69.0937C37.0154 68.3022 36.5605 67.5089 36.1062 66.7151C35.6309 65.8858 35.1528 65.0582 34.675 64.2303C33.8734 62.8403 33.0737 61.4491 32.2753 60.0572C31.2492 58.2682 30.2198 56.4811 29.1893 54.6945C28.3049 53.161 27.4219 51.6265 26.5392 50.092C26.2546 49.5975 25.9698 49.1031 25.6851 48.6087C25.2386 47.8334 24.7931 47.0577 24.3483 46.2815C24.1845 45.9959 24.0204 45.7105 23.8559 45.4252C23.6325 45.0375 23.4101 44.6492 23.188 44.2607C23.0631 44.043 22.9381 43.8253 22.8093 43.601C22.5543 43.1063 22.5543 43.1063 22.6316 42.836C22.4465 42.4653 22.2488 42.101 22.0464 41.7395C21.9833 41.6263 21.9202 41.513 21.8552 41.3963C21.6456 41.0203 21.4347 40.6451 21.2238 40.2699C21.0786 40.01 20.9334 39.7501 20.7884 39.4902C20.4056 38.8048 20.0218 38.1201 19.6377 37.4355C19.2463 36.7372 18.8559 36.0385 18.4654 35.3398C17.6985 33.968 16.9305 32.5968 16.1618 31.226C16.2196 31.1926 16.2773 31.1593 16.3368 31.1249C23.2698 43.1332 30.2028 55.1415 37.3459 67.5137C37.8656 67.2137 38.3852 66.9136 38.9207 66.6045C38.9274 66.7495 38.9342 66.8946 38.9411 67.044C39.1177 67.3842 39.3056 67.7186 39.4989 68.0495C39.6707 68.3452 39.6707 68.3452 39.846 68.6469C39.9671 68.8531 40.0881 69.0593 40.2127 69.2717C40.3338 69.4796 40.4549 69.6875 40.5797 69.9017C40.8796 70.4165 41.1803 70.9307 41.4818 71.4445C41.283 71.6337 41.0843 71.8229 40.8796 72.0179C41.0408 72.2971 41.202 72.5764 41.3681 72.8641C40.8885 73.0618 40.633 73.1144 40.1316 72.9909C39.4782 72.6267 39.2642 72.1989 38.8949 71.5575Z" fill="#CFCFCF"/>
      <path d="M53.0918 66.0955C53.0817 65.8779 53.0817 65.8779 53.0713 65.6559C53.2446 65.5559 53.4178 65.4559 53.5963 65.3529C47.7919 55.2994 41.9875 45.2459 36.0073 34.8878C35.8918 34.9545 35.7763 35.0212 35.6573 35.0899C37.0507 37.6366 38.444 40.1833 39.8796 42.8072C39.8219 42.8405 39.7641 42.8738 39.7046 42.9082C35.8995 36.3176 32.0944 29.727 28.1741 22.9367C28.444 23.0042 28.714 23.0717 28.9921 23.1413C25.4994 16.8917 25.4994 16.8917 21.9361 10.5158C21.9938 10.4825 22.0516 10.4491 22.1111 10.4148C32.5912 28.5669 43.0713 46.7189 53.869 65.4211C53.6125 65.6436 53.356 65.8662 53.0918 66.0955Z" fill="#34A853"/>
      <path d="M41.7385 73.1016C41.5128 72.7106 41.2871 72.3196 41.0545 71.9168C44.8078 69.7498 48.5611 67.5828 52.4282 65.3502C52.6539 65.7412 52.8797 66.1321 53.1122 66.535C49.3589 68.7019 45.6056 70.8689 41.7385 73.1016Z" fill="#4B4B4B"/>
      <path d="M6.85161 15.5576C6.76338 15.4037 6.67516 15.2499 6.58426 15.0914C6.45056 14.8614 6.45056 14.8614 6.31417 14.6267C6.11755 14.2325 6.11755 14.2325 6.19481 13.9622C6.48941 13.7017 6.79153 13.4494 7.09712 13.2015C7.26302 13.0659 7.42892 12.9302 7.59984 12.7905C8.04462 12.4528 8.48366 12.1721 8.97404 11.9063C8.93504 11.7054 8.89604 11.5045 8.85587 11.2975C9.9242 10.352 11.0216 9.55117 12.4532 9.44628C12.8079 10.0607 13.1626 10.675 13.5281 11.308C13.154 11.5611 13.154 11.5611 12.7724 11.8192C11.0182 13.0165 9.3309 14.213 7.76945 15.6509C7.63678 15.7639 7.5041 15.8768 7.36741 15.9932C7.09471 15.925 7.09471 15.925 6.85161 15.5576Z" fill="#3E3E3E"/>
      <path d="M29.3921 45.2512C26.7479 40.6713 24.1037 36.0914 21.3793 31.3727C23.2849 30.2725 25.1904 29.1724 27.1537 28.0389C29.7979 32.6188 32.4421 37.1987 35.1664 41.9174C33.2609 43.0176 31.3554 44.1177 29.3921 45.2512ZM29.5466 44.7107C31.2212 43.7439 32.8957 42.7771 34.621 41.781C32.1058 37.4245 29.5906 33.068 26.9991 28.5794C25.3246 29.5462 23.65 30.5131 21.9247 31.5092C24.4399 35.8657 26.9552 40.2222 29.5466 44.7107Z" fill="#D4D4D4"/>
      <path d="M3.79722 12.6386C4.08459 12.463 4.37661 12.2949 4.67212 12.1335C5.16405 12.2565 5.33483 12.7814 5.58687 13.1859C5.71292 13.3873 5.83897 13.5887 5.96884 13.7962C6.10074 14.0087 6.23263 14.2213 6.36853 14.4403C6.50148 14.6531 6.63443 14.866 6.77141 15.0853C7.10106 15.6132 7.42994 16.1416 7.75815 16.6704C8.28199 16.368 8.70132 16.0122 9.15876 15.621C11.3157 13.801 13.7475 12.4695 16.214 11.1114C16.2462 11.1673 16.2785 11.2231 16.3117 11.2807C16.1784 11.3633 16.045 11.446 15.9077 11.5311C15.298 11.9095 14.6888 12.2887 14.0797 12.668C13.87 12.798 13.6602 12.928 13.4441 13.0619C10.6006 14.8205 10.6006 14.8205 8.69441 17.4839C8.80175 18.0368 8.93898 18.3858 9.19198 18.8776C9.26747 19.0253 9.34296 19.173 9.42073 19.3252C9.49995 19.4783 9.57917 19.6313 9.66078 19.7891C9.74046 19.9445 9.82013 20.1 9.90222 20.2601C10.0989 20.6436 10.2962 21.0267 10.4942 21.4094C10.3787 21.4761 10.2632 21.5428 10.1443 21.6115C11.8856 24.6275 13.6269 27.6435 15.421 30.751C15.3632 30.7843 15.3055 30.8177 15.246 30.852C15.1766 30.7361 15.1073 30.6201 15.0359 30.5007C14.3748 29.3957 13.7131 28.2911 13.0507 27.1869C12.7104 26.6195 12.3703 26.0519 12.0308 25.4841C9.67435 21.4097 9.67435 21.4097 6.9037 17.6151C6.75804 17.3701 6.61894 17.121 6.48713 16.8683C5.96928 15.9378 5.32954 15.1185 4.66291 14.2902C4.24269 13.7592 3.90778 13.3182 3.79722 12.6386Z" fill="#BAB0A5"/>
      <path d="M27.2232 39.4789C27.1336 39.2588 27.1336 39.2588 27.0421 39.0342C26.9501 38.8146 26.9501 38.8146 26.8562 38.5906C26.7288 38.2137 26.7288 38.2137 26.8061 37.9434C27.2865 37.6434 27.7678 37.3569 28.2593 37.0762C28.4638 36.9568 28.4638 36.9568 28.6724 36.8351C29.2564 36.4992 29.7425 36.2342 30.4034 36.0922C30.5676 36.3546 30.7291 36.6187 30.8894 36.8835C30.9796 37.0304 31.0698 37.1773 31.1628 37.3286C31.3914 37.8075 31.4044 38.1379 31.4215 38.6637C31.5437 38.7421 31.6659 38.8205 31.7919 38.9012C30.8102 39.468 29.8286 40.0347 28.8172 40.6186C28.5405 40.4061 28.2638 40.1935 27.9787 39.9744C27.4333 39.838 27.4333 39.838 27.2232 39.4789Z" fill="#E5E7E6"/>
      <path d="M12.6281 9.3454C13.1887 8.38306 14.0721 7.96886 15.0574 7.49153C15.8003 7.28825 15.8003 7.28825 16.3027 7.22388C16.3672 7.33559 16.4317 7.44729 16.4981 7.56238C16.7573 7.39876 16.7573 7.39876 17.0218 7.23184C17.7552 6.83792 18.3402 6.66416 19.1433 6.48654C19.072 6.22979 19.0008 5.97304 18.9274 5.70851C19.0429 5.64183 19.1584 5.57516 19.2774 5.50646C19.9011 6.14135 20.2947 6.83359 20.7227 7.60569C20.5393 7.48814 20.5393 7.48814 20.3522 7.36821C20.1558 7.4863 19.9593 7.60439 19.7569 7.72606C19.1274 8.07539 19.1274 8.07539 18.8547 8.00716C16.9587 8.53325 15.2226 9.51856 13.4871 10.4291C13.019 10.0224 13.019 10.0224 12.6281 9.3454Z" fill="#595959"/>
      <path d="M7.09473 15.9251C9.13524 14.1622 11.1164 12.5426 13.5281 11.3081C13.1734 10.6938 12.8187 10.0794 12.4532 9.44638C12.5109 9.41304 12.5687 9.37971 12.6282 9.34536C13.1441 10.239 13.6601 11.1326 14.1916 12.0534C13.8423 12.315 13.4929 12.5766 13.1329 12.8462C12.7909 13.1032 12.4491 13.3604 12.1073 13.6177C11.8716 13.7948 11.6357 13.9717 11.3995 14.1483C9.60098 15.4912 9.60098 15.4912 7.95372 17.0088C7.4976 16.7164 7.34804 16.3928 7.09473 15.9251Z" fill="#212121"/>
      <path d="M24.286 33.9823C24.1825 33.6697 24.079 33.3571 23.9724 33.035C24.1711 32.8458 24.3699 32.6566 24.5746 32.4617C24.4456 32.2383 24.3166 32.0149 24.1837 31.7847C24.4147 31.6513 24.6457 31.518 24.8837 31.3806C25.1197 32.0064 25.3437 32.6262 25.5109 33.2751C25.5974 33.1833 25.6839 33.0914 25.7731 32.9968C26.1131 32.7018 26.1131 32.7018 26.7357 32.568C26.5745 32.2887 26.4133 32.0094 26.2472 31.7217C26.1317 31.7884 26.0162 31.8551 25.8972 31.9238C25.6782 31.6778 25.4592 31.4319 25.2336 31.1785C25.5223 31.0118 25.8111 30.8451 26.1085 30.6734C26.2375 30.8968 26.3665 31.1202 26.4994 31.3504C26.7626 31.2729 27.0258 31.1954 27.297 31.1156C27.516 31.3615 27.735 31.6074 27.9606 31.8608C27.8765 31.9652 27.7924 32.0696 27.7058 32.1771C27.3769 32.6515 27.3769 32.6515 27.497 33.4824C26.8618 33.8492 26.2267 34.2159 25.5722 34.5937C25.3533 34.3478 25.1343 34.1019 24.9087 33.8485C24.7032 33.8926 24.4977 33.9368 24.286 33.9823Z" fill="#CCCCCC"/>
      <path d="M40.1591 71.9824C39.353 70.586 38.5468 69.1897 37.7162 67.7511C38.1204 67.5177 38.5246 67.2844 38.9411 67.0439C39.7795 68.4961 40.6179 69.9483 41.4817 71.4444C41.0452 71.622 40.6088 71.7995 40.1591 71.9824Z" fill="#D7D7D7"/>
      <path d="M6.5083 14.9097C6.35307 14.4408 6.35307 14.4408 6.1947 13.9624C6.49319 13.7137 6.79252 13.4659 7.09218 13.2186C7.25877 13.0805 7.42537 12.9424 7.59701 12.8002C8.04243 12.4554 8.47896 12.1736 8.97392 11.9065C8.93493 11.7056 8.89593 11.5047 8.85575 11.2977C9.66664 10.58 10.5687 9.9605 11.5577 9.51205C11.7954 9.52374 12.0332 9.53543 12.2781 9.54748C12.4071 9.77089 12.5361 9.9943 12.669 10.2245C12.5278 10.3185 12.3866 10.4125 12.2411 10.5093C11.7181 10.8581 11.1954 11.2075 10.673 11.5573C10.4468 11.7086 10.2203 11.8597 9.99375 12.0105C9.66825 12.2272 9.34341 12.4449 9.01858 12.6626C8.82283 12.7933 8.62708 12.9241 8.4254 13.0588C7.95684 13.3579 7.95684 13.3579 7.71271 13.763C7.53746 13.8595 7.36222 13.956 7.18166 14.0555C6.60864 14.3228 6.60864 14.3228 6.5083 14.9097Z" fill="#717171"/>
      <path d="M3.79728 12.6386C4.08464 12.4631 4.37666 12.2949 4.67218 12.1335C4.94488 12.2017 4.94488 12.2017 5.25391 12.6911C5.37939 12.9106 5.50487 13.13 5.63415 13.3561C5.73442 13.5307 5.73442 13.5307 5.83673 13.7087C6.05082 14.0818 6.26368 14.4556 6.47653 14.8294C6.62114 15.0819 6.76584 15.3343 6.91062 15.5868C7.26603 16.2068 7.62034 16.8275 7.97409 17.4485C7.68538 17.6152 7.39666 17.7819 7.09919 17.9536C7.03674 17.8361 6.9743 17.7185 6.90996 17.5974C6.25149 16.4045 5.50808 15.3317 4.65323 14.2733C4.23498 13.7473 3.90807 13.3125 3.79728 12.6386Z" fill="#C0C0C0"/>
      <path d="M13.2949 10.5258C13.1583 10.2766 13.1583 10.2766 13.0188 10.0223C13.1733 10.1565 13.3278 10.2908 13.4869 10.429C13.6897 10.3067 13.8925 10.1844 14.1014 10.0584C15.617 9.15633 17.0645 8.35872 18.7568 7.83782C18.9235 7.77911 19.0902 7.72039 19.2619 7.65989C19.7294 7.50195 19.7294 7.50195 20.3521 7.36813C20.6739 7.64775 20.6739 7.64775 20.9179 7.9441C20.0797 8.31085 19.2426 8.64758 18.3821 8.95681C17.1862 9.40358 16.0682 9.97453 14.94 10.5699C13.7117 11.2137 13.7117 11.2137 13.2949 10.5258Z" fill="#444444"/>
      <path d="M38.9241 71.5778C38.8284 71.4095 38.8284 71.4095 38.7308 71.2379C38.5286 70.8809 38.3302 70.522 38.1318 70.1629C37.995 69.9198 37.8579 69.6769 37.7206 69.4341C37.3854 68.8401 37.0535 68.2443 36.7233 67.6475C37.4484 67.3033 38.1736 66.9591 38.9208 66.6044C38.953 66.6603 38.9852 66.7161 39.0185 66.7737C38.3739 67.2575 38.3739 67.2575 37.7163 67.7511C38.5225 69.1475 39.3287 70.5438 40.1593 71.9824C40.307 71.9716 40.4547 71.9607 40.6069 71.9496C40.8796 72.0178 40.8796 72.0178 41.141 72.4452C41.2535 72.6525 41.2535 72.6525 41.3682 72.8641C40.8871 73.0624 40.6326 73.1143 40.1298 72.9895C39.4853 72.6306 39.2801 72.2136 38.9241 71.5778Z" fill="#C5C5C5"/>
      <path d="M13.0963 9.75208C12.9996 9.58452 12.9028 9.41696 12.8032 9.24433C13.2931 8.29035 14.1038 7.95458 15.0575 7.49148C15.8004 7.2882 15.8004 7.2882 16.3028 7.22383C16.3673 7.33554 16.4318 7.44724 16.4982 7.56233C16.7574 7.39871 16.7574 7.39871 17.0219 7.23179C17.7552 6.83787 18.3403 6.66411 19.1434 6.48649C19.0721 6.22974 19.0009 5.97299 18.9275 5.70846C19.043 5.64178 19.1584 5.57511 19.2774 5.50641C19.7994 6.21041 19.7994 6.21041 20.3319 6.92864C20.0941 6.91695 19.8564 6.90526 19.6115 6.89321C19.232 7.02224 18.8569 7.16523 18.4858 7.31748C17.4133 7.75666 17.4133 7.75667 16.8106 7.82094C15.9756 7.98759 15.3296 8.41504 14.6042 8.85327C14.4588 8.93925 14.3135 9.02523 14.1637 9.11381C13.807 9.32504 13.4515 9.53835 13.0963 9.75208Z" fill="#848484"/>
      <path d="M18.9274 5.70844C19.0107 5.58591 19.0939 5.46339 19.1797 5.33714C19.0814 5.17516 18.983 5.01318 18.8817 4.84629C18.5934 4.32164 18.5934 4.32164 18.6707 4.05137C19.0166 3.84245 19.3665 3.64002 19.7205 3.44522C20.1421 4.23151 20.5619 5.01869 20.9815 5.80603C21.101 6.02894 21.2205 6.25185 21.3437 6.48151C21.4582 6.69683 21.5727 6.91214 21.6908 7.13398C21.7964 7.33179 21.9021 7.5296 22.0109 7.73341C22.2531 8.2272 22.4379 8.70551 22.5952 9.23252C22.2998 9.25417 22.0043 9.27582 21.6999 9.29812C21.7831 9.17559 21.8663 9.05306 21.9521 8.92682C21.1849 7.73141 20.4178 6.53599 19.6274 5.30434C19.5441 5.42687 19.4609 5.5494 19.3751 5.67564C19.2274 5.68647 19.0797 5.69729 18.9274 5.70844Z" fill="#CECCCB"/>
      <path d="M6.70386 15.248C6.54862 14.7791 6.54862 14.7791 6.39025 14.3008C6.58715 14.1917 6.78405 14.0827 6.98692 13.9704C7.61152 13.6552 7.61152 13.6552 7.86736 13.2223C8.308 12.9142 8.75005 12.6171 9.20129 12.3252C9.33033 12.2411 9.45936 12.1571 9.5923 12.0704C10.5981 11.4196 11.6203 10.8039 12.6691 10.2244C12.5978 9.96761 12.5266 9.71086 12.4532 9.44633C12.6144 9.72559 12.7757 10.0049 12.9418 10.2926C12.5979 10.8563 12.2855 11.1829 11.7218 11.5338C11.5829 11.6217 11.444 11.7096 11.3009 11.8001C11.1563 11.8896 11.0117 11.979 10.8628 12.0712C9.89671 12.6754 8.969 13.2837 8.08324 14.0003C8.11549 14.0562 8.14774 14.112 8.18096 14.1696C7.69352 14.5255 7.20607 14.8814 6.70386 15.248Z" fill="#5C5C5C"/>
      <path d="M29.6353 23.447C29.5386 23.2795 29.4418 23.1119 29.3421 22.9393C29.4576 22.8726 29.5731 22.8059 29.6921 22.7372C29.1762 21.8436 28.6602 20.95 28.1286 20.0292C28.1864 19.9959 28.2441 19.9626 28.3036 19.9282C30.2333 22.7109 31.8391 25.6787 33.4738 28.6388C33.8498 29.319 34.2272 29.9985 34.6044 30.6781C35.3392 32.0023 36.0726 33.3274 36.805 34.653C36.6895 34.7197 36.574 34.7863 36.455 34.855C36.3736 34.7131 36.2922 34.5712 36.2083 34.425C35.4425 33.0905 34.6759 31.7565 33.9083 30.423C33.5136 29.7374 33.1193 29.0515 32.7258 28.3653C32.3462 27.7036 31.9659 27.0423 31.5849 26.3814C31.4394 26.1287 31.2942 25.8757 31.1493 25.6226C30.947 25.2692 30.7436 24.9165 30.5399 24.564C30.3664 24.262 30.3664 24.262 30.1893 23.954C29.9688 23.4979 29.9688 23.4979 29.6353 23.447Z" fill="#A8A8A8"/>
      <path d="M27.4332 39.838C27.2498 39.4855 27.2498 39.4855 27.0591 39.0385C26.9634 38.818 26.9634 38.818 26.8657 38.593C26.7288 38.2137 26.7288 38.2137 26.806 37.9435C27.2595 37.6498 27.7335 37.3984 28.2059 37.1353C28.4895 37.3629 28.4895 37.3629 28.7717 37.7112C28.8066 38.1742 28.8066 38.1742 28.7605 38.6768C28.7467 38.8442 28.733 39.0115 28.7188 39.1839C28.7055 39.3115 28.6922 39.439 28.6785 39.5704C27.74 39.9148 27.74 39.9148 27.4332 39.838Z" fill="#CBCCCC"/>
      <path d="M29.8581 39.2138C29.7456 39.0064 29.7456 39.0064 29.6309 38.7949C29.8041 38.6949 29.9773 38.5949 30.1558 38.4918C30.0523 38.1792 29.9488 37.8666 29.8422 37.5445C30.1092 37.2493 30.1092 37.2493 30.4444 36.9712C30.6244 37.0162 30.8044 37.0612 30.9898 37.1076C31.1563 37.5475 31.1563 37.5475 31.3034 38.0549C31.4324 38.2783 31.5614 38.5017 31.6943 38.7319C31.7265 38.7878 31.7588 38.8436 31.792 38.9012C30.725 39.5392 30.725 39.5392 30.3921 39.7094C30.1194 39.6411 30.1194 39.6411 29.8581 39.2138Z" fill="#C8C9C9"/>
      <path d="M23.5768 12.9534C23.3197 12.5189 23.0638 12.0837 22.8086 11.648C22.7358 11.5254 22.6631 11.4028 22.5881 11.2764C22.2408 10.6813 21.962 10.1374 21.7975 9.46738C22.0607 9.38988 22.3239 9.31238 22.5951 9.23254C23.1501 10.3271 23.705 11.4216 24.2768 12.5493C24.0458 12.6827 23.8148 12.816 23.5768 12.9534Z" fill="#B8A898"/>
      <path d="M12.8031 9.24435C12.8998 9.41191 12.9966 9.57947 13.0962 9.7521C13.3041 9.61055 13.512 9.46899 13.7262 9.32315C14.0025 9.13822 14.2789 8.9534 14.5553 8.76867C14.6919 8.67526 14.8285 8.58185 14.9692 8.48561C15.7346 7.9774 16.2883 7.67126 17.2185 7.59778C17.6627 7.42734 18.1045 7.24973 18.5411 7.05986C18.5733 7.11571 18.6056 7.17156 18.6388 7.22911C16.9065 8.22925 15.1742 9.2294 13.3894 10.2599C12.928 9.96408 12.9202 9.76104 12.8031 9.24435ZM18.7365 7.39836C18.7042 7.34251 18.672 7.28665 18.6388 7.22911C19.043 6.99574 19.4472 6.76237 19.8636 6.52194C19.9604 6.68949 20.0571 6.85705 20.1568 7.02969C19.2401 7.36146 19.2401 7.36146 18.7365 7.39836Z" fill="#6C6C6C"/>
      <path d="M21.8135 42.6313C21.9867 42.5313 22.1599 42.4313 22.3384 42.3282C24.3054 45.7352 26.2725 49.1422 28.2991 52.6525C28.1836 52.7192 28.0681 52.7858 27.9491 52.8545C27.1924 51.5966 26.4357 50.3386 25.679 49.0806C25.3277 48.4965 24.9763 47.9124 24.6249 47.3283C24.221 46.6568 23.8171 45.9854 23.4133 45.3139C23.287 45.104 23.1607 44.8941 23.0306 44.6779C22.8552 44.3862 22.8552 44.3862 22.6762 44.0886C22.5731 43.9171 22.4699 43.7456 22.3637 43.569C22.1777 43.2579 21.9946 42.9451 21.8135 42.6313Z" fill="#ABABAB"/>
      <path d="M15.2461 30.8518C13.3758 27.6124 11.5055 24.3729 9.57853 21.0353C9.75176 20.9353 9.92499 20.8353 10.1035 20.7322C10.2325 20.9556 10.3614 21.179 10.4943 21.4092C10.3788 21.4759 10.2634 21.5426 10.1444 21.6113C11.8857 24.6273 13.627 27.6433 15.4211 30.7508C15.3633 30.7841 15.3056 30.8175 15.2461 30.8518Z" fill="#B5B5B5"/>
      <path d="M24.6973 35.0989C24.1813 34.2052 23.6654 33.3116 23.1338 32.3909C23.679 32.0016 24.2242 31.6124 24.7859 31.2114C24.7994 31.5015 24.8129 31.7916 24.8268 32.0904C24.73 31.9229 24.6333 31.7553 24.5336 31.5827C24.4182 31.6494 24.3027 31.716 24.1837 31.7847C24.3127 32.0081 24.4417 32.2315 24.5745 32.4617C24.4081 32.7068 24.2416 32.9518 24.0701 33.2043C24.3731 33.9045 24.3731 33.9045 24.8944 34.026C25.0213 34.0458 25.1482 34.0656 25.279 34.086C25.318 34.2869 25.357 34.4878 25.3972 34.6948C25.1662 34.8281 24.9352 34.9615 24.6973 35.0989Z" fill="#DDDEDE"/>
      <path d="M27.497 33.4826C27.4278 32.8092 27.4549 32.6059 27.7856 31.962C27.5666 31.7161 27.3477 31.4701 27.122 31.2168C26.9166 31.2609 26.7111 31.3051 26.4994 31.3506C26.3959 31.038 26.2924 30.7254 26.1858 30.4033C26.5068 30.2925 26.8277 30.1816 27.1584 30.0674C27.6421 30.9052 28.1258 31.743 28.6242 32.6062C28.3999 32.8846 28.1757 33.163 27.9447 33.4498C27.797 33.4606 27.6492 33.4715 27.497 33.4826Z" fill="#E0E0E0"/>
      <path d="M25.2336 31.1786C25.5223 31.0119 25.811 30.8452 26.1085 30.6735C26.2375 30.8969 26.3665 31.1203 26.4994 31.3505C26.7626 31.273 27.0258 31.1955 27.297 31.1156C27.516 31.3616 27.735 31.6075 27.9606 31.8609C27.2393 32.5311 27.2393 32.5311 26.7357 32.568C26.5745 32.2888 26.4132 32.0095 26.2471 31.7218C26.1316 31.7885 26.0161 31.8551 25.8972 31.9238C25.5267 31.6864 25.5267 31.6864 25.2336 31.1786Z" fill="#9E9E9E"/>
      <path d="M47.9083 55.0968C48.0238 55.0301 48.1393 54.9635 48.2583 54.8948C46.9362 52.6048 45.6141 50.3148 44.2519 47.9555C44.3097 47.9222 44.3674 47.8888 44.4269 47.8545C46.0002 50.4462 47.5735 53.0379 49.1945 55.7082C49.0213 55.8082 48.8481 55.9082 48.6696 56.0113C48.2015 55.6046 48.2015 55.6046 47.9083 55.0968Z" fill="#B5B5B5"/>
      <path d="M40.1387 71.5427C39.4937 70.4257 38.8488 69.3086 38.1843 68.1577C38.3576 68.0577 38.5308 67.9577 38.7093 67.8546C39.3542 68.9717 39.9991 70.0887 40.6636 71.2397C40.4904 71.3397 40.3172 71.4397 40.1387 71.5427Z" fill="#34A853"/>
      <path d="M28.7309 36.832C29.2828 36.5878 29.8348 36.3436 30.4034 36.092C30.5969 36.4272 30.7904 36.7623 30.9897 37.1075C30.8437 37.1546 30.6977 37.2017 30.5472 37.2502C29.9722 37.4424 29.9722 37.4424 29.3172 37.8475C28.9468 37.61 28.9468 37.61 28.7309 36.832Z" fill="#DEDEDE"/>
      <path d="M9.08075 16.1325C9.074 15.9875 9.06725 15.8424 9.0603 15.693C11.0001 13.7043 13.8161 12.4544 16.214 11.1114C16.2463 11.1673 16.2785 11.2231 16.3117 11.2807C16.1117 11.4046 16.1117 11.4046 15.9077 11.5311C15.298 11.9095 14.6889 12.2888 14.0798 12.6681C13.87 12.798 13.6602 12.928 13.4441 13.0619C11.5437 14.2142 11.5437 14.2142 9.90225 15.6864C9.77889 15.8228 9.65553 15.9592 9.52843 16.0997C9.38069 16.1105 9.23296 16.1214 9.08075 16.1325Z" fill="#B0B0B0"/>
      <path d="M19.4931 6.28437C19.4151 5.88258 19.3371 5.48079 19.2568 5.06682C19.8022 5.20327 19.8022 5.20327 20.0525 5.54503C20.1356 5.69322 20.2187 5.84141 20.3043 5.99409C20.3951 6.15401 20.486 6.31392 20.5795 6.47869C20.6728 6.64707 20.7661 6.81544 20.8623 6.98892C20.9577 7.15783 21.0531 7.32673 21.1514 7.50076C21.3873 7.91882 21.6214 8.33774 21.8542 8.75752C21.681 8.85754 21.5078 8.95755 21.3293 9.0606C21.2196 8.8659 21.1099 8.67121 20.9969 8.47062C20.8528 8.21734 20.7087 7.96409 20.5646 7.71086C20.4923 7.58227 20.42 7.45368 20.3455 7.3212C20.1589 6.99447 19.963 6.67306 19.7658 6.35259C19.6758 6.33008 19.5858 6.30757 19.4931 6.28437Z" fill="#B8B8B8"/>
      <path d="M7.90817 14.1015C7.87592 14.0457 7.84368 13.9898 7.81045 13.9323C8.90234 13.0909 10.038 12.3479 11.2031 11.6112C11.3408 11.5233 11.4786 11.4353 11.6206 11.3446C11.7443 11.2664 11.8681 11.1881 11.9956 11.1074C12.3458 10.8617 12.6405 10.5946 12.9417 10.2928C12.9807 10.4937 13.0197 10.6945 13.0599 10.9015C12.5099 11.2957 11.9589 11.6885 11.4078 12.081C11.2536 12.1916 11.0993 12.3021 10.9405 12.4161C10.0445 13.053 9.15296 13.654 8.18087 14.1697C8.09088 14.1472 8.00089 14.1247 7.90817 14.1015Z" fill="#4D4D4D"/>
      <path d="M7.09912 17.9534C6.50856 16.7305 6.50856 16.7305 5.90607 15.4828C5.96381 15.4495 6.02155 15.4162 6.08105 15.3818C5.87744 14.8291 5.87744 14.8291 5.66973 14.2653C5.72747 14.232 5.78522 14.1986 5.84471 14.1643C6.54738 15.248 7.25005 16.3317 7.97402 17.4482C7.6853 17.6149 7.39659 17.7816 7.09912 17.9534Z" fill="#CCCAC9"/>
      <path d="M15.1688 31.1221C15.3998 30.9888 15.6307 30.8554 15.8687 30.718C15.8893 30.8177 15.9098 30.9173 15.931 31.0199C16.1458 31.6859 16.4815 32.2791 16.8155 32.89C16.8873 33.0226 16.959 33.1552 17.0329 33.2919C17.2614 33.714 17.491 34.1356 17.7206 34.5571C17.8761 34.8438 18.0314 35.1305 18.1867 35.4172C18.5669 36.1189 18.948 36.82 19.3297 37.5209C19.272 37.5542 19.2142 37.5875 19.1547 37.6219C18.6341 36.7779 18.1135 35.9338 17.5931 35.0897C17.416 34.8025 17.2389 34.5154 17.0618 34.2282C16.8072 33.8156 16.5528 33.4029 16.2984 32.9902C16.2191 32.8618 16.1398 32.7333 16.0582 32.601C15.7562 32.111 15.4566 31.6206 15.1688 31.1221Z" fill="#A2A2A2"/>
      <path d="M13.0961 9.75207C12.9994 9.58452 12.9026 9.41696 12.803 9.24432C13.7846 8.67758 14.7662 8.11083 15.7776 7.5269C15.8999 7.60527 16.0221 7.68364 16.148 7.76438C15.6327 8.33411 15.0446 8.65154 14.3818 9.02391C14.2585 9.09405 14.1352 9.1642 14.0082 9.23647C13.7046 9.40911 13.4004 9.58069 13.0961 9.75207Z" fill="#959595"/>
      <path d="M24.8471 32.53C24.9881 32.3741 25.1291 32.2182 25.2743 32.0576C25.2057 31.6425 25.2057 31.6425 25.0584 31.2796C25.3352 31.4922 25.6119 31.7048 25.897 31.9238C26.0125 31.8571 26.128 31.7905 26.2469 31.7218C26.4082 32.001 26.5694 32.2803 26.7355 32.568C26.3313 32.8014 25.9271 33.0348 25.5107 33.2752C25.2917 33.0293 25.0727 32.7833 24.8471 32.53Z" fill="#E6E6E6"/>
      <path d="M21.9883 42.5301C21.0532 40.9104 20.118 39.2906 19.1546 37.6218C19.2123 37.5885 19.27 37.5552 19.3295 37.5208C19.3905 37.6162 19.4514 37.7116 19.5141 37.8099C21.1045 40.3097 21.1045 40.3097 22.8064 42.7348C22.652 42.6005 22.4975 42.4663 22.3383 42.328C22.2228 42.3947 22.1073 42.4614 21.9883 42.5301Z" fill="#B8B8B8"/>
      <path d="M17.5569 11.013C17.4925 10.9013 17.428 10.7896 17.3615 10.6745C17.7665 10.4665 18.1726 10.2608 18.5793 10.0561C18.9183 9.88389 18.9183 9.88389 19.2643 9.70821C19.8361 9.46092 20.1962 9.35322 20.8043 9.36384C19.7853 10.2236 18.8299 10.6356 17.5569 11.013Z" fill="#B6B6B6"/>
      <path d="M8.19676 12.5809C8.16452 12.525 8.13227 12.4692 8.09905 12.4116C8.28343 12.2726 8.46782 12.1336 8.65779 11.9903C9.23049 11.6204 9.23049 11.6204 9.30345 11.2649C9.64977 11.0486 10.0025 10.8425 10.3582 10.6419C10.5523 10.5318 10.7465 10.4217 10.9466 10.3083C11.0973 10.224 11.248 10.1396 11.4032 10.0526C11.4355 10.1085 11.4677 10.1643 11.5009 10.2219C11.1545 10.4219 10.808 10.6219 10.451 10.828C10.5155 10.9397 10.58 11.0515 10.6465 11.1665C9.86593 11.8232 9.15574 12.2333 8.19676 12.5809Z" fill="#A0A0A0"/>
      <path d="M13.2507 9.21161C13.2117 9.01071 13.1727 8.80982 13.1325 8.60283C15.1125 7.37641 15.1125 7.37641 16.3026 7.22391C16.3671 7.33562 16.4316 7.44732 16.498 7.56241C16.2926 7.60658 16.0871 7.65074 15.8754 7.69624C15.4183 7.94424 14.9709 8.19726 14.5241 8.46229C14.3405 8.5698 14.3405 8.5698 14.1533 8.67948C13.852 8.85609 13.5513 9.03375 13.2507 9.21161Z" fill="#5E5E5E"/>
      <path d="M28.2515 40.0427C28.3857 39.7418 28.5199 39.4409 28.6582 39.1309C29.0429 39.1909 29.0429 39.1909 29.4763 39.3356C29.6053 39.559 29.7343 39.7824 29.8672 40.0126C29.5207 40.2126 29.1743 40.4126 28.8173 40.6187C28.6306 40.4286 28.4439 40.2386 28.2515 40.0427Z" fill="#CFD0D0"/>
      <path d="M8.97388 11.9065C8.93488 11.7056 8.89588 11.5047 8.85571 11.2977C9.68348 10.5651 10.5951 10.046 11.5577 9.51207C11.7122 9.64629 11.8666 9.78051 12.0258 9.9188C11.8413 10.0227 11.6568 10.1266 11.4667 10.2337C11.2245 10.3714 10.9823 10.5092 10.7402 10.647C10.6185 10.7153 10.4969 10.7836 10.3716 10.854C9.82003 11.169 9.40193 11.4333 8.97388 11.9065Z" fill="#5C5C5C"/>
      <path d="M24.2858 33.9824C24.1823 33.6698 24.0789 33.3572 23.9722 33.0351C24.2932 32.9242 24.6142 32.8134 24.9448 32.6992C25.0483 33.0118 25.1518 33.3244 25.2584 33.6465C24.9375 33.7573 24.6165 33.8682 24.2858 33.9824Z" fill="#7E8080"/>
      <path d="M3.79714 12.6385C3.91263 12.5718 4.02811 12.5052 4.1471 12.4365C4.66304 13.3301 5.17899 14.2237 5.71056 15.1445C4.77889 14.5472 3.97384 13.7788 3.79714 12.6385Z" fill="#B5B5B5"/>
      <path d="M29.6353 23.447C29.5385 23.2795 29.4418 23.1119 29.3421 22.9393C29.4576 22.8726 29.5731 22.8059 29.6921 22.7372C29.1761 21.8436 28.6602 20.9499 28.1286 20.0292C28.1863 19.9959 28.2441 19.9625 28.3036 19.9282C29.3092 21.47 29.3092 21.47 30.3352 23.0429C30.1042 23.1763 29.8732 23.3096 29.6353 23.447Z" fill="#959595"/>
      <path d="M13.6051 11.0379C13.5407 10.9261 13.4762 10.8144 13.4097 10.6994C15.1504 9.91179 15.1504 9.91179 16.0549 9.62351C16.0871 9.67936 16.1194 9.73521 16.1526 9.79276C15.7797 10.0141 15.4062 10.2342 15.0323 10.4537C14.8243 10.5764 14.6163 10.6991 14.4021 10.8255C13.8778 11.1061 13.8778 11.1061 13.6051 11.0379Z" fill="#3A3A3A"/>
      <path d="M10.6465 11.1665C10.582 11.0548 10.5175 10.9431 10.4511 10.828C11.054 10.4054 11.6569 9.98286 12.2781 9.54748C12.3749 9.71504 12.4716 9.8826 12.5713 10.0552C11.9361 10.422 11.3009 10.7887 10.6465 11.1665Z" fill="#7A7A7A"/>
      <path d="M30.3308 38.3908C30.2663 38.2791 30.2018 38.1674 30.1353 38.0523C30.3085 37.9523 30.4818 37.8523 30.6603 37.7492C30.5635 37.5817 30.4668 37.4141 30.3671 37.2415C30.5726 37.1973 30.7781 37.1532 30.9898 37.1077C31.0933 37.4203 31.1967 37.7329 31.3034 38.0549C30.9824 38.1658 30.6614 38.2766 30.3308 38.3908Z" fill="#6A6C6B"/>
      <path d="M31.2465 38.7648C31.2193 38.1788 31.192 37.5928 31.1647 37.0067C31.4549 37.5094 31.7451 38.0121 32.0442 38.53C31.5192 38.8331 31.5192 38.8331 31.2465 38.7648Z" fill="#E1E2E2"/>
      <path d="M28.9467 37.61C28.8399 37.2249 28.8399 37.2249 28.7308 36.832C28.9941 36.7545 29.2573 36.677 29.5285 36.5972C29.5997 36.8539 29.671 37.1107 29.7444 37.3752C29.4811 37.4527 29.2179 37.5302 28.9467 37.61Z" fill="#C5C5C5"/>
      <path d="M27.706 39.9062C27.6093 39.7386 27.5125 39.5711 27.4128 39.3984C27.7271 39.1426 28.0413 38.8867 28.365 38.623C28.4685 38.9356 28.572 39.2482 28.6786 39.5703C28.3576 39.6812 28.0367 39.792 27.706 39.9062Z" fill="#676969"/>
      <path d="M28.0195 40.8535C27.826 40.5183 27.6325 40.1832 27.4332 39.838C27.9053 39.8475 27.9053 39.8475 28.4262 39.9416C28.5552 40.165 28.6842 40.3884 28.8171 40.6186C28.5539 40.6961 28.2907 40.7736 28.0195 40.8535Z" fill="#E1E2E2"/>
      <path d="M23.5769 12.9534C23.4157 12.6741 23.2544 12.3948 23.0883 12.1071C23.3193 11.9738 23.5503 11.8404 23.7882 11.703C23.9495 11.9823 24.1107 12.2615 24.2768 12.5493C24.0459 12.6826 23.8149 12.816 23.5769 12.9534Z" fill="#5F5F5F"/>
      <path d="M9.40356 21.1365C9.24233 20.8572 9.0811 20.5779 8.91498 20.2902C9.14595 20.1569 9.37693 20.0235 9.6149 19.8861C9.77613 20.1654 9.93737 20.4447 10.1035 20.7324C9.87251 20.8657 9.64154 20.9991 9.40356 21.1365Z" fill="#5E5E5E"/>
      <path d="M39.8707 73.503C39.9794 73.2913 40.0881 73.0796 40.2002 72.8614C40.772 72.8416 40.772 72.8416 41.3682 72.864C41.4327 72.9757 41.4972 73.0875 41.5637 73.2025C40.4842 73.6565 40.4842 73.6565 39.8707 73.503Z" fill="#BEBEBE"/>
      <path d="M18.9274 5.70844C19.0107 5.58591 19.0939 5.46338 19.1797 5.33714C18.9862 5.00202 18.7927 4.66691 18.5934 4.32163C18.7344 4.16577 18.8753 4.0099 19.0206 3.84931C19.2827 4.70333 19.2827 4.70333 19.5501 5.57461C19.3446 5.61877 19.1391 5.66294 18.9274 5.70844Z" fill="#C9C9C9"/>
      <path d="M47.9083 55.0968C48.2038 55.0752 48.4993 55.0535 48.8037 55.0312C48.9327 55.2546 49.0617 55.478 49.1945 55.7082C49.0213 55.8082 48.8481 55.9082 48.6696 56.0113C48.2015 55.6046 48.2015 55.6046 47.9083 55.0968Z" fill="#7E7E7E"/>
      <path d="M40.2977 73.0306C40.2332 72.9189 40.1687 72.8072 40.1023 72.6921C40.391 72.5254 40.6797 72.3588 40.9772 72.187C41.1062 72.4104 41.2352 72.6338 41.3681 72.864C40.6045 73.1074 40.6045 73.1074 40.2977 73.0306Z" fill="#E4E4E4"/>
    </g>
    <defs>
      <clipPath id="clip0_756_599">
        <rect width="77.587" height="24.2459" fill="white" transform="translate(38.7935 79.3152) rotate(-120)"/>
      </clipPath>
    </defs>
  </svg>
  );

  const ClosestBusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80" fill="none">
    <path d="M49 38C49 28.0589 40.9411 20 31 20C21.0589 20 13 28.0589 13 38C13 47.9411 21.0589 56 31 56C40.9411 56 49 47.9411 49 38Z" fill="#699635" fill-opacity="0.8"/>
    <path d="M55 38C55 24.7452 44.2548 14 31 14C17.7452 14 7 24.7452 7 38C7 51.2548 17.7452 62 31 62C44.2548 62 55 51.2548 55 38Z" fill="#699635" fill-opacity="0.4"/>
    <path d="M60 38C60 21.4315 46.5685 8 30 8C13.4315 8 0 21.4315 0 38C0 54.5685 13.4315 68 30 68C46.5685 68 60 54.5685 60 38Z" fill="#699635" fill-opacity="0.1"/>
    <g mask="url(#mask0_949_377)">
      <path d="M16.0439 30.617C16.1917 30.6061 16.3394 30.5953 16.4916 30.5842C20.2899 37.0297 24.0883 43.4753 28.0017 50.1162C31.8705 47.8825 35.7393 45.6488 39.7254 43.3475C39.702 42.8465 39.5736 42.621 39.3333 42.1877C39.2527 42.0414 39.1722 41.8951 39.0892 41.7444C39.0013 41.5867 38.9133 41.4289 38.8228 41.2664C38.7335 41.1043 38.6442 40.9422 38.5521 40.7751C38.2661 40.2558 37.9789 39.7371 37.6915 39.2186C37.3134 38.5365 36.9365 37.8538 36.5602 37.1708C36.4723 37.013 36.3844 36.8553 36.2938 36.6927C36.2133 36.5464 36.1327 36.4002 36.0497 36.2495C35.9783 36.1207 35.9069 35.9919 35.8333 35.8592C35.6781 35.5292 35.6781 35.5292 35.6576 35.0897C35.7731 35.023 35.8886 34.9563 36.0076 34.8876C41.8119 44.9411 47.6163 54.9945 53.5966 65.3526C53.3978 65.5418 53.1991 65.7311 52.9944 65.926C52.8654 65.7026 52.7364 65.4792 52.6035 65.249C49.0234 67.316 45.4433 69.3829 41.7547 71.5125C40.8196 69.8928 39.8845 68.2731 38.921 66.6043C38.4013 66.9043 37.8816 67.2044 37.3461 67.5135C34.5851 62.7933 31.825 58.0725 29.0661 53.351C27.7851 51.1589 26.5039 48.967 25.2218 46.7755C24.1047 44.8659 22.9882 42.956 21.8724 41.0456C21.2813 40.0336 20.6899 39.0218 20.0978 38.0104C19.5409 37.0593 18.9849 36.1077 18.4295 35.1557C18.2251 34.8056 18.0203 34.4558 17.8153 34.1061C17.5362 33.6301 17.2582 33.1534 16.9805 32.6766C16.8984 32.5371 16.8164 32.3977 16.7318 32.2541C16.411 31.7011 16.1671 31.2514 16.0439 30.617Z" fill="#34A853"/>
      <path d="M9.22942 18.9936C6.45385 16.6338 15.9026 11.2914 19.8886 8.99004C19.8653 8.48905 20.7455 9.7443 20.5052 9.31105C20.4247 9.16477 20.8533 9.44859 19.2524 7.38699C20.8352 9.42532 21.147 9.58973 19.2802 7.27241C19.1824 7.15105 19.0842 7.02971 18.986 6.90894C19.0895 7.03626 19.1876 7.15739 19.2802 7.27241C19.8094 7.92897 20.3277 8.58616 20.7736 9.1561C20.7685 9.14695 20.778 9.15926 20.7996 9.18931C21.0801 9.54802 21.3311 9.87105 21.5369 10.1361C21.4392 9.97552 21.3443 9.8205 21.258 9.68023C21.2368 9.65107 21.2151 9.62133 21.193 9.59099C21.1556 9.53977 21.117 9.48685 21.0772 9.43219C20.7911 8.91289 21.1691 9.61225 20.8817 9.09369C20.8125 8.96878 20.9008 9.10442 21.0664 9.37042C20.6105 8.56975 20.7023 8.65443 20.8247 8.78809C20.9741 8.95116 21.169 9.18714 20.4704 7.97716L22.171 10.9227C22.4703 11.4094 22.601 11.6399 22.6172 11.6955L33.7598 30.9952L33.1576 31.5685L32.7668 30.8915L21.918 37.1551L19.0842 32.2468L17.5094 33.156C14.7483 28.4358 11.6976 24.0998 9.22942 18.9936Z" fill="#34A853"/>
      <path d="M19.28 7.27241C19.1874 7.15739 19.0893 7.03626 18.9858 6.90894C19.084 7.02971 19.1822 7.15105 19.28 7.27241Z" fill="#34A853"/>
      <path d="M27.9312 48.8319C27.8105 48.6223 27.8105 48.6223 27.6874 48.4085C27.5949 48.2489 27.5024 48.0893 27.4072 47.9248C27.3058 47.7478 27.2045 47.5708 27.1 47.3885C26.9933 47.2036 26.8865 47.0187 26.7764 46.8282C26.4218 46.2136 26.0684 45.5983 25.715 44.983C25.4701 44.5581 25.2251 44.1332 24.98 43.7083C24.3999 42.7021 23.8206 41.6955 23.2416 40.6887C22.4025 39.2295 21.5618 37.7713 20.7213 36.3129C19.5436 34.2693 18.3677 32.2247 17.1914 30.1803C20.8292 28.08 24.4671 25.9797 28.2151 23.8157C31.859 30.1271 35.5028 36.4384 39.2571 42.941C37.4727 43.9759 35.6883 45.0108 33.8498 46.077C33.2859 46.4047 32.722 46.7323 32.141 47.0698C31.6967 47.327 31.2525 47.584 30.8081 47.841C30.6922 47.9086 30.5762 47.9761 30.4567 48.0457C30.1167 48.2437 29.7759 48.4405 29.4352 48.6373C29.2431 48.7487 29.0509 48.8601 28.853 48.9749C28.2399 49.2915 28.2399 49.2915 27.9312 48.8319Z" fill="#34A853"/>
      <path d="M3.79785 12.6386C4.08521 12.463 4.37723 12.2949 4.67275 12.1335C5.14712 12.2521 5.3226 12.7046 5.58742 13.0863C5.75774 13.3305 5.75774 13.3305 5.93149 13.5797C6.01855 13.706 6.10561 13.8323 6.19531 13.9624C6.32263 13.8563 6.44995 13.7502 6.58112 13.6409C6.74997 13.5016 6.91882 13.3622 7.09279 13.2186C7.25939 13.0805 7.42598 12.9424 7.59763 12.8002C8.04304 12.4554 8.47957 12.1736 8.97454 11.9065C8.93554 11.7056 8.89654 11.5047 8.85637 11.2977C9.67476 10.5734 10.5799 9.99895 11.5584 9.51205C11.6484 9.53456 11.7383 9.55708 11.8311 9.58027C12.4598 9.25489 12.4598 9.25489 13.0559 8.8731C13.0814 8.78391 13.1069 8.69472 13.1332 8.60282C14.1328 7.92721 15.0961 7.37859 16.3033 7.2239C16.3678 7.33561 16.4323 7.44731 16.4987 7.5624C16.6715 7.45332 16.8443 7.34424 17.0224 7.23186C17.7558 6.83794 18.3408 6.66418 19.1439 6.48656C19.0404 6.17396 18.9369 5.86136 18.8303 5.53928C18.9458 5.47261 19.0612 5.40593 19.1802 5.33723C19.0819 5.17525 18.9836 5.01327 18.8822 4.84637C18.5939 4.32173 18.5939 4.32173 18.6712 4.05146C19.0171 3.84254 19.367 3.64011 19.7211 3.44531C20.1363 4.2211 20.5501 4.99767 20.9637 5.77438C21.0808 5.99304 21.1978 6.21169 21.3184 6.43698C21.432 6.65066 21.5456 6.86433 21.6627 7.08449C21.7668 7.27964 21.8709 7.47479 21.9782 7.67586C22.2822 8.28534 22.2822 8.28534 22.5251 8.91022C22.973 9.98972 23.5746 10.9831 24.1598 11.9919C24.2905 12.2188 24.4212 12.4457 24.5518 12.6726C24.8349 13.1642 25.1185 13.6555 25.4026 14.1465C25.8649 14.9456 26.326 15.7453 26.7869 16.5451C27.3695 17.5558 27.9523 18.5663 28.5356 19.5765C29.6811 21.5607 30.8245 23.5461 31.967 25.5319C32.147 25.8447 32.327 26.1575 32.507 26.4703C32.7798 26.9443 33.0525 27.4183 33.3252 27.8923C34.3525 29.6777 35.38 31.4629 36.4078 33.248C36.5018 33.4111 36.5957 33.5743 36.6924 33.7423C38.2162 36.3887 39.7426 39.0337 41.2698 41.6782C42.8379 44.3937 44.4027 47.1112 45.9646 49.8303C46.928 51.5075 47.8942 53.183 48.8637 54.8566C49.5274 56.0026 50.1879 57.1505 50.8458 58.2999C51.2257 58.9633 51.607 59.6257 51.9922 60.2861C52.3446 60.8904 52.6929 61.4969 53.0381 62.1054C53.2234 62.4296 53.413 62.7513 53.6027 63.0729C54.4882 64.6488 54.4882 64.6488 54.286 65.4659C53.8929 66.2093 53.4926 66.4575 52.7593 66.8815C52.5703 66.9931 52.5703 66.9931 52.3774 67.1069C51.9619 67.3506 51.5431 67.588 51.1238 67.8253C50.833 67.9934 50.5424 68.1617 50.2519 68.3304C49.6432 68.6824 49.0329 69.0315 48.4212 69.3784C47.6382 69.8228 46.8594 70.2738 46.0815 70.7271C45.4821 71.0756 44.8808 71.4207 44.2789 71.7649C43.9909 71.9299 43.7036 72.096 43.4167 72.263C43.0152 72.4961 42.6113 72.7246 42.2066 72.9521C41.9774 73.083 41.7482 73.2139 41.5121 73.3488C40.6944 73.6743 40.4216 73.7182 39.5985 73.4348C39.047 72.795 38.6531 72.0687 38.2391 71.3359C38.1073 71.1097 37.975 70.8837 37.8424 70.658C37.4786 70.0364 37.1205 69.4117 36.7631 68.7864C36.3768 68.1129 35.9856 67.4423 35.5949 66.7713C34.9185 65.6079 34.2453 64.4428 33.5741 63.2764C32.6032 61.5888 31.6272 59.9042 30.65 58.2203C29.0639 55.4868 27.4815 52.7511 25.9017 50.014C24.3683 47.3575 22.8336 44.7017 21.2968 42.0472C21.1548 41.802 21.1548 41.802 21.01 41.5519C19.9771 39.7677 18.9438 37.9837 17.9104 36.1998C17.6363 35.7267 17.3622 35.2535 17.088 34.7803C16.9073 34.4684 16.7267 34.1564 16.5459 33.8445C15.3959 31.8594 14.2473 29.8734 13.1002 27.8866C12.5213 26.8841 11.9419 25.8819 11.3623 24.8799C10.9039 24.0873 10.4463 23.2944 9.98922 22.5011C9.7117 22.0199 9.43346 21.539 9.155 21.0583C8.96733 20.7338 8.78053 20.4088 8.59376 20.0838C8.48179 19.8909 8.36982 19.6979 8.25446 19.4991C8.15843 19.3327 8.0624 19.1664 7.96346 18.995C7.64622 18.4992 7.28602 18.0632 6.90433 17.6151C6.75867 17.3701 6.61956 17.121 6.48776 16.8683C5.9699 15.9378 5.33016 15.1185 4.66353 14.2902C4.24331 13.7592 3.9084 13.3182 3.79785 12.6386ZM17.4412 33.4208C20.3371 38.3914 23.2374 43.3595 26.1394 48.3265C27.366 50.426 28.5922 52.5257 29.8184 54.6254C32.3273 58.9217 34.8368 63.2178 37.3465 67.5137C37.8662 67.2137 38.3859 66.9136 38.9213 66.6045C39.8565 68.2242 40.7916 69.8439 41.7551 71.5127C45.3352 69.4458 48.9153 67.3788 52.6039 65.2492C52.7651 65.5285 52.9263 65.8077 53.0924 66.0954C53.3489 65.8729 53.6054 65.6504 53.8696 65.4211C43.3895 47.269 32.9094 29.1169 22.1117 10.4148C21.9962 10.4814 21.8807 10.5481 21.7618 10.6168C21.6851 10.522 21.6084 10.4273 21.5294 10.3296C21.2227 10.0099 21.2227 10.0099 20.8173 9.98965C18.5271 10.196 16.6725 11.2151 14.7063 12.3631C14.5827 12.4347 14.4591 12.5063 14.3318 12.5801C10.9454 14.4283 10.9454 14.4283 8.59732 17.3146C8.54853 18.0801 8.78082 18.5401 9.15802 19.1889C9.3311 19.4896 9.3311 19.4896 9.50768 19.7963C9.7015 20.1267 9.7015 20.1267 9.89923 20.4638C10.0374 20.7021 10.1753 20.9405 10.3132 21.1789C10.6958 21.8398 11.0806 22.4993 11.4658 23.1587C11.8843 23.876 12.3009 24.5944 12.7177 25.3127C13.6584 26.9326 14.6019 28.5509 15.5459 30.1689C16.1781 31.2526 16.8097 32.3367 17.4412 33.4208Z" fill="#C4C4C3"/>
      <path d="M29.3922 45.2514C26.748 40.6715 24.1038 36.0916 21.3794 31.3729C23.285 30.2727 25.1905 29.1726 27.1538 28.0391C29.798 32.619 32.4422 37.1989 35.1665 41.9176C33.261 43.0178 31.3555 44.1179 29.3922 45.2514Z" fill="#34A853"/>
      <path d="M6.82255 15.5042C6.75367 15.3865 6.68478 15.2687 6.61381 15.1474C6.10788 14.267 6.10788 14.267 6.19492 13.9625C6.48953 13.702 6.79165 13.4497 7.09723 13.2018C7.26313 13.0661 7.42903 12.9305 7.59995 12.7908C8.04474 12.4531 8.48377 12.1724 8.97415 11.9066C8.93515 11.7057 8.89616 11.5048 8.85598 11.2978C9.67437 10.5735 10.5795 9.99906 11.558 9.51215C11.648 9.53466 11.738 9.55718 11.8307 9.58037C12.4594 9.255 12.4594 9.255 13.0555 8.8732C13.0938 8.73942 13.0938 8.73942 13.1328 8.60293C14.1324 7.92731 15.0957 7.37869 16.3029 7.22401C16.3674 7.33571 16.4319 7.44742 16.4983 7.56251C16.6711 7.45343 16.8439 7.34435 17.022 7.23196C17.7554 6.83804 18.3404 6.66428 19.1435 6.48666C19.0722 6.22991 19.001 5.97316 18.9276 5.70864C19.0431 5.64196 19.1586 5.57528 19.2775 5.50659C19.8459 6.09919 20.2569 6.73204 20.6701 7.43878C20.8526 7.74622 20.8526 7.74622 21.0388 8.05987C21.3091 8.62131 21.3091 8.62131 21.2523 9.33111C21.0802 9.36123 20.9082 9.39135 20.7309 9.42238C16.3321 10.4942 10.9861 13.6566 7.95382 17.009C7.38898 16.6469 7.1458 16.0716 6.82255 15.5042Z" fill="#282828"/>
      <path d="M28.0014 50.1163C26.4701 47.4735 24.9398 44.8301 23.4108 42.186C22.7008 40.9584 21.9905 39.731 21.2795 38.504C20.6599 37.435 20.041 36.3656 19.4228 35.2958C19.0953 34.729 18.7674 34.1624 18.4388 33.5962C18.0728 32.965 17.7078 32.3333 17.343 31.7014C17.2331 31.5124 17.1232 31.3235 17.0099 31.1288C16.9114 30.9575 16.8128 30.7863 16.7113 30.6098C16.5815 30.3855 16.5815 30.3855 16.449 30.1567C16.2754 29.8063 16.2754 29.8063 16.3527 29.536C16.7085 29.3093 17.0718 29.0943 17.4376 28.884C17.552 28.8179 17.6664 28.7519 17.7842 28.6838C18.1639 28.4647 18.5443 28.2468 18.9248 28.029C19.1875 27.8777 19.4503 27.7263 19.713 27.5749C20.4058 27.1757 21.0991 26.7776 21.7926 26.3798C22.4997 25.9738 23.2062 25.567 23.9127 25.1602C25.3 24.3616 26.688 23.5642 28.0763 22.7673C29.6203 25.4322 31.1634 28.0977 32.7052 30.7638C33.4211 32.0017 34.1373 33.2393 34.8542 34.4765C35.4789 35.5545 36.103 36.6328 36.7263 37.7116C37.0566 38.2831 37.3872 38.8544 37.7185 39.4254C38.0876 40.0618 38.4557 40.6988 38.8234 41.336C38.9343 41.5265 39.0451 41.717 39.1593 41.9133C39.3084 42.1724 39.3084 42.1724 39.4605 42.4366C39.5477 42.5874 39.635 42.7382 39.7249 42.8935C39.9 43.2466 39.9 43.2466 39.8228 43.5169C39.48 43.7372 39.1298 43.9459 38.777 44.1498C38.5508 44.2812 38.3245 44.4125 38.0914 44.5479C37.8419 44.6915 37.5925 44.835 37.343 44.9786C37.0891 45.1253 36.8353 45.272 36.5815 45.4189C36.0487 45.7268 35.5156 46.0341 34.9822 46.341C34.2977 46.735 33.614 47.1304 32.9307 47.5263C32.4064 47.8298 31.8817 48.1325 31.3568 48.4349C31.1045 48.5804 30.8524 48.7262 30.6004 48.8722C30.2483 49.076 29.8955 49.2787 29.5427 49.4813C29.3419 49.597 29.1411 49.7128 28.9342 49.8321C28.4491 50.0835 28.4491 50.0835 28.0014 50.1163ZM28.4082 49.2044C28.7556 49.0251 29.0967 48.8334 29.435 48.6372C29.6552 48.51 29.8755 48.3829 30.1024 48.2518C30.3376 48.1149 30.5728 47.9779 30.808 47.841C31.021 47.7178 31.2339 47.5946 31.4534 47.4676C32.2527 47.005 33.0511 46.5409 33.8496 46.0769C35.634 45.0421 37.4184 44.0072 39.2569 42.9409C35.6131 36.6296 31.9692 30.3182 28.2149 23.8156C24.5771 25.916 20.9393 28.0163 17.1912 30.1802C19.1289 33.5481 19.1289 33.5481 21.0682 36.9151C21.859 38.2872 22.6496 39.6594 23.439 41.0322C24.0751 42.1384 24.7121 43.244 25.3497 44.3494C25.5933 44.7722 25.8367 45.1952 26.0798 45.6184C26.419 46.2089 26.7593 46.7987 27.0999 47.3884C27.2012 47.5654 27.3026 47.7424 27.407 47.9248C27.4995 48.0844 27.5919 48.2439 27.6872 48.4084C27.7676 48.5481 27.8481 48.6878 27.931 48.8318C28.1009 49.1594 28.1009 49.1594 28.4082 49.2044Z" fill="#34A853" fill-opacity="0.6"/>
      <path d="M38.9696 72.6063C38.904 72.4869 38.8385 72.3676 38.771 72.2446C38.6973 72.1187 38.6236 71.9927 38.5477 71.863C38.3016 71.4401 38.062 71.0139 37.8222 70.5875C37.6471 70.2838 37.4717 69.9803 37.296 69.677C36.8197 68.8526 36.3488 68.0252 35.8789 67.1971C35.3869 66.3325 34.8901 65.4706 34.3937 64.6085C33.4544 62.9753 32.5196 61.3396 31.5864 59.703C30.5238 57.8399 29.4562 55.9797 28.3882 54.1197C26.1912 50.2933 24.0006 46.4634 21.814 42.6312C21.9872 42.5311 22.1604 42.4311 22.3389 42.3281C22.4282 42.4839 22.5175 42.6397 22.6095 42.8002C24.7811 46.5882 26.9555 50.3745 29.1332 54.1589C30.1863 55.9891 31.2383 57.8198 32.288 59.6519C33.2028 61.2484 34.1195 62.8439 35.0383 64.4381C35.5249 65.2825 36.0106 66.1275 36.4941 66.9737C36.949 67.7698 37.4063 68.5644 37.8655 69.3581C38.0338 69.6499 38.2012 69.9422 38.3676 70.2351C38.5947 70.6344 38.8249 71.0318 39.056 71.4287C39.1842 71.6518 39.3123 71.8749 39.4443 72.1047C39.853 72.6545 40.0737 72.842 40.746 72.9978C40.9515 72.9536 41.157 72.9095 41.3687 72.864C41.2074 72.5847 41.0462 72.3054 40.8801 72.0177C40.6169 72.0952 40.3536 72.1727 40.0824 72.2526C40.5444 71.9859 41.0063 71.7192 41.4823 71.4444C40.6439 69.9922 39.8055 68.54 38.9417 67.0439C38.4797 67.3106 38.0178 67.5773 37.5418 67.8521C37.5096 67.7962 37.4773 67.7404 37.4441 67.6828C37.9638 67.3828 38.4835 67.0827 39.0189 66.7736C39.9218 68.3375 40.8247 69.9013 41.755 71.5126C45.2773 69.479 48.7997 67.4453 52.4288 65.3501C52.6545 65.741 52.8802 66.132 53.1128 66.5348C51.5399 67.4638 49.965 68.3892 48.3873 69.3099C47.6547 69.7375 46.923 70.1664 46.1928 70.5982C45.488 71.0149 44.7813 71.4283 44.0731 71.8395C43.8035 71.9968 43.5346 72.1554 43.2664 72.3151C42.8901 72.5389 42.5116 72.7583 42.1323 72.9769C41.9175 73.1029 41.7027 73.2289 41.4814 73.3588C40.3439 73.8154 39.5885 73.6397 38.9696 72.6063Z" fill="#BABABA"/>
      <path d="M39.1496 71.3417C39.0436 71.1601 39.0436 71.1601 38.9355 70.9748C38.6993 70.5687 38.4669 70.1605 38.2345 69.7522C38.066 69.4607 37.8972 69.1693 37.7283 68.878C37.2701 68.0865 36.8152 67.2931 36.361 66.4994C35.8857 65.6701 35.4075 64.8424 34.9298 64.0146C34.1281 62.6245 33.3284 61.2334 32.53 59.8415C31.5039 58.0524 30.4745 56.2653 29.4441 54.4788C28.5596 52.9452 27.6766 51.4108 26.7939 49.8763C26.5093 49.3818 26.2246 48.8874 25.9398 48.393C25.4934 47.6177 25.0478 46.842 24.603 46.0658C24.4392 45.7802 24.2751 45.4947 24.1106 45.2095C23.8872 44.8218 23.6648 44.4335 23.4428 44.045C23.3178 43.8273 23.1928 43.6096 23.064 43.3853C22.809 42.8905 22.809 42.8905 22.8863 42.6203C22.7012 42.2496 22.5035 41.8853 22.3012 41.5238C22.2381 41.4105 22.175 41.2973 22.11 41.1806C21.9003 40.8046 21.6895 40.4294 21.4786 40.0542C21.3333 39.7943 21.1882 39.5344 21.0431 39.2744C20.6603 38.5891 20.2765 37.9044 19.8925 37.2197C19.5011 36.5215 19.1106 35.8228 18.7201 35.124C17.9532 33.7522 17.1852 32.381 16.4165 31.0102C16.4743 30.9769 16.532 30.9436 16.5915 30.9092C23.5245 42.9175 30.4575 54.9258 37.6006 67.298C38.1203 66.9979 38.64 66.6979 39.1754 66.3888C39.1822 66.5338 39.1889 66.6789 39.1959 66.8283C39.3724 67.1685 39.5603 67.5029 39.7536 67.8338C39.9255 68.1295 39.9255 68.1295 40.1008 68.4312C40.2218 68.6374 40.3428 68.8436 40.4675 69.056C40.5886 69.2639 40.7096 69.4718 40.8344 69.686C41.1343 70.2007 41.4351 70.715 41.7365 71.2288C41.5378 71.418 41.3391 71.6072 41.1343 71.8021C41.2955 72.0814 41.4568 72.3607 41.6229 72.6484C41.1433 72.8461 40.8877 72.8986 40.3863 72.7751C39.733 72.411 39.5189 71.9832 39.1496 71.3417Z" fill="#CFCFCF"/>
      <path d="M53.0922 66.0955C53.0821 65.8779 53.0821 65.8779 53.0717 65.6559C53.245 65.5559 53.4182 65.4559 53.5967 65.3529C47.7923 55.2994 41.9879 45.2459 36.0077 34.8878C35.8922 34.9545 35.7767 35.0212 35.6577 35.0899C37.0511 37.6366 38.4444 40.1833 39.88 42.8072C39.8223 42.8405 39.7645 42.8738 39.705 42.9082C35.8999 36.3176 32.0948 29.727 28.1745 22.9367C28.4444 23.0042 28.7144 23.0717 28.9925 23.1413C25.4998 16.8917 25.4998 16.8917 21.9365 10.5158C21.9942 10.4825 22.052 10.4491 22.1115 10.4148C32.5916 28.5669 43.0717 46.7189 53.8694 65.4211C53.6129 65.6436 53.3564 65.8662 53.0922 66.0955Z" fill="#34A853"/>
      <path d="M41.7392 73.1017C41.5134 72.7107 41.2877 72.3197 41.0552 71.9169C44.8085 69.7499 48.5618 67.583 52.4289 65.3503C52.6546 65.7413 52.8803 66.1322 53.1129 66.5351C49.3595 68.702 45.6062 70.869 41.7392 73.1017Z" fill="#4B4B4B"/>
      <path d="M6.85136 15.5576C6.76313 15.4037 6.6749 15.2499 6.584 15.0914C6.45031 14.8614 6.45031 14.8614 6.31391 14.6267C6.11729 14.2325 6.11729 14.2325 6.19456 13.9622C6.48916 13.7017 6.79128 13.4494 7.09687 13.2015C7.26276 13.0659 7.42866 12.9302 7.59959 12.7905C8.04437 12.4528 8.4834 12.1721 8.97378 11.9063C8.93478 11.7054 8.89579 11.5045 8.85561 11.2975C9.92394 10.352 11.0213 9.55118 12.4529 9.44629C12.8076 10.0607 13.1624 10.675 13.5278 11.308C13.1538 11.5611 13.1538 11.5611 12.7722 11.8192C11.0179 13.0165 9.33065 14.213 7.76919 15.6509C7.63652 15.7639 7.50385 15.8768 7.36715 15.9932C7.09446 15.925 7.09446 15.925 6.85136 15.5576Z" fill="#3E3E3E"/>
      <path d="M29.3922 45.2514C26.748 40.6715 24.1038 36.0916 21.3794 31.3729C23.285 30.2727 25.1905 29.1726 27.1538 28.0391C29.798 32.619 32.4422 37.1989 35.1665 41.9176C33.261 43.0178 31.3555 44.1179 29.3922 45.2514ZM29.5467 44.7109C31.2213 43.7441 32.8958 42.7773 34.6211 41.7812C32.1059 37.4247 29.5907 33.0682 26.9992 28.5796C25.3247 29.5464 23.6501 30.5133 21.9248 31.5094C24.44 35.8659 26.9553 40.2224 29.5467 44.7109Z" fill="#D4D4D4"/>
      <path d="M3.79736 12.6388C4.08473 12.4632 4.37675 12.2951 4.67226 12.1337C5.16419 12.2567 5.33497 12.7816 5.58701 13.1861C5.71306 13.3875 5.83911 13.5889 5.96898 13.7964C6.10088 14.0089 6.23277 14.2215 6.36867 14.4405C6.50162 14.6533 6.63457 14.8662 6.77155 15.0855C7.1012 15.6134 7.43008 16.1418 7.75829 16.6706C8.28213 16.3682 8.70146 16.0124 9.1589 15.6212C11.3158 13.8012 13.7476 12.4697 16.2141 11.1116C16.2463 11.1675 16.2786 11.2233 16.3118 11.2809C16.1785 11.3635 16.0451 11.4462 15.9078 11.5313C15.2981 11.9097 14.6889 12.2889 14.0798 12.6682C13.8701 12.7982 13.6603 12.9282 13.4442 13.0621C10.6007 14.8207 10.6007 14.8207 8.69455 17.4841C8.80189 18.037 8.93912 18.386 9.19212 18.8778C9.26761 19.0255 9.3431 19.1732 9.42087 19.3254C9.50009 19.4785 9.57931 19.6315 9.66092 19.7893C9.7406 19.9447 9.82027 20.1002 9.90236 20.2603C10.099 20.6438 10.2963 21.0269 10.4943 21.4096C10.3788 21.4763 10.2633 21.543 10.1444 21.6117C11.8857 24.6277 13.627 27.6437 15.4211 30.7512C15.3633 30.7845 15.3056 30.8179 15.2461 30.8522C15.1767 30.7363 15.1074 30.6203 15.036 30.5009C14.3749 29.3959 13.7132 28.2913 13.0508 27.1871C12.7105 26.6197 12.3704 26.0521 12.0309 25.4843C9.67449 21.4099 9.67449 21.4099 6.90384 17.6153C6.75818 17.3703 6.61908 17.1212 6.48727 16.8685C5.96942 15.938 5.32968 15.1187 4.66305 14.2904C4.24283 13.7594 3.90792 13.3184 3.79736 12.6388Z" fill="#BAB0A5"/>
      <path d="M27.2234 39.479C27.1338 39.2589 27.1338 39.2589 27.0423 39.0343C26.9503 38.8147 26.9503 38.8147 26.8564 38.5907C26.729 38.2138 26.729 38.2138 26.8063 37.9435C27.2867 37.6435 27.768 37.357 28.2595 37.0763C28.464 36.9569 28.464 36.9569 28.6726 36.8352C29.2566 36.4993 29.7427 36.2343 30.4036 36.0923C30.5678 36.3547 30.7293 36.6188 30.8896 36.8836C30.9798 37.0305 31.07 37.1774 31.163 37.3287C31.3916 37.8076 31.4046 38.138 31.4217 38.6638C31.5439 38.7422 31.6661 38.8206 31.7921 38.9013C30.8104 39.4681 29.8288 40.0348 28.8174 40.6187C28.5407 40.4062 28.264 40.1936 27.9789 39.9745C27.4335 39.8381 27.4335 39.8381 27.2234 39.479Z" fill="#E5E7E6"/>
      <path d="M12.6284 9.34553C13.189 8.38319 14.0724 7.96899 15.0577 7.49166C15.8006 7.28838 15.8006 7.28838 16.303 7.22401C16.3675 7.33572 16.432 7.44742 16.4984 7.56251C16.7576 7.39889 16.7576 7.39889 17.0221 7.23197C17.7555 6.83805 18.3405 6.66429 19.1436 6.48667C19.0723 6.22992 19.0011 5.97317 18.9277 5.70864C19.0432 5.64196 19.1587 5.57529 19.2777 5.50659C19.9014 6.14148 20.295 6.83372 20.723 7.60582C20.5396 7.48827 20.5396 7.48827 20.3525 7.36834C20.1561 7.48643 19.9596 7.60452 19.7572 7.72619C19.1277 8.07552 19.1277 8.07552 18.855 8.00729C16.959 8.53338 15.2229 9.51869 13.4874 10.4292C13.0193 10.0225 13.0193 10.0225 12.6284 9.34553Z" fill="#595959"/>
      <path d="M7.09473 15.9252C9.13524 14.1623 11.1163 12.5427 13.528 11.3082C13.1733 10.6939 12.8186 10.0795 12.4532 9.44648C12.5109 9.41314 12.5686 9.37981 12.6281 9.34546C13.1441 10.2391 13.66 11.1327 14.1916 12.0535C13.8422 12.3151 13.4928 12.5767 13.1329 12.8463C12.7908 13.1033 12.449 13.3605 12.1072 13.6178C11.8715 13.7949 11.6356 13.9718 11.3995 14.1484C9.60098 15.4913 9.60098 15.4913 7.95373 17.0089C7.49761 16.7165 7.34804 16.3929 7.09473 15.9252Z" fill="#212121"/>
      <path d="M24.2863 33.9825C24.1828 33.6699 24.0793 33.3573 23.9727 33.0352C24.1714 32.846 24.3701 32.6568 24.5749 32.4619C24.4459 32.2385 24.3169 32.0151 24.184 31.7849C24.415 31.6515 24.646 31.5182 24.8839 31.3808C25.1199 32.0066 25.344 32.6264 25.5111 33.2753C25.5977 33.1835 25.6842 33.0916 25.7733 32.997C26.1133 32.702 26.1133 32.702 26.736 32.5682C26.5748 32.2889 26.4135 32.0096 26.2474 31.7219C26.1319 31.7886 26.0164 31.8553 25.8974 31.924C25.6785 31.678 25.4595 31.4321 25.2339 31.1787C25.5226 31.012 25.8113 30.8453 26.1088 30.6736C26.2378 30.897 26.3668 31.1204 26.4997 31.3506C26.7629 31.2731 27.0261 31.1956 27.2973 31.1158C27.5163 31.3617 27.7352 31.6076 27.9608 31.861C27.8768 31.9654 27.7927 32.0698 27.706 32.1773C27.3771 32.6517 27.3771 32.6517 27.4973 33.4826C26.8621 33.8494 26.2269 34.2161 25.5725 34.5939C25.3535 34.348 25.1345 34.1021 24.9089 33.8487C24.7035 33.8928 24.498 33.937 24.2863 33.9825Z" fill="#CCCCCC"/>
      <path d="M40.1592 71.9824C39.3531 70.586 38.5469 69.1897 37.7163 67.7511C38.1205 67.5177 38.5247 67.2844 38.9412 67.0439C39.7796 68.4961 40.618 69.9483 41.4818 71.4444C41.0453 71.622 40.6089 71.7995 40.1592 71.9824Z" fill="#D7D7D7"/>
      <path d="M6.50842 14.9099C6.35319 14.441 6.35319 14.441 6.19482 13.9626C6.49331 13.7139 6.79264 13.4661 7.0923 13.2188C7.25889 13.0807 7.42549 12.9426 7.59713 12.8004C8.04255 12.4556 8.47908 12.1738 8.97404 11.9067C8.93505 11.7058 8.89605 11.5049 8.85587 11.2979C9.66676 10.5802 10.5688 9.96066 11.5578 9.51221C11.7955 9.5239 12.0333 9.53559 12.2782 9.54764C12.4072 9.77105 12.5362 9.99446 12.6691 10.2247C12.5279 10.3187 12.3867 10.4127 12.2412 10.5095C11.7182 10.8583 11.1955 11.2077 10.6731 11.5575C10.4469 11.7088 10.2204 11.8599 9.99387 12.0107C9.66837 12.2274 9.34353 12.4451 9.0187 12.6628C8.82295 12.7935 8.6272 12.9243 8.42552 13.059C7.95696 13.3581 7.95696 13.3581 7.71283 13.7632C7.53758 13.8597 7.36234 13.9562 7.18178 14.0557C6.60876 14.323 6.60876 14.323 6.50842 14.9099Z" fill="#717171"/>
      <path d="M3.79736 12.6386C4.08472 12.4631 4.37674 12.2949 4.67226 12.1335C4.94496 12.2017 4.94496 12.2017 5.25399 12.6911C5.37947 12.9106 5.50495 13.13 5.63423 13.3561C5.7345 13.5307 5.7345 13.5307 5.83681 13.7087C6.0509 14.0818 6.26376 14.4556 6.47661 14.8294C6.62122 15.0819 6.76592 15.3343 6.9107 15.5868C7.26611 16.2068 7.62042 16.8275 7.97417 17.4485C7.68546 17.6152 7.39674 17.7819 7.09927 17.9536C7.03682 17.8361 6.97438 17.7185 6.91004 17.5974C6.25157 16.4045 5.50816 15.3317 4.65331 14.2733C4.23506 13.7473 3.90815 13.3125 3.79736 12.6386Z" fill="#C0C0C0"/>
      <path d="M13.2956 10.5258C13.1589 10.2766 13.1589 10.2766 13.0195 10.0223C13.1739 10.1565 13.3284 10.2908 13.4876 10.429C13.6904 10.3067 13.8931 10.1844 14.102 10.0584C15.6176 9.15636 17.0652 8.35875 18.7574 7.83785C18.9241 7.77914 19.0908 7.72042 19.2626 7.65992C19.7301 7.50198 19.7301 7.50198 20.3527 7.36816C20.6746 7.64778 20.6746 7.64778 20.9186 7.94413C20.0804 8.31088 19.2432 8.64761 18.3828 8.95684C17.1868 9.40361 16.0689 9.97456 14.9406 10.5699C13.7123 11.2137 13.7123 11.2137 13.2956 10.5258Z" fill="#444444"/>
      <path d="M38.9244 71.5779C38.8287 71.4096 38.8287 71.4096 38.7311 71.238C38.5289 70.881 38.3305 70.5221 38.1321 70.163C37.9953 69.9199 37.8582 69.677 37.7209 69.4342C37.3857 68.8402 37.0538 68.2444 36.7236 67.6476C37.4487 67.3034 38.1739 66.9592 38.9211 66.6045C38.9533 66.6604 38.9855 66.7162 39.0188 66.7738C38.3742 67.2576 38.3742 67.2576 37.7166 67.7512C38.5228 69.1476 39.329 70.5439 40.1596 71.9825C40.3073 71.9717 40.455 71.9608 40.6072 71.9497C40.8799 72.0179 40.8799 72.0179 41.1413 72.4453C41.2538 72.6526 41.2538 72.6526 41.3685 72.8642C40.8874 73.0625 40.6329 73.1144 40.1301 72.9896C39.4856 72.6307 39.2804 72.2137 38.9244 71.5779Z" fill="#C5C5C5"/>
      <path d="M13.0963 9.75226C12.9996 9.5847 12.9028 9.41714 12.8032 9.24451C13.2931 8.29053 14.1038 7.95476 15.0575 7.49166C15.8004 7.28838 15.8004 7.28838 16.3028 7.22401C16.3673 7.33572 16.4318 7.44742 16.4982 7.56251C16.7574 7.39889 16.7574 7.39889 17.0219 7.23197C17.7552 6.83805 18.3403 6.66429 19.1434 6.48667C19.0721 6.22992 19.0009 5.97317 18.9275 5.70864C19.043 5.64196 19.1584 5.57529 19.2774 5.50659C19.7994 6.21059 19.7994 6.21059 20.3319 6.92882C20.0941 6.91713 19.8564 6.90544 19.6115 6.89339C19.232 7.02242 18.8569 7.16541 18.4858 7.31766C17.4133 7.75685 17.4133 7.75685 16.8106 7.82112C15.9756 7.98777 15.3296 8.41522 14.6042 8.85345C14.4588 8.93943 14.3135 9.02541 14.1637 9.11399C13.807 9.32522 13.4515 9.53853 13.0963 9.75226Z" fill="#848484"/>
      <path d="M18.9275 5.70853C19.0107 5.586 19.094 5.46348 19.1797 5.33723C19.0814 5.17525 18.9831 5.01327 18.8818 4.84638C18.5934 4.32173 18.5934 4.32173 18.6707 4.05146C19.0166 3.84254 19.3666 3.64011 19.7206 3.44531C20.1421 4.2316 20.562 5.01878 20.9815 5.80612C21.1011 6.02903 21.2206 6.25194 21.3437 6.4816C21.4583 6.69692 21.5728 6.91223 21.6908 7.13407C21.7965 7.33188 21.9021 7.52969 22.011 7.7335C22.2532 8.22729 22.438 8.7056 22.5953 9.23261C22.2998 9.25426 22.0043 9.27591 21.6999 9.29821C21.7832 9.17568 21.8664 9.05315 21.9522 8.92691C21.185 7.7315 20.4178 6.53608 19.6274 5.30443C19.5442 5.42696 19.4609 5.54949 19.3752 5.67573C19.2274 5.68656 19.0797 5.69738 18.9275 5.70853Z" fill="#CECCCB"/>
      <path d="M6.70374 15.2482C6.54851 14.7793 6.54851 14.7793 6.39014 14.301C6.58704 14.1919 6.78394 14.0829 6.9868 13.9706C7.61141 13.6554 7.61141 13.6554 7.86724 13.2225C8.30788 12.9144 8.74994 12.6173 9.20118 12.3254C9.33021 12.2413 9.45924 12.1573 9.59218 12.0706C10.5979 11.4198 11.6201 10.8041 12.6689 10.2246C12.5977 9.96781 12.5264 9.71106 12.453 9.44653C12.6143 9.72579 12.7755 10.0051 12.9416 10.2928C12.5977 10.8565 12.2853 11.1831 11.7216 11.534C11.5827 11.6219 11.4439 11.7098 11.3008 11.8003C11.1562 11.8898 11.0116 11.9792 10.8626 12.0714C9.8966 12.6756 8.96888 13.2839 8.08313 14.0005C8.11538 14.0564 8.14762 14.1122 8.18085 14.1698C7.6934 14.5257 7.20596 14.8816 6.70374 15.2482Z" fill="#5C5C5C"/>
      <path d="M29.6351 23.447C29.5383 23.2795 29.4416 23.1119 29.3419 22.9393C29.4574 22.8726 29.5729 22.8059 29.6919 22.7372C29.1759 21.8436 28.66 20.95 28.1284 20.0292C28.1861 19.9959 28.2439 19.9626 28.3034 19.9282C30.2331 22.7109 31.8389 25.6787 33.4736 28.6388C33.8496 29.319 34.2269 29.9985 34.6041 30.6781C35.3389 32.0023 36.0723 33.3274 36.8047 34.653C36.6892 34.7197 36.5738 34.7863 36.4548 34.855C36.3733 34.7131 36.2919 34.5712 36.2081 34.425C35.4422 33.0905 34.6756 31.7565 33.908 30.423C33.5134 29.7374 33.1191 29.0515 32.7255 28.3653C32.346 27.7036 31.9656 27.0423 31.5847 26.3814C31.4392 26.1287 31.294 25.8757 31.1491 25.6226C30.9467 25.2692 30.7434 24.9165 30.5397 24.564C30.3662 24.262 30.3662 24.262 30.1891 23.954C29.9686 23.4979 29.9686 23.4979 29.6351 23.447Z" fill="#A8A8A8"/>
      <path d="M27.4337 39.8382C27.2502 39.4857 27.2502 39.4857 27.0596 39.0387C26.9638 38.8182 26.9638 38.8182 26.8662 38.5932C26.7292 38.2139 26.7292 38.2139 26.8065 37.9437C27.26 37.65 27.734 37.3986 28.2063 37.1355C28.4899 37.3631 28.4899 37.3631 28.7722 37.7114C28.807 38.1744 28.807 38.1744 28.7609 38.677C28.7472 38.8444 28.7334 39.0117 28.7193 39.1841C28.706 39.3117 28.6927 39.4392 28.679 39.5706C27.7405 39.915 27.7405 39.915 27.4337 39.8382Z" fill="#CBCCCC"/>
      <path d="M29.8585 39.2138C29.746 39.0064 29.746 39.0064 29.6313 38.7949C29.8045 38.6949 29.9777 38.5949 30.1562 38.4918C30.0527 38.1792 29.9492 37.8666 29.8426 37.5445C30.1096 37.2493 30.1096 37.2493 30.4448 36.9712C30.6248 37.0162 30.8048 37.0612 30.9902 37.1076C31.1567 37.5475 31.1567 37.5475 31.3038 38.0549C31.4328 38.2783 31.5618 38.5017 31.6947 38.7319C31.7269 38.7878 31.7592 38.8436 31.7924 38.9012C30.7254 39.5392 30.7254 39.5392 30.3925 39.7094C30.1198 39.6411 30.1198 39.6411 29.8585 39.2138Z" fill="#C8C9C9"/>
      <path d="M23.5767 12.9535C23.3195 12.519 23.0637 12.0838 22.8085 11.6481C22.7357 11.5255 22.6629 11.4029 22.588 11.2765C22.2406 10.6814 21.9618 10.1375 21.7974 9.46751C22.0606 9.39001 22.3238 9.31251 22.595 9.23267C23.1499 10.3272 23.7049 11.4217 24.2766 12.5494C24.0457 12.6828 23.8147 12.8161 23.5767 12.9535Z" fill="#B8A898"/>
      <path d="M12.8032 9.24438C12.9 9.41194 12.9967 9.5795 13.0964 9.75213C13.3043 9.61058 13.5122 9.46902 13.7264 9.32318C14.0027 9.13825 14.279 8.95343 14.5554 8.7687C14.692 8.67529 14.8286 8.58188 14.9694 8.48564C15.7347 7.97743 16.2884 7.67129 17.2186 7.59781C17.6629 7.42737 18.1047 7.24976 18.5412 7.05989C18.5735 7.11574 18.6057 7.17159 18.6389 7.22914C16.9066 8.22928 15.1743 9.22943 13.3895 10.2599C12.9282 9.96411 12.9203 9.76107 12.8032 9.24438ZM18.7366 7.39839C18.7044 7.34254 18.6722 7.28668 18.6389 7.22914C19.0431 6.99577 19.4473 6.7624 19.8638 6.52197C19.9605 6.68952 20.0573 6.85708 20.1569 7.02972C19.2403 7.36149 19.2403 7.36149 18.7366 7.39839Z" fill="#6C6C6C"/>
      <path d="M21.814 42.6315C21.9872 42.5315 22.1605 42.4315 22.3389 42.3284C24.306 45.7354 26.273 49.1424 28.2997 52.6527C28.1842 52.7194 28.0687 52.786 27.9497 52.8547C27.1929 51.5968 26.4362 50.3388 25.6796 49.0808C25.3282 48.4967 24.9769 47.9126 24.6255 47.3285C24.2215 46.657 23.8177 45.9856 23.4138 45.3141C23.2875 45.1042 23.1613 44.8943 23.0312 44.6781C22.8557 44.3864 22.8557 44.3864 22.6768 44.0888C22.5736 43.9173 22.4705 43.7458 22.3642 43.5692C22.1782 43.2581 21.9952 42.9453 21.814 42.6315Z" fill="#ABABAB"/>
      <path d="M15.2462 30.8518C13.3759 27.6124 11.5056 24.3729 9.57861 21.0353C9.75184 20.9353 9.92507 20.8353 10.1036 20.7322C10.2326 20.9556 10.3615 21.179 10.4944 21.4092C10.3789 21.4759 10.2635 21.5426 10.1445 21.6113C11.8858 24.6273 13.6271 27.6433 15.4212 30.7508C15.3634 30.7841 15.3057 30.8175 15.2462 30.8518Z" fill="#B5B5B5"/>
      <path d="M24.6973 35.0989C24.1813 34.2052 23.6654 33.3116 23.1338 32.3909C23.679 32.0016 24.2242 31.6124 24.7859 31.2114C24.7994 31.5015 24.8129 31.7916 24.8268 32.0904C24.73 31.9229 24.6333 31.7553 24.5336 31.5827C24.4182 31.6494 24.3027 31.716 24.1837 31.7847C24.3127 32.0081 24.4417 32.2315 24.5745 32.4617C24.4081 32.7068 24.2416 32.9518 24.0701 33.2043C24.3731 33.9045 24.3731 33.9045 24.8944 34.026C25.0213 34.0458 25.1482 34.0656 25.279 34.086C25.318 34.2869 25.357 34.4878 25.3972 34.6948C25.1662 34.8281 24.9352 34.9615 24.6973 35.0989Z" fill="#DDDEDE"/>
      <path d="M27.4972 33.4826C27.428 32.8092 27.4551 32.6059 27.7858 31.962C27.5668 31.7161 27.3479 31.4701 27.1222 31.2168C26.9168 31.2609 26.7113 31.3051 26.4996 31.3506C26.3961 31.038 26.2926 30.7254 26.186 30.4033C26.507 30.2925 26.8279 30.1816 27.1586 30.0674C27.6423 30.9052 28.126 31.743 28.6244 32.6062C28.4001 32.8846 28.1759 33.163 27.9449 33.4498C27.7972 33.4606 27.6494 33.4715 27.4972 33.4826Z" fill="#E0E0E0"/>
      <path d="M25.2334 31.1787C25.5221 31.012 25.8108 30.8453 26.1083 30.6736C26.2372 30.897 26.3662 31.1204 26.4991 31.3506C26.7623 31.2731 27.0256 31.1956 27.2968 31.1157C27.5157 31.3617 27.7347 31.6076 27.9603 31.861C27.2391 32.5312 27.2391 32.5312 26.7355 32.5681C26.5742 32.2889 26.413 32.0096 26.2469 31.7219C26.1314 31.7886 26.0159 31.8552 25.8969 31.9239C25.5265 31.6865 25.5265 31.6865 25.2334 31.1787Z" fill="#9E9E9E"/>
      <path d="M47.9084 55.0968C48.0239 55.0301 48.1394 54.9635 48.2584 54.8948C46.9363 52.6048 45.6142 50.3148 44.252 47.9555C44.3098 47.9222 44.3675 47.8888 44.427 47.8545C46.0003 50.4462 47.5736 53.0379 49.1946 55.7082C49.0214 55.8082 48.8482 55.9082 48.6697 56.0113C48.2016 55.6046 48.2016 55.6046 47.9084 55.0968Z" fill="#B5B5B5"/>
      <path d="M40.139 71.5428C39.494 70.4258 38.8491 69.3087 38.1846 68.1578C38.3579 68.0578 38.5311 67.9578 38.7096 67.8547C39.3545 68.9718 39.9994 70.0888 40.6639 71.2398C40.4907 71.3398 40.3175 71.4398 40.139 71.5428Z" fill="#34A853"/>
      <path d="M28.731 36.832C29.2829 36.5878 29.8349 36.3436 30.4035 36.092C30.597 36.4272 30.7905 36.7623 30.9898 37.1075C30.8438 37.1546 30.6978 37.2017 30.5473 37.2502C29.9723 37.4424 29.9723 37.4424 29.3173 37.8475C28.9469 37.61 28.9469 37.61 28.731 36.832Z" fill="#DEDEDE"/>
      <path d="M9.081 16.1327C9.07425 15.9877 9.06751 15.8426 9.06055 15.6932C11.0004 13.7045 13.8164 12.4546 16.2143 11.1116C16.2465 11.1675 16.2788 11.2233 16.312 11.2809C16.112 11.4048 16.112 11.4048 15.9079 11.5313C15.2982 11.9097 14.6891 12.289 14.08 12.6683C13.8702 12.7982 13.6605 12.9282 13.4443 13.0621C11.5439 14.2144 11.5439 14.2144 9.9025 15.6866C9.77914 15.823 9.65578 15.9594 9.52868 16.0999C9.38095 16.1107 9.23321 16.1216 9.081 16.1327Z" fill="#B0B0B0"/>
      <path d="M19.4931 6.28444C19.4151 5.88265 19.3371 5.48086 19.2568 5.06689C19.8022 5.20334 19.8022 5.20334 20.0525 5.5451C20.1356 5.69329 20.2187 5.84148 20.3043 5.99416C20.3951 6.15408 20.486 6.31399 20.5795 6.47876C20.6728 6.64714 20.7661 6.81551 20.8623 6.98899C20.9577 7.1579 21.0531 7.3268 21.1514 7.50083C21.3873 7.91889 21.6214 8.33781 21.8542 8.75759C21.681 8.85761 21.5078 8.95762 21.3293 9.06067C21.2196 8.86597 21.1099 8.67128 20.9969 8.47069C20.8528 8.21741 20.7087 7.96416 20.5646 7.71093C20.4923 7.58234 20.42 7.45375 20.3455 7.32127C20.1589 6.99454 19.963 6.67313 19.7658 6.35266C19.6758 6.33015 19.5858 6.30764 19.4931 6.28444Z" fill="#B8B8B8"/>
      <path d="M7.90827 14.1017C7.87602 14.0459 7.84378 13.99 7.81055 13.9325C8.90244 13.0911 10.0381 12.3481 11.2032 11.6114C11.3409 11.5235 11.4787 11.4355 11.6207 11.3448C11.7444 11.2666 11.8682 11.1883 11.9957 11.1076C12.3459 10.8619 12.6406 10.5948 12.9418 10.293C12.9808 10.4939 13.0198 10.6947 13.06 10.9017C12.51 11.2959 11.959 11.6887 11.4079 12.0812C11.2537 12.1918 11.0994 12.3023 10.9406 12.4163C10.0446 13.0532 9.15306 13.6542 8.18097 14.1699C8.09098 14.1474 8.00099 14.1249 7.90827 14.1017Z" fill="#4D4D4D"/>
      <path d="M7.09931 17.9534C6.50875 16.7305 6.50875 16.7305 5.90626 15.4828C5.964 15.4495 6.02174 15.4162 6.08124 15.3818C5.87763 14.8291 5.87763 14.8291 5.66992 14.2653C5.72766 14.232 5.78541 14.1986 5.8449 14.1643C6.54757 15.248 7.25024 16.3317 7.97421 17.4482C7.68549 17.6149 7.39678 17.7816 7.09931 17.9534Z" fill="#CCCAC9"/>
      <path d="M15.1689 31.1221C15.3999 30.9888 15.6309 30.8554 15.8689 30.718C15.8894 30.8177 15.91 30.9173 15.9311 31.0199C16.146 31.6859 16.4817 32.2791 16.8157 32.89C16.8874 33.0226 16.9591 33.1552 17.033 33.2919C17.2616 33.714 17.4912 34.1356 17.7208 34.5571C17.8762 34.8438 18.0316 35.1305 18.1869 35.4172C18.567 36.1189 18.9482 36.82 19.3299 37.5209C19.2721 37.5542 19.2144 37.5875 19.1549 37.6219C18.6342 36.7779 18.1137 35.9338 17.5933 35.0897C17.4162 34.8025 17.2391 34.5154 17.0619 34.2282C16.8074 33.8156 16.5529 33.4029 16.2985 32.9902C16.2193 32.8618 16.14 32.7333 16.0583 32.601C15.7563 32.111 15.4568 31.6206 15.1689 31.1221Z" fill="#A2A2A2"/>
      <path d="M13.0963 9.75227C12.9996 9.58472 12.9028 9.41716 12.8032 9.24452C13.7848 8.67778 14.7664 8.11103 15.7778 7.5271C15.9001 7.60547 16.0223 7.68384 16.1482 7.76458C15.6329 8.33431 15.0448 8.65174 14.382 9.02411C14.2587 9.09425 14.1354 9.1644 14.0084 9.23667C13.7048 9.40931 13.4006 9.58089 13.0963 9.75227Z" fill="#959595"/>
      <path d="M24.8477 32.5302C24.9886 32.3743 25.1296 32.2184 25.2749 32.0578C25.2063 31.6427 25.2063 31.6427 25.059 31.2798C25.3357 31.4924 25.6124 31.705 25.8975 31.924C26.013 31.8573 26.1285 31.7907 26.2475 31.722C26.4087 32.0012 26.57 32.2805 26.7361 32.5682C26.3319 32.8016 25.9277 33.035 25.5112 33.2754C25.2922 33.0295 25.0733 32.7835 24.8477 32.5302Z" fill="#E6E6E6"/>
      <path d="M21.9886 42.5303C21.0534 40.9106 20.1183 39.2908 19.1548 37.622C19.2125 37.5887 19.2703 37.5554 19.3298 37.521C19.3907 37.6164 19.4516 37.7118 19.5144 37.8101C21.1047 40.3099 21.1047 40.3099 22.8067 42.735C22.6522 42.6007 22.4977 42.4665 22.3385 42.3282C22.2231 42.3949 22.1076 42.4616 21.9886 42.5303Z" fill="#B8B8B8"/>
      <path d="M17.5572 11.0132C17.4928 10.9015 17.4283 10.7898 17.3618 10.6747C17.7668 10.4667 18.1729 10.261 18.5796 10.0563C18.9186 9.88404 18.9186 9.88404 19.2646 9.70836C19.8364 9.46107 20.1965 9.35337 20.8046 9.36399C19.7856 10.2238 18.8302 10.6358 17.5572 11.0132Z" fill="#B6B6B6"/>
      <path d="M8.19683 12.581C8.16459 12.5251 8.13234 12.4693 8.09912 12.4117C8.2835 12.2727 8.46789 12.1337 8.65786 11.9904C9.23056 11.6205 9.23056 11.6205 9.30352 11.265C9.64984 11.0487 10.0026 10.8426 10.3583 10.642C10.5524 10.5319 10.7466 10.4218 10.9467 10.3084C11.0974 10.2241 11.2481 10.1397 11.4033 10.0527C11.4356 10.1086 11.4678 10.1644 11.501 10.222C11.1546 10.422 10.8081 10.622 10.4511 10.8281C10.5156 10.9398 10.5801 11.0516 10.6466 11.1666C9.866 11.8233 9.15581 12.2334 8.19683 12.581Z" fill="#A0A0A0"/>
      <path d="M13.251 9.21182C13.212 9.01092 13.173 8.81003 13.1328 8.60304C15.1128 7.37662 15.1128 7.37662 16.3029 7.22412C16.3674 7.33583 16.4319 7.44753 16.4984 7.56262C16.2929 7.60679 16.0874 7.65095 15.8757 7.69645C15.4187 7.94445 14.9713 8.19747 14.5244 8.4625C14.3409 8.57001 14.3409 8.57001 14.1536 8.67969C13.8523 8.8563 13.5516 9.03396 13.251 9.21182Z" fill="#5E5E5E"/>
      <path d="M28.2515 40.0429C28.3858 39.742 28.52 39.4411 28.6583 39.1311C29.0429 39.1911 29.0429 39.1911 29.4764 39.3358C29.6054 39.5592 29.7344 39.7826 29.8672 40.0128C29.5208 40.2128 29.1743 40.4128 28.8174 40.6189C28.6306 40.4288 28.4439 40.2388 28.2515 40.0429Z" fill="#CFD0D0"/>
      <path d="M8.97413 11.9066C8.93514 11.7057 8.89614 11.5048 8.85596 11.2978C9.68374 10.5652 10.5953 10.0461 11.5579 9.51221C11.7124 9.64643 11.8669 9.78065 12.026 9.91894C11.8415 10.0228 11.657 10.1267 11.4669 10.2338C11.2247 10.3715 10.9825 10.5093 10.7404 10.6471C10.6188 10.7154 10.4972 10.7837 10.3719 10.8541C9.82028 11.1691 9.40218 11.4334 8.97413 11.9066Z" fill="#5C5C5C"/>
      <path d="M24.2863 33.9824C24.1828 33.6698 24.0793 33.3572 23.9727 33.0351C24.2936 32.9242 24.6146 32.8134 24.9453 32.6992C25.0488 33.0118 25.1523 33.3244 25.2589 33.6465C24.9379 33.7573 24.617 33.8682 24.2863 33.9824Z" fill="#7E8080"/>
      <path d="M3.79736 12.6385C3.91285 12.5718 4.02833 12.5052 4.14732 12.4365C4.66326 13.3301 5.17921 14.2237 5.71078 15.1445C4.77911 14.5472 3.97406 13.7788 3.79736 12.6385Z" fill="#B5B5B5"/>
      <path d="M29.6356 23.447C29.5388 23.2795 29.4421 23.1119 29.3424 22.9393C29.4579 22.8726 29.5734 22.8059 29.6924 22.7372C29.1764 21.8436 28.6605 20.9499 28.1289 20.0292C28.1866 19.9959 28.2444 19.9625 28.3039 19.9282C29.3095 21.47 29.3095 21.47 30.3355 23.0429C30.1045 23.1763 29.8735 23.3096 29.6356 23.447Z" fill="#959595"/>
      <path d="M13.6056 11.0379C13.5412 10.9261 13.4767 10.8144 13.4102 10.6994C15.1509 9.91181 15.1509 9.91182 16.0554 9.62354C16.0876 9.67939 16.1199 9.73523 16.1531 9.79278C15.7802 10.0141 15.4067 10.2342 15.0328 10.4537C14.8248 10.5764 14.6168 10.6991 14.4026 10.8255C13.8783 11.1061 13.8783 11.1061 13.6056 11.0379Z" fill="#3A3A3A"/>
      <path d="M10.6466 11.1666C10.5821 11.0549 10.5176 10.9432 10.4512 10.8281C11.0541 10.4055 11.657 9.98299 12.2782 9.54761C12.375 9.71517 12.4717 9.88273 12.5714 10.0553C11.9362 10.4221 11.301 10.7888 10.6466 11.1666Z" fill="#7A7A7A"/>
      <path d="M30.3307 38.391C30.2662 38.2793 30.2017 38.1676 30.1353 38.0525C30.3085 37.9525 30.4817 37.8525 30.6602 37.7494C30.5635 37.5819 30.4667 37.4143 30.3671 37.2417C30.5725 37.1975 30.778 37.1534 30.9897 37.1079C31.0932 37.4205 31.1967 37.7331 31.3033 38.0551C30.9824 38.166 30.6614 38.2768 30.3307 38.391Z" fill="#6A6C6B"/>
      <path d="M31.2468 38.7649C31.2196 38.1789 31.1923 37.5929 31.165 37.0068C31.4552 37.5095 31.7454 38.0122 32.0445 38.5301C31.5195 38.8332 31.5195 38.8332 31.2468 38.7649Z" fill="#E1E2E2"/>
      <path d="M28.9469 37.61C28.8401 37.2249 28.8401 37.2249 28.731 36.832C28.9943 36.7545 29.2575 36.677 29.5287 36.5972C29.5999 36.8539 29.6712 37.1107 29.7446 37.3752C29.4813 37.4527 29.2181 37.5302 28.9469 37.61Z" fill="#C5C5C5"/>
      <path d="M27.7063 39.9062C27.6096 39.7386 27.5128 39.5711 27.4131 39.3984C27.7274 39.1426 28.0416 38.8867 28.3653 38.623C28.4688 38.9356 28.5723 39.2482 28.6789 39.5703C28.3579 39.6812 28.037 39.792 27.7063 39.9062Z" fill="#676969"/>
      <path d="M28.0199 40.8536C27.8264 40.5184 27.6329 40.1833 27.4336 39.8381C27.9057 39.8476 27.9057 39.8476 28.4266 39.9417C28.5556 40.1651 28.6846 40.3885 28.8175 40.6187C28.5543 40.6962 28.2911 40.7737 28.0199 40.8536Z" fill="#E1E2E2"/>
      <path d="M23.577 12.9535C23.4157 12.6742 23.2545 12.3949 23.0884 12.1072C23.3194 11.9739 23.5503 11.8405 23.7883 11.7031C23.9495 11.9824 24.1108 12.2616 24.2769 12.5494C24.0459 12.6827 23.8149 12.8161 23.577 12.9535Z" fill="#5F5F5F"/>
      <path d="M9.40362 21.1366C9.24239 20.8573 9.08116 20.578 8.91504 20.2903C9.14601 20.157 9.37698 20.0236 9.61496 19.8862C9.77619 20.1655 9.93742 20.4448 10.1035 20.7325C9.87257 20.8658 9.64159 20.9992 9.40362 21.1366Z" fill="#5E5E5E"/>
      <path d="M39.8706 73.5031C39.9794 73.2914 40.0881 73.0797 40.2001 72.8615C40.7719 72.8417 40.7719 72.8417 41.3682 72.8641C41.4327 72.9758 41.4972 73.0876 41.5636 73.2026C40.4842 73.6566 40.4842 73.6566 39.8706 73.5031Z" fill="#BEBEBE"/>
      <path d="M18.9274 5.7085C19.0106 5.58597 19.0939 5.46344 19.1796 5.3372C18.9862 5.00208 18.7927 4.66697 18.5933 4.32169C18.7343 4.16583 18.8753 4.00996 19.0206 3.84937C19.2826 4.70339 19.2826 4.70339 19.55 5.57467C19.3446 5.61883 19.1391 5.663 18.9274 5.7085Z" fill="#C9C9C9"/>
      <path d="M47.9087 55.0969C48.2042 55.0753 48.4997 55.0535 48.8041 55.0312C48.9331 55.2546 49.0621 55.478 49.1949 55.7082C49.0217 55.8082 48.8485 55.9082 48.67 56.0113C48.2019 55.6046 48.2019 55.6047 47.9087 55.0969Z" fill="#7E7E7E"/>
      <path d="M40.2979 73.0306C40.2334 72.9189 40.1689 72.8072 40.1025 72.6921C40.3912 72.5254 40.6799 72.3588 40.9774 72.187C41.1064 72.4104 41.2354 72.6338 41.3683 72.864C40.6047 73.1074 40.6047 73.1074 40.2979 73.0306Z" fill="#E4E4E4"/>
    </g>
  </svg>
  );




const renderBusMarkers = () => {
  // If no drop points selected, show all active buses
  if (storedDropPoints.length === 0) {
    return filterDrivers.map((bus) => (
      <Marker
        key={bus.busID}
        longitude={bus.coords.longitude}
        latitude={bus.coords.latitude}
      >
        <BusIcon />
      </Marker>
    ));
  }
  
  
  if (selectedBus.length > 0) {

    const closestBusID = closest?.driver?.busID;

    return selectedBus.map((bus) => (
      <Marker
        key={bus.busID}
        longitude={bus.coords.longitude}
        latitude={bus.coords.latitude}
      >
          <div style={{ cursor: 'pointer' }}>
          {bus.busID === closestBusID ? (
              <ClosestBusIcon />
            ) : (
              <BusIcon />
            )}
          </div>
      </Marker>
    ));
  }
  return null;
};





  return (
    <Map
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
       {...viewState}
      style={{ width: '100vw', height: '100vh', position: 'absolute' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      {...transitionOptions}
      onMove={handleViewStateChange}
    >
  
      {isHomepage && selectedLocation && (
        <Marker longitude={selectedLocation.longitude} latitude={selectedLocation.latitude}>
          <MarkerIcon color="#34A853" />
        </Marker>
      )}

      {!isHomepage && (
        <>
         
          {selectedLocation && (
            <Marker longitude={selectedLocation.longitude} latitude={selectedLocation.latitude}>
              <MarkerIcon color="#3F51B5" />
            </Marker>
          )}

          {/* Marker for the pick-up point */}
          {pickUpLocation && (
            <Marker longitude={pickUpLocation.longitude} latitude={pickUpLocation.latitude}>
              <MarkerIcon color="#34A853" />
            </Marker>
          )}

          {/* Marker for the drop-off point */}
          {dropOffLocation && (
            <Marker longitude={dropOffLocation.longitude} latitude={dropOffLocation.latitude}>
              <MarkerIcon color="#FFCE31" />
            </Marker>
          )}

          {/* Render drop points (excluding Paa Joe Round About) */}
          {dropPoints
            .filter((point) => point.name !== 'Paa Joe Round About')
            .map((dropPoint, index) => (
              <Marker key={index} longitude={dropPoint.longitude} latitude={dropPoint.latitude}>
                <MarkerIcon color="#3F51B5" />
              </Marker>
            ))}

          {/* Render the shortest route passing through all drop points */}
          {route && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: route.geometry,
              }}
            >
              <Layer
                id="route-layer"
                type="line"
                paint={{
                  'line-color': '#3F51B5',
                  'line-width': 5,
                  'line-opacity': 0.75,
                }}
              />
            </Source>
          )}
        </>
      )}

      {renderBusMarkers()}
      {/* {renderHighlightedDropPoint()} */}
    
      <GeolocateControl
        ref={geolocateControlRef}
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showAccuracyCircle={true}
        showUserLocation={true}
        style={{ display: 'none' }} 
      />



      <button
        onClick={() => geolocateControlRef.current?.trigger()} // Trigger geolocation
        style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '50%',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px', // Adjust size to fit the icon
          height: '48px', // Adjust size to fit the icon
        }}
      >
        <LocationIcon />
      </button>

    </Map>
  );
}

export default MapGL;



