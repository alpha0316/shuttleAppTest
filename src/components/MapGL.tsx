import { useState, useEffect, useRef, } from 'react';
import Map, { Marker, Source, Layer, GeolocateControl, ViewState as MapViewState, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { solveTSP } from './../components/solveTSP';
import { haversineDistance } from './../../utils/distance'
import { useClosestStop, BusStop } from './../Screens/ClosestStopContext';
import { useClosestBus } from '../Screens/useClosestBus'
import { useShuttleSocket } from './../../hooks/useShuttleSocket'
// import { io, Socket } from 'socket.io-client';
import useMediaQuery from '../components/useMediaQuery';
// import { ViewportProps } from 'react-map-gl';
import { locationsss } from '../../data/locations';
import useMQTTBuses from '../../hooks/useMQTTBuses';
import { AnimatedMQTTBus } from '../components/AnimatedMQTTBus';

import mqtt, { Packet } from 'mqtt';






const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoidGhlbG9jYWxnb2RkIiwiYSI6ImNtMm9ocHFhYTBmczQya3NnczhoampiZ3gifQ.lPNutwk6XRi_kH_1R1ebiw';


interface Coordinates {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: number;
  heading?: number;
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


export interface Driver {
  busID: string;
  active: boolean;
  busRoute: Route[];
  coords: Coordinates
}


interface DropPoint {
  name: string;
}

// Add these interfaces with your existing interfaces at the top
interface PositionHistory {
  latitude: number;
  longitude: number;
  timestamp: string;
}


// Your existing interfaces...
interface Coordinates {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: number;
  heading?: number;
}

interface DropPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface UserData {
  firstName: any;
  user: {
    firstName?: string;
    // add other user properties as needed
  };
}

interface PartialGpsData {
  position?: {
    latitude: number;
    longitude: number;
    course?: number;
    valid?: boolean;
    [key: string]: any;
  };
}


// ... rest of your interfaces


function MapGL({
  selectedLocation,
  dropOffLocation,
  isHomepage = false,
  pickUpLocation,
  dropPoints = [],
}: MapGLProps) {

  const isMobile = useMediaQuery('(max-width: 768px)');

  const shuttles = useShuttleSocket();






  const { closest, setClosest, closestBuses, setClosestBuses } = useClosestBus();

  const DEFAULT_LONGITUDE = -1.573568;
  const DEFAULT_LATITUDE = 6.678045;
  const DEFAULT_ZOOM = 14.95;
  const TRANSITION_DURATION = 500;
  const SELECTEDBUS_ZOOM = 16.95;

  const [viewState, setViewState] = useState<MapViewState>({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
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
  const [, setArriveInTwo] = useState(false)
  const [, setArrived] = useState(false)
  const [busRoute, setBusRoute] = useState([])
  const [locations, SetLocations] = useState([])
  const [, SetShuttle] = useState([])
  const [, SetHeatMap] = useState([])
  const [userInitial, setUserInitial] = useState<string | null>(null)


  const [latestCoord] = useState<{ lat: number; lng: number; heading?: number; speed?: number; ignition?: any; timestamp?: number } | null>(null);







  ///user initials 

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString) as UserData;
        // console.log('User First Initial:', userData?.firstName?.charAt(0));
        setUserInitial(userData.firstName?.charAt(0) || null);
        // console.log('ess',userInitial )
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserInitial(null);
      }
    } else {
      setUserInitial(null);
    }
  }, []);

  ////heat map
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/api/locations/heatmap`);
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }
        const data = await response.json();
        SetHeatMap(data.locations || []);
        console.log('Fetched heatmapppp:', data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    }
    fetchLocations()
  }, []);

  ///shuttles
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/api/locations/shuttles`);
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }
        const data = await response.json();
        SetShuttle(data.locations || []);
        console.log('Fetched Shuttless:', data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    }
    fetchLocations()
  }, []);


  /////locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/api/locations/locations`);
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }
        const data = await response.json();
        SetLocations(data.locations || []);
        // console.log('Fetched Locationssss:', data.locations);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    }
    fetchLocations()
  }, []);


  // Add CSS for pulsing animation
  const pulseAnimation = `
@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(0.8); opacity: 1; }
}
`;

  // Inject the CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = pulseAnimation;
    document.head.append(style);
    return () => style.remove();
  }, []);


  /// flyto()
  const mapRef = useRef<MapRef | null>(null);
  const flyTo = (longitude: number, latitude: number, zoom: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom,
        speed: 1.2,
        curve: 1.5,
        easing: (t) => t,
      });
    }
  };

  useEffect(() => {
    if (selectedBus.length > 0 && closest?.driver) {
      const bus = closest.driver;
      flyTo(bus.coords.longitude, bus.coords.latitude, SELECTEDBUS_ZOOM);
    }
  }, [closest?.driver, selectedBus]);




  //// here is where I join the bus routes from the drivers/drivers to websocket data
  useEffect(() => {
    if (Array.isArray(shuttles) && shuttles.length > 0) {
      const mappedDrivers: Driver[] = shuttles
        .map((shuttle: any) => {
          const innerLocation = shuttle.location?.location || {};

          type BusRouteItem = { busID: string; busRoute: any[] };

          /// compared the IDs of the API to the Websocket
          const matchedRoute = Array.isArray(busRoute)
            ? (busRoute as BusRouteItem[]).find((route) => {
              const shuttleId = shuttle.driverId || shuttle.shuttleId || shuttle.id;
              if (!route.busID || !shuttleId) return false;

              return route.busID.replace(/\D/g, '') === shuttleId.replace(/\D/g, '');
            })
            : undefined;

          let stops: any[] = [];
          if (matchedRoute &&
            Array.isArray(matchedRoute.busRoute) &&
            matchedRoute.busRoute.length > 0 &&
            Array.isArray(matchedRoute.busRoute[0].stops)) {
            stops = matchedRoute.busRoute[0].stops;
          }

          return {
            busID: shuttle.driverId || shuttle.shuttleId || shuttle.id || '',
            active: shuttle.isActive ?? true,
            busRoute: stops,
            coords: {
              latitude: innerLocation.latitude ?? 0,
              longitude: innerLocation.longitude ?? 0,
              speed: innerLocation.speed ?? 0,
              heading: innerLocation.heading ?? 0,
              timestamp: innerLocation.timestamp
                ? new Date(innerLocation.timestamp).getTime()
                : Date.now(),
            },
          };
        })
        .filter((driver) => {
          return driver.coords.latitude !== 0 || driver.coords.longitude !== 0;
        })
        .reduce((unique: Driver[], driver) => {
          const numericId = driver.busID.replace(/\D/g, '');
          const existing = unique.find(d => d.busID.replace(/\D/g, '') === numericId);

          if (!existing) {
            unique.push(driver);
          } else if (
            typeof driver.coords.timestamp === 'number' &&
            typeof existing.coords.timestamp === 'number' &&
            driver.coords.timestamp > existing.coords.timestamp
          ) {
            const index = unique.findIndex(d => d.busID.replace(/\D/g, '') === numericId);
            unique[index] = driver;
          }

          return unique;
        }, []);

      setDrivers(mappedDrivers);
      console.log('Mapped Drivers with Routes:', mappedDrivers);

    }
  }, [shuttles, busRoute]);


  const [closestDropPoint, setClosestDropPoint] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const BASE_CUSTOMER_URL = "https://shuttle-backend-0.onrender.com"





  //// here is where I fetched the drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/api/drivers/drivers`);

        if (!response.ok) {
          throw new Error("Failed to fetch drivers");
        }

        const data = await response.json();
        console.log('data', data.drivers)
        setDrivers(data.drivers || [])
        // Store an array of { busID, busRoute } for each driver
        if (Array.isArray(data.drivers)) {
          const busRoutes = data.drivers.map((driver: any) => ({
            busID: driver.busID,
            busRoute: driver.busRoute,
          }));
          setBusRoute(busRoutes);
          console.log('data', data)
          // console.log('selected Routes', busRoute)
        }


      } catch (err) {
        console.error("Error fetching drivers:", err);
      }
    };

    fetchDrivers();
  }, []);


  ////stored user dropPoints based on start and stop bus stops
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

  }, [dropPoints]);


  //// button to set current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        // console.log("📍 My Location:", coords);
        setUserCoords(coords);
      },
      (err) => {
        console.log("❌ Error getting location:", err);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // console.log('prince', locationsss)



  function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function getNearestStop(userCoords: { latitude: any; longitude: any; }, locations: { dropPoints: any[]; id: any; }[], radius = 1000) {
    if (!userCoords) return null;

    let nearest = null;

    locations.forEach((loc: { dropPoints: any[]; id: any; }) => {
      if (!Array.isArray(loc.dropPoints)) return;

      loc.dropPoints.forEach((stop) => {
        const distance = getDistanceMeters(
          userCoords.latitude,
          userCoords.longitude,
          stop.latitude,
          stop.longitude
        );

        if (distance <= radius) {
          nearest = {
            isNear: true,
            stopId: stop.id,
            stopName: stop.name,
            distance,
            parentLocationId: loc.id,
          };
        }
      });
    });

    return nearest || { isNear: false };
  }

  // 🔄 run logic whenever userCoords changes
  useEffect(() => {
    if (userCoords) {
      const stopInfo = getNearestStop(userCoords, locationsss, 100);

      console.log("🛑 Nearest Bus Stop Info:", stopInfo);
    } else {
      console.log("User coordinates not available yet.");
    }
  }, [userCoords]);



  useEffect(() => {
    console.log('my location', userCoords)
  }, [locations]);



  /// here is the logic for filter out inactive buses
  useEffect(() => {
    if (drivers.length > 0) {
      const active = drivers.filter((bus) => bus.active === true);
      setFilterDrivers(active);
      // console.log('Drivers:', active);
      // console.log('Active Drivers:', drivers);
    } else {
      setFilterDrivers([]);
    }
  }, [drivers]);


  /// here I get the closest bus of the selected point
  const getClosestBuses = (
    startPoint: { name: string; coordinates: Coordinates },
    end: Coordinates,
    drivers: Driver[],
    limit: number = 3,
  ): { driver: Driver; distance: number; isStartInRoute: boolean }[] => {
    if (!startPoint || !end) return [];

    return drivers
      .map(driver => {
        const coords = {
          latitude: driver.coords.latitude,
          longitude: driver.coords.longitude,
          speed: driver.coords.speed ?? 0,
          heading: driver.coords.heading ?? 0,
          timestamp: driver.coords.timestamp ?? Date.now(),
        };

        let isStartInRoute = false;
        if (Array.isArray(driver.busRoute)) {
          if (typeof driver.busRoute[0] === 'string') {
            // busRoute is string[]
            isStartInRoute = (driver.busRoute as unknown as string[]).includes(startPoint.name);
          } else {
            // busRoute is array of route objects
            isStartInRoute = driver.busRoute.some((route: any) =>
              Array.isArray(route.stops) && route.stops.includes(startPoint.name)
            );
          }
        }

        return {
          driver: {
            ...driver,
            coords,
          },
          distance: haversineDistance(startPoint.coordinates, coords, 'km'),
          isStartInRoute,
        };
      })
      .filter(item =>
        item.distance !== null &&
        !isNaN(item.distance) &&
        item.driver?.coords?.timestamp !== undefined &&
        item.isStartInRoute
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  };

  const { setClosestStopName, setClosestStop } = useClosestStop();

  useEffect(() => {
    if (startPoint && filterDrivers.length > 0) {
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




      if (closest?.driver?.coords?.latitude === startPoint?.latitude &&
        closest?.driver?.coords?.longitude === startPoint?.longitude) {
        console.log('close', newClosestBuses)
        setArrived(true)

      }

      else if (newClosestBuses.length > 0 && newClosestBuses[0].distance <= 0.1) {
        //  console.log(arriveInTwo)
        setArriveInTwo(true)
        // alert (`A bus is now within 500 meters of your location!`)
      }

      else {
        console.log(false)
        setArrived(false)
        setArriveInTwo(false)
      }
    }

    else {
      setClosestBuses([]);
    }
  }, [startPoint, filterDrivers, setClosestBuses]);


  useEffect(() => {
    if (closestBuses.length > 0) {
      setClosest(closestBuses[0]);
    } else if (startPoint && filterDrivers.length > 0) {
      setClosest(null);
    }
  }, [closestBuses, startPoint, filterDrivers, setClosest]);

  const [isManuallyAdjusted, setIsManuallyAdjusted] = useState(false);


  /// map logic
  useEffect(() => {
    if (isManuallyAdjusted) return; // Don't override manual adjustments

    if (closest?.driver?.coords) {
      setViewState(prevState => ({
        ...prevState,
        longitude: closest.driver.coords.longitude,
        latitude: isMobile ? closest.driver.coords.latitude - 0.00065 : closest.driver.coords.latitude,
        zoom: SELECTEDBUS_ZOOM,
      }));
      setTransitionOptions({ transitionDuration: TRANSITION_DURATION });
      return;
    }

    const centerLocation = isHomepage ? selectedLocation : pickUpLocation;
    if (centerLocation) {
      setViewState(prevState => ({
        ...prevState,
        longitude: centerLocation.longitude,
        latitude: centerLocation.latitude,
        zoom: DEFAULT_ZOOM,
      }));
      setTransitionOptions({ transitionDuration: TRANSITION_DURATION });
      return;
    }

    // Priority 3: Default to DEFAULT_LONGITUDE and DEFAULT_LATITUDE
    setViewState(prevState => ({
      ...prevState,
      longitude: DEFAULT_LONGITUDE,
      latitude: DEFAULT_LATITUDE,
      zoom: DEFAULT_ZOOM,
    }));
    setTransitionOptions({ transitionDuration: TRANSITION_DURATION });
  }, [
    closest?.driver?.coords?.longitude,
    closest?.driver?.coords?.latitude,
    selectedLocation,
    pickUpLocation,
    isHomepage,
    isManuallyAdjusted]);

  const handleViewStateChange = (evt: { viewState: MapViewState }) => {
    const { longitude, latitude, zoom } = evt.viewState;
    setViewState((prevState: MapViewState) => ({
      ...prevState,
      longitude,
      latitude,
      zoom: zoom || prevState.zoom,
    }));
    setIsManuallyAdjusted(true);
  };





  useEffect(() => {
    // check for dropPoints
    if (storedDropPoints.length === 0 || filterDrivers.length === 0) {
      setSelectedBus([]);
      return;
    }


    const matchingDrivers: Driver[] = filterDrivers.filter((driver) => {
      if (!Array.isArray(driver.busRoute)) return false;


      let allStopNames: string[] = [];
      if (typeof driver.busRoute[0] === 'string') {

        allStopNames = driver.busRoute as unknown as string[];
      } else {
        /// here is where I check if the stop between the selected and the driver
        allStopNames = driver.busRoute.flatMap((route: any) =>
          Array.isArray(route.stops) ? route.stops : []
        );
      }

      // If no stops, skip this driver
      if (!allStopNames.length) return false;

      // At least one drop point matches a stop
      return storedDropPoints.some((point) => allStopNames.includes(point.name));
    });

    // Only update if the result is different to avoid flicker
    setSelectedBus((prev) => {
      const prevIds = prev.map(d => d.busID).sort().join(',');
      const newIds = matchingDrivers.map(d => d.busID).sort().join(',');
      if (prevIds === newIds) return prev;
      return matchingDrivers;
    });


  }, [storedDropPoints, filterDrivers]);

  useEffect(() => {

    setSelectedBus((prevSelected) => {
      const updated = prevSelected.map((bus) => {
        const live = filterDrivers.find((d) => d.busID === bus.busID);
        return live ? { ...bus, coords: live.coords } : bus;
      });
      return updated;
    });
  }, [filterDrivers]);




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
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="78" viewBox="0 0 25 78" fill="none">
      {/* <mask id="mask0_1309_2129" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="78">
    <path d="M0 1.0599e-06L3.39144e-06 77.587H24.2459V0L0 1.0599e-06Z" fill="white"/>
  </mask> */}
      <g mask="url(#mask0_1309_2129)">
        <path d="M4.64719 24.0381C4.78059 24.1026 4.91389 24.1671 5.05129 24.2335C5.11799 31.7147 5.18469 39.1959 5.25329 46.9038C9.72069 46.9038 14.188 46.9038 18.7907 46.9038C19.021 46.4583 19.0225 46.1987 19.031 45.7033C19.0344 45.5364 19.0377 45.3694 19.0412 45.1974C19.044 45.0168 19.0467 44.8362 19.0495 44.6502C19.0533 44.4651 19.057 44.2801 19.0608 44.0894C19.0727 43.4967 19.0834 42.9039 19.0937 42.3111C19.1074 41.5314 19.1223 40.7517 19.1379 39.972C19.1407 39.7914 19.1434 39.6109 19.1462 39.4248C19.1496 39.2579 19.153 39.0909 19.1565 38.9189C19.159 38.7716 19.1615 38.6244 19.1642 38.4727C19.1948 38.1093 19.1948 38.1093 19.3968 37.7184C19.5302 37.7184 19.6635 37.7184 19.8009 37.7184C19.8009 49.3272 19.8009 60.9359 19.8009 72.8964C19.5342 72.9609 19.2675 73.0253 18.9927 73.0918C18.9927 72.8338 18.9927 72.5759 18.9927 72.3101C14.8588 72.3101 10.7248 72.3101 6.46559 72.3101C6.46559 70.4398 6.46559 68.5695 6.46559 66.6425C5.86559 66.6425 5.26549 66.6425 4.64719 66.6425C4.61609 61.1742 4.58619 55.7058 4.55769 50.2375C4.54439 47.6985 4.53079 45.1596 4.51619 42.6207C4.50359 40.4084 4.49159 38.1961 4.48049 35.9838C4.47459 34.8119 4.46829 33.6399 4.46119 32.468C4.45449 31.3658 4.44879 30.2637 4.44379 29.1615C4.44179 28.7561 4.43939 28.3508 4.43669 27.9455C4.43299 27.3937 4.43059 26.8419 4.42849 26.2901C4.42719 26.1283 4.42579 25.9665 4.42439 25.7998C4.42309 25.1605 4.43659 24.6491 4.64719 24.0381Z" fill="#34A853" />
        <path d="M4.55752 10.5646C3.33372 7.1332 14.1878 7.23091 18.7905 7.23091C19.0208 6.78541 19.1554 8.31259 19.1639 7.81719C19.1673 7.65029 19.3966 8.1104 19.041 5.5245C19.3926 8.0812 19.5804 8.37949 19.1224 5.43919C19.0983 5.28519 19.074 5.13099 19.0493 4.97729C19.0753 5.13939 19.0996 5.29329 19.1224 5.43919C19.2524 6.27239 19.3727 7.10069 19.4738 7.81719C19.474 7.80679 19.4761 7.82219 19.4797 7.85899C19.5433 8.30989 19.5992 8.71509 19.6449 9.04759C19.6405 8.85969 19.6359 8.67801 19.6313 8.51331C19.6275 8.47751 19.6236 8.4409 19.6196 8.4035C19.6128 8.3405 19.6059 8.2754 19.5987 8.2081C19.6106 7.6153 19.5883 8.40999 19.5987 7.81719C19.6012 7.67439 19.6098 7.8361 19.6203 8.1492C19.6258 7.2279 19.6629 7.3471 19.7021 7.5241C19.7499 7.74 19.8007 8.04179 19.8007 6.64459V10.0459C19.8166 10.617 19.8145 10.882 19.8007 10.9382V33.2235L18.9925 33.419V32.6372H6.46543L6.46542 26.9697H4.64703C4.61593 21.5013 4.14192 16.2209 4.55752 10.5646Z" fill="#34A853" />
        <path d="M19.1224 5.43919C19.0996 5.29329 19.0753 5.13939 19.0493 4.97729C19.074 5.13099 19.0983 5.28519 19.1224 5.43919Z" fill="#34A853" />
        <path d="M5.83428 45.7565C5.83458 45.5147 5.83458 45.5147 5.83478 45.2679C5.83458 45.0835 5.83428 44.899 5.83398 44.709C5.83468 44.505 5.83538 44.3011 5.83618 44.0909C5.83618 43.8774 5.83608 43.6639 5.83608 43.4439C5.83618 42.7343 5.83778 42.0248 5.83938 41.3152C5.83978 40.8247 5.84008 40.3343 5.84028 39.8438C5.84098 38.6824 5.84258 37.521 5.84458 36.3596C5.84748 34.6763 5.84848 32.9931 5.84978 31.3098C5.85178 28.9512 5.85558 26.5925 5.85908 24.2339C10.0597 24.2339 14.2604 24.2339 18.5883 24.2339C18.5883 31.5216 18.5883 38.8093 18.5883 46.3178C16.5255 46.3219 14.4627 46.3259 12.3373 46.3301C11.6852 46.3318 11.033 46.3336 10.3611 46.3354C9.84778 46.336 9.33448 46.3365 8.82118 46.3369C8.68698 46.3374 8.55278 46.3379 8.41448 46.3385C8.02098 46.3399 7.62758 46.34 7.23408 46.34C7.01198 46.3405 6.78988 46.3409 6.56108 46.3413C5.87178 46.3089 5.87178 46.3089 5.83428 45.7565Z" fill="#34A853" />
        <path d="M3.03072 2.34523C3.36742 2.33683 3.70432 2.33733 4.04102 2.34523C4.39252 2.68523 4.31822 3.16483 4.35672 3.62773C4.38212 3.92443 4.38212 3.92444 4.40802 4.22704C4.42022 4.37994 4.43252 4.53284 4.44512 4.69044C4.60842 4.66224 4.77172 4.63404 4.93992 4.60494C5.15592 4.56864 5.37182 4.53233 5.59422 4.49503C5.80752 4.45873 6.02092 4.42243 6.24062 4.38503C6.79882 4.30923 7.31772 4.28343 7.87992 4.29953C7.94662 4.10603 8.01332 3.91264 8.08202 3.71324C9.15292 3.49524 10.2239 3.45023 11.3148 3.51783C11.3814 3.58233 11.4481 3.64683 11.5168 3.71323C12.224 3.74583 12.224 3.74583 12.9312 3.71323C12.9978 3.64873 13.0645 3.58423 13.1332 3.51783C14.3367 3.43253 15.4452 3.43904 16.568 3.90874C16.568 4.03774 16.568 4.16663 16.568 4.29953C16.7722 4.29153 16.9764 4.28343 17.1868 4.27513C18.0189 4.30073 18.6124 4.44274 19.3967 4.69044C19.4634 4.36794 19.5301 4.04553 19.5988 3.71323C19.7321 3.71323 19.8655 3.71323 20.0029 3.71323C19.9987 3.52383 19.9946 3.33434 19.9903 3.13914C20.0029 2.54064 20.0029 2.54063 20.2049 2.34523C20.609 2.33723 21.0132 2.33693 21.4172 2.34523C21.389 3.22473 21.3591 4.10414 21.3288 4.98354C21.3209 5.23144 21.3129 5.47933 21.3048 5.73473C21.2963 5.97663 21.2878 6.21844 21.2791 6.46764C21.2717 6.68874 21.2643 6.90974 21.2567 7.13754C21.2152 7.81734 21.2152 7.81733 21.1131 8.48003C20.9613 9.63883 20.9856 10.8 20.988 11.9662C20.9878 12.2281 20.9875 12.4899 20.9871 12.7517C20.9865 13.319 20.9865 13.8863 20.987 14.4536C20.9878 15.3767 20.9873 16.2998 20.9865 17.2229C20.9857 18.3895 20.9853 19.556 20.9852 20.7226C20.9852 23.0137 20.9827 25.3047 20.9793 27.5958C20.9787 27.9567 20.9782 28.3176 20.9777 28.6785C20.9769 29.2254 20.9761 29.7722 20.9753 30.3191C20.9723 32.3789 20.9695 34.4387 20.9671 36.4985C20.9668 36.6868 20.9666 36.875 20.9664 37.0689C20.9628 40.1227 20.9622 43.1765 20.9626 46.2303C20.9628 49.3661 20.9593 52.5019 20.9523 55.6376C20.9481 57.5718 20.947 59.5059 20.9499 61.4401C20.9516 62.7644 20.9497 64.0887 20.9448 65.4131C20.9421 66.1776 20.9411 66.9419 20.9444 67.7064C20.9475 68.4059 20.9459 69.1053 20.9406 69.8049C20.9389 70.1783 20.9423 70.5517 20.9458 70.9251C20.9247 72.7325 20.9247 72.7325 20.3411 73.3391C19.6289 73.7864 19.1581 73.8011 18.3111 73.8017C18.0916 73.8038 18.0916 73.8038 17.8677 73.806C17.3859 73.8093 16.9046 73.8055 16.4228 73.8013C16.0869 73.8015 15.7511 73.802 15.4152 73.8027C14.712 73.8033 14.0089 73.8004 13.3058 73.7951C12.4055 73.7884 11.5054 73.7896 10.6052 73.7932C9.91182 73.7953 9.21852 73.7936 8.52512 73.7906C8.19322 73.7896 7.86142 73.7897 7.52952 73.7909C7.06512 73.792 6.60112 73.788 6.13682 73.7827C5.87292 73.7814 5.60902 73.7802 5.33712 73.779C4.46622 73.652 4.20802 73.5536 3.63692 72.8967C3.47912 72.0668 3.50122 71.2409 3.50912 70.3992C3.50802 70.1374 3.50642 69.8756 3.50442 69.6138C3.50022 68.8936 3.50242 68.1735 3.50552 67.4533C3.50782 66.6769 3.50432 65.9005 3.50142 65.1241C3.49732 63.7784 3.49682 62.4327 3.49882 61.087C3.50172 59.1401 3.49882 57.1932 3.49452 55.2463C3.48762 52.0859 3.48512 48.9256 3.48542 45.7653C3.48582 42.6979 3.48462 39.6306 3.48092 36.5633C3.48062 36.28 3.48062 36.28 3.48022 35.991C3.47772 33.9294 3.47492 31.8678 3.47192 29.8062C3.47112 29.2593 3.47032 28.7125 3.46952 28.1656C3.46902 27.8052 3.46842 27.4447 3.46792 27.0842C3.46452 24.79 3.46282 22.4958 3.46272 20.2016C3.46272 19.044 3.46202 17.8864 3.46102 16.7288C3.46042 15.8132 3.46052 14.8977 3.46132 13.9822C3.46162 13.4267 3.46112 12.8711 3.46032 12.3156C3.46002 11.9407 3.46072 11.5659 3.46152 11.191C3.46102 10.9679 3.46052 10.7448 3.46002 10.5149C3.46002 10.3229 3.46002 10.1308 3.46012 9.93284C3.43322 9.34494 3.33932 8.78714 3.23282 8.20824C3.22912 7.92324 3.23322 7.63803 3.24542 7.35323C3.26222 6.28843 3.11782 5.25904 2.95462 4.20844C2.85622 3.53844 2.78672 2.98903 3.03072 2.34523ZM4.45512 27.1649C4.47772 32.9175 4.50542 38.6701 4.53512 44.4227C4.54762 46.8542 4.55972 49.2857 4.57172 51.7172C4.59642 56.6924 4.62162 61.6676 4.64712 66.6428C5.24722 66.6428 5.84732 66.6428 6.46562 66.6428C6.46562 68.5131 6.46562 70.3834 6.46562 72.3104C10.5995 72.3104 14.7334 72.3104 18.9926 72.3104C18.9926 72.6328 18.9926 72.9553 18.9926 73.2875C19.326 73.223 19.6594 73.1586 20.0029 73.0921C20.0029 52.1319 20.0029 31.1717 20.0029 9.57623C19.8695 9.57623 19.7362 9.57623 19.5988 9.57623C19.5798 9.45583 19.5608 9.33543 19.5412 9.21133C19.4354 8.78113 19.4354 8.78114 19.0945 8.56094C17.0079 7.59444 14.8923 7.54974 12.6155 7.56084C12.4726 7.56114 12.3298 7.56133 12.1826 7.56153C8.32582 7.46893 8.32582 7.46893 4.84922 8.79453C4.42422 9.43303 4.39542 9.94753 4.39762 10.6981C4.39722 11.0451 4.39722 11.0451 4.39672 11.399C4.39942 11.782 4.39942 11.782 4.40212 12.1728C4.40252 12.4483 4.40282 12.7237 4.40292 12.9991C4.40382 13.7627 4.40732 14.5263 4.41132 15.2899C4.41512 16.1204 4.41662 16.9509 4.41852 17.7813C4.42322 19.6546 4.43112 21.5278 4.43962 23.401C4.44532 24.6556 4.45032 25.9102 4.45512 27.1649Z" fill="#C4C4C3" />
        <path d="M8.89014 43.3862C8.89014 38.0977 8.89014 32.8093 8.89014 27.3606C11.0904 27.3606 13.2907 27.3606 15.5577 27.3606C15.5577 32.6491 15.5577 37.9375 15.5577 43.3862C13.3574 43.3862 11.1571 43.3862 8.89014 43.3862Z" fill="#34A853" />
        <path d="M4.21726 6.33936C4.21656 6.20296 4.21576 6.06656 4.21496 5.92596C4.21696 4.91056 4.21696 4.91056 4.44466 4.69036C4.83006 4.61206 5.21776 4.54466 5.60636 4.48276C5.81786 4.44826 6.02936 4.41376 6.24726 4.37816C6.80126 4.30816 7.32186 4.28456 7.87946 4.29956C7.94616 4.10606 8.01276 3.91256 8.08146 3.71326C9.15236 3.49516 10.2235 3.45026 11.3143 3.51776C11.381 3.58226 11.4477 3.64676 11.5164 3.71326C12.2236 3.74586 12.2236 3.74586 12.9307 3.71326C13.0307 3.61646 13.0307 3.61646 13.1328 3.51776C14.3363 3.43256 15.4448 3.43906 16.5676 3.90866C16.5676 4.03766 16.5676 4.16666 16.5676 4.29956C16.7718 4.29146 16.976 4.28346 17.1864 4.27506C18.0185 4.30066 18.612 4.44266 19.3963 4.69036C19.463 4.43246 19.5297 4.17446 19.5984 3.90866C19.7317 3.90866 19.8651 3.90866 20.0025 3.90866C20.1984 4.70606 20.2379 5.45966 20.2424 6.27826C20.2467 6.63576 20.2467 6.63576 20.2511 7.00046C20.2045 7.62186 20.2045 7.62186 19.8004 8.20816C19.6363 8.14826 19.4722 8.08826 19.3032 8.02656C14.9578 6.75536 8.74686 6.82106 4.44466 8.20816C4.13646 7.61216 4.21356 6.99236 4.21726 6.33936Z" fill="#282828" />
        <path d="M5.25313 46.9041C5.24843 43.8497 5.24493 40.7953 5.24273 37.741C5.24163 36.3229 5.24023 34.9047 5.23793 33.4866C5.23593 32.251 5.23463 31.0155 5.23413 29.7799C5.23393 29.1252 5.23323 28.4706 5.23183 27.816C5.23033 27.0864 5.23013 26.3568 5.23023 25.6271C5.22953 25.4085 5.22873 25.1899 5.22803 24.9647C5.22833 24.7671 5.22863 24.5695 5.22883 24.366C5.22863 24.1068 5.22863 24.1068 5.22833 23.8424C5.25313 23.4521 5.25313 23.4521 5.45523 23.2567C5.87673 23.2383 6.29893 23.2337 6.72083 23.2345C6.85293 23.2345 6.98493 23.2344 7.12103 23.2344C7.55943 23.2346 7.99783 23.2361 8.43623 23.2376C8.73943 23.238 9.04263 23.2382 9.34593 23.2384C10.1454 23.2392 10.9449 23.2411 11.7444 23.2433C12.5597 23.2453 13.375 23.2462 14.1903 23.2471C15.791 23.2492 17.3918 23.2526 18.9925 23.2567C18.9972 26.3366 19.0008 29.4164 19.003 32.4963C19.004 33.9262 19.0054 35.3562 19.0077 36.7861C19.0097 38.032 19.0111 39.2779 19.0115 40.5238C19.0118 41.1839 19.0124 41.844 19.0139 42.504C19.0153 43.2398 19.0155 43.9755 19.0154 44.7112C19.0162 44.9316 19.0169 45.152 19.0176 45.3791C19.0172 45.678 19.0172 45.678 19.0168 45.9829C19.017 46.1571 19.0172 46.3313 19.0174 46.5108C18.9925 46.9041 18.9925 46.9041 18.7904 47.0995C18.3835 47.119 17.9758 47.1246 17.5683 47.1248C17.3067 47.1254 17.0451 47.1261 16.7756 47.1267C16.4877 47.1264 16.1999 47.1259 15.912 47.1255C15.6188 47.1256 15.3256 47.1258 15.0325 47.1261C14.4171 47.1264 13.8017 47.1259 13.1863 47.125C12.3965 47.1239 11.6068 47.1246 10.817 47.1257C10.2112 47.1264 9.60553 47.1262 8.99973 47.1257C8.70843 47.1256 8.41723 47.1257 8.12603 47.1262C7.71923 47.1267 7.31233 47.1258 6.90553 47.1248C6.67373 47.1247 6.44193 47.1245 6.20313 47.1244C5.65723 47.0995 5.65723 47.0995 5.25313 46.9041ZM6.06133 46.3178C6.45193 46.3362 6.84323 46.3408 7.23423 46.34C7.48853 46.34 7.74283 46.34 8.00483 46.3399C8.27703 46.3389 8.54923 46.3379 8.82143 46.3369C9.06743 46.3367 9.31353 46.3365 9.56703 46.3363C10.4905 46.3353 11.414 46.3325 12.3375 46.33C14.4003 46.326 16.4631 46.322 18.5884 46.3178C18.5884 39.0301 18.5884 31.7424 18.5884 24.2339C14.3878 24.2339 10.1872 24.2339 5.85933 24.2339C5.85343 28.1194 5.85343 28.1194 5.84943 32.005C5.84823 33.5886 5.84683 35.1722 5.84403 36.7559C5.84183 38.0319 5.84063 39.3079 5.84013 40.5839C5.83973 41.072 5.83903 41.56 5.83793 42.0481C5.83653 42.729 5.83633 43.4099 5.83633 44.0909C5.83563 44.2949 5.83493 44.4988 5.83413 44.709C5.83443 44.8934 5.83473 45.0779 5.83503 45.2679C5.83483 45.4291 5.83463 45.5904 5.83443 45.7565C5.81773 46.1251 5.81773 46.1251 6.06133 46.3178Z" fill="#34A853" fill-opacity="0.6" />
        <path d="M3.50635 71.8649C3.50925 71.7287 3.51215 71.5926 3.51525 71.4524C3.51435 71.3065 3.51355 71.1606 3.51265 71.0102C3.51095 70.521 3.51655 70.0321 3.52205 69.5429C3.52235 69.1923 3.52215 68.8418 3.52155 68.4912C3.52125 67.5392 3.52725 66.5872 3.53425 65.6351C3.54055 64.6403 3.54115 63.6455 3.54235 62.6507C3.54555 60.7667 3.55385 58.8827 3.56395 56.9987C3.57525 54.8539 3.58085 52.7092 3.58585 50.5644C3.59645 46.1522 3.61425 41.74 3.63675 37.3279C3.83675 37.3279 4.03675 37.3279 4.24285 37.3279C4.24235 37.5075 4.24175 37.687 4.24115 37.8721C4.22775 42.2383 4.21775 46.6046 4.21145 50.9709C4.20835 53.0824 4.20405 55.1938 4.19715 57.3053C4.19105 59.1454 4.18715 60.9854 4.18585 62.8254C4.18505 63.8 4.18315 64.7746 4.17875 65.7492C4.17465 66.6661 4.17335 67.5829 4.17435 68.4998C4.17415 68.8367 4.17295 69.1736 4.17065 69.5104C4.16755 69.9698 4.16835 70.429 4.16995 70.8883C4.16945 71.1456 4.16885 71.4028 4.16825 71.6679C4.24725 72.3484 4.34465 72.6211 4.84905 73.0922C5.04905 73.1566 5.24905 73.2211 5.45515 73.2876C5.45515 72.9651 5.45515 72.6427 5.45515 72.3104C5.18845 72.2459 4.92175 72.1814 4.64695 72.115C5.18035 72.115 5.71375 72.115 6.26335 72.115C6.26335 70.4382 6.26335 68.7614 6.26335 67.0338C5.72995 67.0338 5.19655 67.0338 4.64695 67.0338C4.64695 66.9693 4.64695 66.9048 4.64695 66.8383C5.24705 66.8383 5.84715 66.8383 6.46545 66.8383C6.46545 68.6441 6.46545 70.4499 6.46545 72.3104C10.5326 72.3104 14.5999 72.3104 18.7904 72.3104C18.7904 72.7619 18.7904 73.2133 18.7904 73.6785C16.9638 73.6966 15.1372 73.7105 13.3105 73.719C12.4622 73.723 11.6141 73.7286 10.7659 73.7374C9.94715 73.7459 9.12835 73.7506 8.30955 73.7526C7.99735 73.7541 7.68525 73.7569 7.37305 73.7611C6.93535 73.7668 6.49775 73.7676 6.05995 73.7672C5.81095 73.7689 5.56195 73.7707 5.30535 73.7725C4.09195 73.5992 3.52565 73.0693 3.50635 71.8649Z" fill="#BABABA" />
        <path d="M4.29436 70.8598C4.29346 70.6495 4.29346 70.6495 4.29236 70.435C4.29096 69.9652 4.29376 69.4955 4.29666 69.0257C4.29646 68.6889 4.29606 68.3522 4.29536 68.0154C4.29436 67.1009 4.29706 66.1865 4.30056 65.2719C4.30356 64.3161 4.30336 63.3602 4.30356 62.4044C4.30426 60.7997 4.30726 59.1951 4.31186 57.5905C4.31766 55.5281 4.31976 53.4657 4.32066 51.4033C4.32146 49.633 4.32396 47.8627 4.32676 46.0923C4.32766 45.5218 4.32826 44.9512 4.32876 44.3807C4.32976 43.4861 4.33186 42.5915 4.33476 41.6969C4.33566 41.3677 4.33616 41.0384 4.33646 40.7092C4.33676 40.2617 4.33836 39.8142 4.34026 39.3667C4.34086 39.1157 4.34146 38.8647 4.34206 38.6061C4.36866 38.0501 4.36866 38.0501 4.57076 37.8546C4.59576 37.4411 4.60666 37.0267 4.61216 36.6125C4.61416 36.4829 4.61616 36.3532 4.61826 36.2197C4.62466 35.7893 4.62966 35.3589 4.63466 34.9285C4.63876 34.6308 4.64306 34.3331 4.64736 34.0355C4.65856 33.2506 4.66856 32.4657 4.67826 31.6807C4.68836 30.8804 4.69966 30.08 4.71076 29.2796C4.73256 27.7082 4.75306 26.1367 4.77276 24.5652C4.83946 24.5652 4.90616 24.5652 4.97476 24.5652C4.97476 38.4312 4.97476 52.2972 4.97476 66.5833C5.57486 66.5833 6.17496 66.5833 6.79326 66.5833C6.72656 66.7123 6.65987 66.8413 6.59117 66.9742C6.57407 67.3571 6.56956 67.7406 6.57146 68.1239C6.57246 68.4658 6.57246 68.4658 6.57346 68.8147C6.57516 69.0538 6.57687 69.2929 6.57857 69.5392C6.57947 69.7798 6.58037 70.0204 6.58137 70.2683C6.58377 70.864 6.58707 71.4597 6.59117 72.0554C6.32447 72.1199 6.05776 72.1844 5.78296 72.2509C5.78296 72.5733 5.78296 72.8958 5.78296 73.228C5.26876 73.1594 5.02127 73.0772 4.64877 72.7195C4.26497 72.0774 4.29356 71.6 4.29436 70.8598Z" fill="#CFCFCF" />
        <path d="M18.9922 73.2876C19.0923 73.0941 19.0923 73.0941 19.1943 72.8967C19.3943 72.8967 19.5944 72.8967 19.8004 72.8967C19.8004 61.288 19.8004 49.6793 19.8004 37.7188C19.6671 37.7188 19.5337 37.7188 19.3963 37.7188C19.3297 40.621 19.263 43.5231 19.1943 46.5133C19.1276 46.5133 19.0609 46.5133 18.9922 46.5133C18.9922 38.9031 18.9922 31.2929 18.9922 23.4521C19.1923 23.6456 19.3923 23.8391 19.5984 24.0384C19.6984 16.8797 19.6984 16.8797 19.8004 9.57642C19.8671 9.57642 19.9338 9.57642 20.0025 9.57642C20.0025 30.5366 20.0025 51.4968 20.0025 73.0922C19.6691 73.1567 19.3357 73.2212 18.9922 73.2876Z" fill="#34A853" />
        <path d="M5.65723 73.6783C5.65723 73.2269 5.65723 72.7754 5.65723 72.3103C9.99123 72.3103 14.3252 72.3103 18.7905 72.3103C18.7905 72.7617 18.7905 73.2132 18.7905 73.6783C14.4565 73.6783 10.1225 73.6783 5.65723 73.6783Z" fill="#4B4B4B" />
        <path d="M4.21631 6.40059C4.21681 6.22329 4.21731 6.04589 4.21791 5.86319C4.21711 5.59709 4.21711 5.59709 4.21631 5.32569C4.24311 4.88599 4.24311 4.88599 4.44521 4.69059C4.83061 4.61229 5.21841 4.54479 5.60691 4.48289C5.81841 4.44839 6.02991 4.41389 6.24781 4.37829C6.80181 4.30829 7.32241 4.2847 7.88001 4.2997C7.94671 4.1062 8.01341 3.91279 8.08211 3.71339C9.48001 3.42869 10.8308 3.2839 12.123 3.9088C12.123 4.6183 12.123 5.32769 12.123 6.05859C11.6726 6.09069 11.6726 6.09069 11.213 6.12349C9.09521 6.28319 7.03571 6.47579 4.96451 6.94039C4.79311 6.97179 4.62171 7.00329 4.44521 7.03579C4.24311 6.84029 4.24311 6.84029 4.21631 6.40059Z" fill="#3E3E3E" />
        <path d="M8.89014 43.3862C8.89014 38.0977 8.89014 32.8093 8.89014 27.3606C11.0904 27.3606 13.2907 27.3606 15.5577 27.3606C15.5577 32.6491 15.5577 37.9375 15.5577 43.3862C13.3574 43.3862 11.1571 43.3862 8.89014 43.3862ZM9.29424 42.9953C11.2278 42.9953 13.1614 42.9953 15.1536 42.9953C15.1536 37.9648 15.1536 32.9344 15.1536 27.7515C13.22 27.7515 11.2864 27.7515 9.29423 27.7515C9.29423 32.782 9.29423 37.8124 9.29424 42.9953Z" fill="#D4D4D4" />
        <path d="M3.03072 2.34526C3.36742 2.33686 3.70432 2.33726 4.04102 2.34526C4.40552 2.69776 4.29092 3.23776 4.30702 3.71396C4.31542 3.95146 4.32392 4.18886 4.33262 4.43356C4.34062 4.68356 4.34852 4.93356 4.35672 5.19116C4.36542 5.44196 4.37412 5.69276 4.38312 5.95116C4.40462 6.57326 4.42522 7.19527 4.44512 7.81737C5.05002 7.81737 5.59102 7.71896 6.18282 7.60876C8.96072 7.11116 11.7324 7.17386 14.5476 7.23106C14.5476 7.29556 14.5476 7.36006 14.5476 7.42646C14.3908 7.43136 14.234 7.43626 14.0724 7.44136C13.3552 7.46416 12.6381 7.48806 11.9209 7.51196C11.6743 7.51966 11.4276 7.52736 11.1735 7.53526C7.83172 7.63656 7.83172 7.63657 4.84922 8.98997C4.66562 9.52247 4.61002 9.89326 4.58322 10.4458C4.57472 10.6114 4.56632 10.7771 4.55752 10.9477C4.54962 11.1199 4.54172 11.2921 4.53352 11.4695C4.52472 11.644 4.51602 11.8185 4.50702 11.9982C4.48562 12.4286 4.46502 12.859 4.44512 13.2895C4.31172 13.2895 4.17842 13.2895 4.04102 13.2895C4.04102 16.7721 4.04102 20.2548 4.04102 23.8429C3.97432 23.8429 3.90762 23.8429 3.83892 23.8429C3.83682 23.7078 3.83482 23.5728 3.83262 23.4336C3.81262 22.1461 3.79192 20.8586 3.77042 19.5712C3.75932 18.9096 3.74862 18.2481 3.73842 17.5866C3.73492 12.8798 3.73492 12.8798 3.23282 8.20816C3.22912 7.92316 3.23322 7.63796 3.24542 7.35316C3.26222 6.28846 3.11782 5.25906 2.95462 4.20846C2.85622 3.53846 2.78672 2.98906 3.03072 2.34526Z" fill="#BAB0A5" />
        <path d="M9.89746 37.3023C9.92986 37.0668 9.92986 37.0668 9.96296 36.8267C9.99306 36.5905 9.99306 36.5905 10.0238 36.3495C10.1019 35.9594 10.1019 35.9594 10.304 35.764C10.8701 35.7444 11.4301 35.7369 11.9961 35.7396C12.2329 35.7384 12.2329 35.7384 12.4744 35.7373C13.1482 35.7384 13.7017 35.752 14.345 35.9594C14.356 36.2688 14.3638 36.5783 14.3702 36.8877C14.3749 37.0601 14.3796 37.2324 14.3844 37.4099C14.343 37.9389 14.189 38.2315 13.9409 38.6955C14.0076 38.8245 14.0742 38.9535 14.1429 39.0864C13.0094 39.0864 11.8759 39.0864 10.7081 39.0864C10.5747 38.7639 10.4414 38.4414 10.304 38.1092C9.89986 37.7183 9.89986 37.7183 9.89746 37.3023Z" fill="#E5E7E6" />
        <path d="M12.3247 3.90873C13.2914 3.35563 14.2635 3.43863 15.3555 3.51793C16.1005 3.71333 16.1005 3.71333 16.5678 3.90873C16.5678 4.03773 16.5678 4.16673 16.5678 4.29963C16.8741 4.28753 16.8741 4.28753 17.1865 4.27523C18.0186 4.30073 18.6122 4.44273 19.3965 4.69053C19.4631 4.43253 19.5298 4.17453 19.5985 3.90873C19.7319 3.90873 19.8652 3.90873 20.0026 3.90873C20.2253 4.77043 20.2201 5.56673 20.2046 6.44943C20.1046 6.25593 20.1046 6.25593 20.0026 6.05853C19.7734 6.06253 19.5442 6.06653 19.3081 6.07073C18.5883 6.05853 18.5883 6.05853 18.3862 5.86313C16.4811 5.37063 14.4851 5.35593 12.5268 5.27683C12.3247 4.69053 12.3247 4.69053 12.3247 3.90873Z" fill="#595959" />
        <path d="M4.24271 6.84019C6.89131 6.33379 9.41681 5.92169 12.1226 6.05849C12.1226 5.34909 12.1226 4.63959 12.1226 3.90869C12.1893 3.90869 12.256 3.90869 12.3247 3.90869C12.3247 4.94059 12.3247 5.97249 12.3247 7.03559C11.8913 7.08749 11.4579 7.13939 11.0114 7.19289C10.5867 7.24439 10.1621 7.29629 9.73741 7.34819C9.44471 7.38379 9.15201 7.41899 8.85921 7.45389C6.63011 7.71759 6.63011 7.71759 4.44481 8.20819C4.19601 7.72689 4.22821 7.37189 4.24271 6.84019Z" fill="#212121" />
        <path d="M10.1025 31.0742C10.1692 30.7518 10.2359 30.4293 10.3046 30.0971C10.5713 30.0326 10.838 29.9681 11.1128 29.9016C11.1128 29.6436 11.1128 29.3857 11.1128 29.1199C11.3795 29.1199 11.6462 29.1199 11.921 29.1199C11.8124 29.7799 11.6965 30.4286 11.5169 31.0742C11.6377 31.0379 11.7586 31.0017 11.8831 30.9643C12.3251 30.8788 12.3251 30.8788 12.9312 31.0742C12.9312 30.7518 12.9312 30.4293 12.9312 30.0971C12.7978 30.0971 12.6645 30.0971 12.5271 30.0971C12.4604 29.7746 12.3937 29.4521 12.3251 29.1199C12.6584 29.1199 12.9918 29.1199 13.3353 29.1199C13.3353 29.3779 13.3353 29.6358 13.3353 29.9016C13.602 29.9661 13.8687 30.0306 14.1435 30.0971C14.2102 30.4195 14.2768 30.742 14.3455 31.0742C14.2205 31.1226 14.0955 31.171 13.9667 31.2208C13.4447 31.4671 13.4447 31.4671 13.1332 32.2468C12.3998 32.2468 11.6664 32.2468 10.9107 32.2468C10.844 31.9244 10.7774 31.6019 10.7087 31.2697C10.5086 31.2052 10.3086 31.1407 10.1025 31.0742Z" fill="#CCCCCC" />
        <path d="M4.84912 71.9195C4.84912 70.3072 4.84912 68.6949 4.84912 67.0337C5.31582 67.0337 5.78262 67.0337 6.26342 67.0337C6.26342 68.7105 6.26342 70.3873 6.26342 72.1149C5.79672 72.0505 5.33002 71.986 4.84912 71.9195Z" fill="#D7D7D7" />
        <path d="M4.24268 5.66767C4.34268 5.18397 4.34268 5.18397 4.44468 4.69047C4.82758 4.62437 5.21068 4.55947 5.59388 4.49507C5.80718 4.45877 6.02048 4.42257 6.24028 4.38517C6.79838 4.30927 7.31738 4.28347 7.87958 4.29967C7.94628 4.10617 8.01288 3.91267 8.08158 3.71337C9.14268 3.49727 10.2337 3.41177 11.3144 3.51787C11.5144 3.64687 11.7145 3.77587 11.9206 3.90877C11.9206 4.16677 11.9206 4.42477 11.9206 4.69047C11.7513 4.70137 11.582 4.71217 11.4076 4.72327C10.7803 4.76377 10.153 4.80507 9.52568 4.84677C9.25408 4.86467 8.98238 4.88237 8.71078 4.89967C8.32048 4.92457 7.93038 4.95067 7.54018 4.97677C7.30528 4.99217 7.07038 5.00747 6.82838 5.02327C6.27298 5.04807 6.27298 5.04807 5.85908 5.27677C5.65908 5.27277 5.45898 5.26877 5.25288 5.26457C4.62298 5.20967 4.62298 5.20967 4.24268 5.66767Z" fill="#717171" />
        <path d="M3.0304 2.34526C3.367 2.33686 3.704 2.33726 4.0406 2.34526C4.2427 2.54066 4.2427 2.54066 4.2656 3.11906C4.2646 3.37176 4.2635 3.62456 4.2624 3.88506C4.262 4.08636 4.262 4.08636 4.2616 4.29166C4.2604 4.72186 4.2579 5.15196 4.2553 5.58216C4.2543 5.87306 4.2534 6.16406 4.2526 6.45506C4.2503 7.16976 4.2468 7.88446 4.2427 8.59916C3.9093 8.59916 3.5759 8.59916 3.2325 8.59916C3.2371 8.46606 3.2418 8.33306 3.2467 8.19606C3.2729 6.83366 3.1655 5.53296 2.9543 4.18886C2.8551 3.52426 2.7894 2.98426 3.0304 2.34526Z" fill="#C0C0C0" />
        <path d="M12.3125 5.26429C12.3187 4.98009 12.3187 4.98009 12.3251 4.69019C12.3918 4.88369 12.4584 5.07719 12.5271 5.27649C12.7639 5.27199 13.0007 5.26739 13.2446 5.26279C15.0082 5.23929 16.6606 5.27239 18.3866 5.66739C18.5603 5.69989 18.734 5.73239 18.913 5.76589C19.3968 5.86279 19.3968 5.86279 20.003 6.05819C20.1419 6.46129 20.1419 6.46129 20.205 6.83999C19.2958 6.73849 18.4024 6.61149 17.5026 6.44909C16.2435 6.23809 14.9899 6.17349 13.7151 6.12499C12.3294 6.06839 12.3294 6.06839 12.3125 5.26429Z" fill="#444444" />
        <path d="M3.98192 70.9516C3.98322 70.758 3.98322 70.758 3.98452 70.5606C3.98792 70.1503 3.99552 69.7403 4.00322 69.3301C4.00622 69.0512 4.00902 68.7723 4.01152 68.4934C4.01812 67.8113 4.02862 67.1294 4.04112 66.4475C4.84122 66.512 5.64132 66.5765 6.46572 66.6429C6.46572 66.7074 6.46572 66.7719 6.46572 66.8383C5.66552 66.9351 5.66552 66.9351 4.84932 67.0338C4.84932 68.6461 4.84932 70.2584 4.84932 71.9196C4.98262 71.9841 5.11602 72.0486 5.25342 72.115C5.45542 72.3104 5.45542 72.3104 5.46802 72.8112C5.46182 73.047 5.46182 73.047 5.45542 73.2876C4.93962 73.2188 4.69332 73.1365 4.32022 72.7771C3.94152 72.144 3.97232 71.6803 3.98192 70.9516Z" fill="#C5C5C5" />
        <path d="M12.5269 4.49487C12.5269 4.30137 12.5269 4.10797 12.5269 3.90857C13.4282 3.32737 14.2981 3.44197 15.3556 3.51767C16.1006 3.71317 16.1006 3.71317 16.5679 3.90857C16.5679 4.03757 16.5679 4.16657 16.5679 4.29947C16.8742 4.28737 16.8742 4.28737 17.1866 4.27507C18.0187 4.30057 18.6123 4.44257 19.3965 4.69027C19.4632 4.43237 19.5299 4.17437 19.5986 3.90857C19.732 3.90857 19.8653 3.90857 20.0027 3.90857C20.1027 4.77927 20.1027 4.77927 20.2047 5.66747C20.0047 5.53847 19.8047 5.40947 19.5986 5.27657C19.2054 5.19857 18.8091 5.13487 18.4116 5.08117C17.2632 4.92527 17.2632 4.92527 16.7091 4.67967C15.9026 4.40647 15.1295 4.45367 14.2822 4.47047C14.1133 4.47227 13.9444 4.47397 13.7703 4.47577C13.3558 4.48037 12.9413 4.48737 12.5269 4.49487Z" fill="#848484" />
        <path d="M19.5986 3.90862C19.732 3.84412 19.8654 3.77972 20.0027 3.71322C19.9986 3.52382 19.9944 3.33433 19.9901 3.13913C20.0027 2.54063 20.0027 2.54062 20.2048 2.34522C20.6088 2.33722 21.0131 2.33692 21.4171 2.34522C21.389 3.23692 21.359 4.12852 21.3287 5.02022C21.3207 5.27302 21.3128 5.52582 21.3046 5.78622C21.2962 6.03002 21.2877 6.27372 21.279 6.52482C21.2716 6.74902 21.2642 6.97312 21.2565 7.20402C21.2194 7.75282 21.1403 8.25942 21.013 8.79452C20.7463 8.66552 20.4796 8.53652 20.2048 8.40362C20.3381 8.33912 20.4715 8.27463 20.6089 8.20823C20.5422 6.78933 20.4755 5.37052 20.4068 3.90862C20.2735 3.97312 20.1401 4.03762 20.0027 4.10412C19.8694 4.03962 19.736 3.97512 19.5986 3.90862Z" fill="#CECCCB" />
        <path d="M4.24268 6.05816C4.34268 5.57446 4.34268 5.57445 4.44468 5.08105C4.66978 5.08505 4.89478 5.08905 5.12668 5.09325C5.82518 5.13255 5.82518 5.13256 6.26318 4.88556C6.79878 4.83916 7.33018 4.80285 7.86698 4.77565C8.02068 4.76735 8.17448 4.75905 8.33298 4.75055C9.52938 4.68975 10.7225 4.66765 11.9206 4.69015C11.9872 4.43215 12.0539 4.17425 12.1226 3.90845C12.1226 4.23085 12.1226 4.55336 12.1226 4.88556C11.5429 5.20176 11.1091 5.32845 10.4454 5.35055C10.2812 5.35715 10.117 5.36385 9.94778 5.37075C9.77788 5.37595 9.60788 5.38106 9.43278 5.38636C8.29408 5.42666 7.18648 5.48955 6.06108 5.66735C6.06108 5.73185 6.06108 5.79635 6.06108 5.86275C5.46098 5.92725 4.86098 5.99176 4.24268 6.05816Z" fill="#5C5C5C" />
        <path d="M20.0029 24.6246C20.0029 24.4312 20.0029 24.2377 20.0029 24.0383C20.1363 24.0383 20.2696 24.0383 20.407 24.0383C20.407 23.0065 20.407 21.9746 20.407 20.9114C20.4737 20.9114 20.5403 20.9114 20.609 20.9114C20.8889 24.2862 20.7957 27.6592 20.7313 31.0401C20.7168 31.8172 20.7038 32.5943 20.6907 33.3714C20.665 34.8857 20.6376 36.3999 20.609 37.9141C20.4757 37.9141 20.3423 37.9141 20.2049 37.9141C20.2054 37.7505 20.2058 37.5869 20.2063 37.4183C20.2103 35.8797 20.2134 34.3411 20.2154 32.8025C20.2165 32.0114 20.2179 31.2203 20.2202 30.4292C20.2224 29.6664 20.2236 28.9035 20.2241 28.1407C20.2245 27.849 20.2252 27.5574 20.2263 27.2657C20.2278 26.8585 20.228 26.4514 20.2279 26.0442C20.2286 25.696 20.2286 25.696 20.2292 25.3407C20.2663 24.8355 20.2663 24.8355 20.0029 24.6246Z" fill="#A8A8A8" />
        <path d="M9.90039 37.7186C9.91769 37.3217 9.91769 37.3217 9.97609 36.8392C10.0035 36.6004 10.0035 36.6004 10.0314 36.3567C10.1024 35.9597 10.1024 35.9597 10.3045 35.7643C10.844 35.7367 11.3802 35.756 11.9209 35.7643C12.0527 36.1033 12.0527 36.1033 12.1229 36.546C11.9216 36.9644 11.9216 36.9644 11.6304 37.3766C11.5348 37.5147 11.4392 37.6527 11.3408 37.795C11.2655 37.8988 11.1902 38.0026 11.1127 38.1095C10.1277 37.9385 10.1277 37.9385 9.90039 37.7186Z" fill="#CBCCCC" />
        <path d="M12.3125 38.3907C12.3187 38.1549 12.3187 38.1549 12.3251 37.9143C12.5251 37.9143 12.7252 37.9143 12.9312 37.9143C12.9979 37.5918 13.0646 37.2694 13.1333 36.9371C13.5121 36.815 13.5121 36.815 13.9415 36.7417C14.0748 36.8707 14.2082 36.9997 14.3456 37.1326C14.2698 37.5967 14.2698 37.5967 14.1435 38.1097C14.1435 38.3677 14.1435 38.6257 14.1435 38.8915C14.1435 38.956 14.1435 39.0204 14.1435 39.0869C12.9005 39.106 12.9005 39.106 12.5271 39.0869C12.3251 38.8915 12.3251 38.8915 12.3125 38.3907Z" fill="#C8C9C9" />
        <path d="M20.0028 12.508C19.9973 12.0032 19.9933 11.4983 19.9902 10.9934C19.9885 10.8508 19.9868 10.7083 19.9851 10.5613C19.9818 9.87227 20.0123 9.26177 20.2049 8.59937C20.4716 8.66387 20.7383 8.72837 21.0131 8.79477C20.9464 10.0202 20.8797 11.2455 20.811 12.508C20.5443 12.508 20.2776 12.508 20.0028 12.508Z" fill="#B8A898" />
        <path d="M12.5268 3.90869C12.5268 4.10219 12.5268 4.29569 12.5268 4.49499C12.7776 4.47639 13.0285 4.45769 13.2869 4.43849C13.6186 4.41649 13.9504 4.39459 14.2821 4.37289C14.4471 4.36029 14.6121 4.34769 14.7821 4.33469C15.699 4.27719 16.3316 4.28899 17.174 4.69039C17.6439 4.76499 18.1153 4.83209 18.5883 4.88589C18.5883 4.95039 18.5883 5.01489 18.5883 5.08129C16.588 5.08129 14.5877 5.08129 12.5268 5.08129C12.2752 4.59449 12.3699 4.41469 12.5268 3.90869ZM18.5883 5.27669C18.5883 5.21229 18.5883 5.14779 18.5883 5.08129C19.055 5.08129 19.5218 5.08129 20.0027 5.08129C20.0027 5.27479 20.0027 5.46829 20.0027 5.66759C19.0429 5.49659 19.0429 5.49659 18.5883 5.27669Z" fill="#6C6C6C" />
        <path d="M3.63672 37.3276C3.83682 37.3276 4.03682 37.3276 4.24292 37.3276C4.24292 41.2617 4.24292 45.1958 4.24292 49.2491C4.10952 49.2491 3.97622 49.2491 3.83882 49.2491C3.81242 47.7813 3.78602 46.3135 3.75972 44.8457C3.74752 44.1641 3.73532 43.4826 3.72312 42.801C3.70902 42.0176 3.69492 41.2342 3.68092 40.4507C3.67652 40.2058 3.67212 39.9609 3.66752 39.7086C3.66152 39.3682 3.66152 39.3682 3.65532 39.021C3.65172 38.821 3.64812 38.6209 3.64442 38.4148C3.63892 38.0524 3.63672 37.69 3.63672 37.3276Z" fill="#ABABAB" />
        <path d="M3.83838 23.8429C3.83838 20.1023 3.83838 16.3617 3.83838 12.5078C4.03848 12.5078 4.23848 12.5078 4.44458 12.5078C4.44458 12.7658 4.44458 13.0237 4.44458 13.2895C4.31118 13.2895 4.17788 13.2895 4.04048 13.2895C4.04048 16.7721 4.04048 20.2548 4.04048 23.8429C3.97378 23.8429 3.90708 23.8429 3.83838 23.8429Z" fill="#B5B5B5" />
        <path d="M9.90039 32.2466C9.90039 31.2147 9.90039 30.1828 9.90039 29.1197C10.5671 29.0552 11.2339 28.9907 11.9209 28.9243C11.7875 29.1822 11.6541 29.4402 11.5168 29.706C11.5168 29.5125 11.5168 29.319 11.5168 29.1197C11.3834 29.1197 11.25 29.1197 11.1127 29.1197C11.1127 29.3777 11.1127 29.6356 11.1127 29.9014C10.846 30.0304 10.5792 30.1594 10.3045 30.2923C10.2168 31.0502 10.2168 31.0502 10.6075 31.416C10.7075 31.4966 10.8076 31.5773 10.9106 31.6603C10.8439 31.8538 10.7773 32.0473 10.7086 32.2466C10.4419 32.2466 10.1751 32.2466 9.90039 32.2466Z" fill="#DDDEDE" />
        <path d="M13.1333 32.2467C13.41 31.6289 13.5352 31.4664 14.1435 31.0741C14.0768 30.7516 14.0102 30.4292 13.9415 30.0969C13.7414 30.0324 13.5414 29.9679 13.3353 29.9015C13.402 29.579 13.4687 29.2566 13.5374 28.9243C13.8707 28.9888 14.2041 29.0533 14.5476 29.1198C14.5476 30.0872 14.5476 31.0546 14.5476 32.0513C14.2142 32.1802 13.8809 32.3092 13.5374 32.4421C13.404 32.3776 13.2707 32.3131 13.1333 32.2467Z" fill="#E0E0E0" />
        <path d="M12.3247 29.1196C12.6581 29.1196 12.9915 29.1196 13.335 29.1196C13.335 29.3775 13.335 29.6355 13.335 29.9013C13.6017 29.9658 13.8684 30.0303 14.1432 30.0967C14.2098 30.4192 14.2765 30.7417 14.3452 31.0739C13.3855 31.2938 13.3855 31.2938 12.9309 31.0739C12.9309 30.7514 12.9309 30.429 12.9309 30.0967C12.7975 30.0967 12.6642 30.0967 12.5268 30.0967C12.3247 29.7059 12.3247 29.7059 12.3247 29.1196Z" fill="#9E9E9E" />
        <path d="M20.0029 61.1708C20.1363 61.1708 20.2696 61.1708 20.407 61.1708C20.407 58.5266 20.407 55.8824 20.407 53.158C20.4737 53.158 20.5403 53.158 20.609 53.158C20.6757 56.1892 20.7424 59.2204 20.8111 62.3434C20.6111 62.3434 20.411 62.3434 20.2049 62.3434C20.0029 61.7571 20.0029 61.7571 20.0029 61.1708Z" fill="#B5B5B5" />
        <path d="M5.05078 71.5285C5.05078 70.2387 5.05078 68.9488 5.05078 67.6199C5.25088 67.6199 5.45088 67.6199 5.65698 67.6199C5.65698 68.9097 5.65698 70.1996 5.65698 71.5285C5.45698 71.5285 5.25688 71.5285 5.05078 71.5285Z" fill="#34A853" />
        <path d="M12.5266 35.7644C13.1267 35.8289 13.7268 35.8934 14.345 35.9599C14.345 36.3468 14.345 36.7338 14.345 37.1325C14.195 37.1002 14.045 37.068 13.8904 37.0347C13.2964 36.9137 13.2964 36.9137 12.5266 36.937C12.3245 36.5462 12.3245 36.5462 12.5266 35.7644Z" fill="#DEDEDE" />
        <path d="M5.85889 8.0128C5.92559 7.8838 5.99229 7.7548 6.06099 7.6219C8.73529 6.8696 11.7989 7.1951 14.5471 7.2311C14.5471 7.2956 14.5471 7.3601 14.5471 7.4265C14.3119 7.4339 14.3119 7.4339 14.0719 7.4413C13.3547 7.4642 12.6376 7.4881 11.9204 7.512C11.6738 7.5197 11.4271 7.5274 11.173 7.5353C8.95099 7.583 8.95099 7.583 6.79339 8.0372C6.61839 8.0937 6.44339 8.1501 6.26299 8.2082C6.12969 8.1437 5.99629 8.0793 5.85889 8.0128Z" fill="#B0B0B0" />
        <path d="M19.8003 4.69043C19.9337 4.30343 20.0671 3.91652 20.2044 3.51782C20.6085 3.90862 20.6085 3.90863 20.6544 4.32973C20.6523 4.49963 20.6502 4.66953 20.648 4.84463C20.6467 5.02853 20.6454 5.21242 20.6441 5.40192C20.6407 5.59432 20.6373 5.78682 20.6338 5.98512C20.632 6.17912 20.6302 6.37313 20.6283 6.57293C20.6235 7.05293 20.6169 7.53283 20.6085 8.01273C20.4085 8.01273 20.2085 8.01273 20.0024 8.01273C20.0047 7.78933 20.0071 7.56582 20.0095 7.33562C20.0114 7.04422 20.0132 6.75282 20.015 6.46152C20.0167 6.31402 20.0184 6.16653 20.0202 6.01453C20.0219 5.63823 20.013 5.26193 20.0024 4.88583C19.9357 4.82133 19.869 4.75683 19.8003 4.69043Z" fill="#B8B8B8" />
        <path d="M5.85889 5.66744C5.85889 5.60304 5.85889 5.53853 5.85889 5.47203C7.22519 5.28933 8.58029 5.21374 9.95749 5.15834C10.1209 5.15094 10.2842 5.14364 10.4524 5.13614C10.5987 5.13024 10.745 5.12434 10.8958 5.11824C11.322 5.08054 11.7107 4.99664 12.1225 4.88574C12.0558 5.07924 11.9891 5.27273 11.9204 5.47203C11.2471 5.53843 10.5735 5.60314 9.89989 5.66744C9.71109 5.68614 9.52229 5.70473 9.32769 5.72393C8.23339 5.82763 7.16069 5.90233 6.06099 5.86293C5.99429 5.79843 5.92759 5.73394 5.85889 5.66744Z" fill="#4D4D4D" />
        <path d="M3.23291 8.59913C3.33291 7.24473 3.33291 7.24473 3.43491 5.86303C3.50161 5.86303 3.56831 5.86303 3.63701 5.86303C3.73701 5.28263 3.73701 5.28263 3.83901 4.69043C3.90571 4.69043 3.97241 4.69043 4.04111 4.69043C4.10781 5.98033 4.17441 7.27013 4.24311 8.59913C3.90971 8.59913 3.57641 8.59913 3.23291 8.59913Z" fill="#CCCAC9" />
        <path d="M3.63672 24.0383C3.90342 24.0383 4.17012 24.0383 4.44492 24.0383C4.41292 24.1348 4.38092 24.2314 4.34792 24.3309C4.20102 25.015 4.19512 25.6966 4.17892 26.3927C4.17482 26.5434 4.17062 26.6941 4.16622 26.8494C4.15312 27.3292 4.14112 27.8091 4.12922 28.289C4.12052 28.6149 4.11172 28.9409 4.10282 29.2669C4.08122 30.0646 4.06072 30.8624 4.04082 31.6602C3.97422 31.6602 3.90752 31.6602 3.83882 31.6602C3.80992 30.669 3.78112 29.6777 3.75252 28.6865C3.74272 28.3492 3.73292 28.012 3.72312 27.6748C3.70892 27.1901 3.69492 26.7055 3.68092 26.2209C3.67652 26.07 3.67212 25.9191 3.66752 25.7637C3.65102 25.1883 3.63672 24.6139 3.63672 24.0383Z" fill="#A2A2A2" />
        <path d="M12.5269 4.49499C12.5269 4.30149 12.5269 4.10799 12.5269 3.90869C13.6604 3.90869 14.7939 3.90869 15.9617 3.90869C16.0284 4.03769 16.0951 4.16669 16.1638 4.29949C15.4326 4.53529 14.7646 4.51609 14.0044 4.50719C13.8625 4.50629 13.7207 4.50539 13.5746 4.50449C13.2254 4.50219 12.8761 4.49869 12.5269 4.49499Z" fill="#959595" />
        <path d="M11.3145 30.0966C11.5145 30.0321 11.7145 29.9676 11.9206 29.9012C12.0688 29.5074 12.0688 29.5074 12.1227 29.1194C12.256 29.4419 12.3894 29.7644 12.5268 30.0966C12.6601 30.0966 12.7935 30.0966 12.9309 30.0966C12.9309 30.4191 12.9309 30.7415 12.9309 31.0738C12.4641 31.0738 11.9974 31.0738 11.5165 31.0738C11.4498 30.7513 11.3832 30.4288 11.3145 30.0966Z" fill="#E6E6E6" />
        <path d="M3.83838 37.328C3.83838 35.4577 3.83838 33.5874 3.83838 31.6604C3.90508 31.6604 3.97178 31.6604 4.04048 31.6604C4.04548 31.7735 4.05058 31.8866 4.05578 32.0031C4.18318 34.9632 4.18318 34.9632 4.44458 37.9143C4.37788 37.7208 4.31118 37.5273 4.24248 37.328C4.10918 37.328 3.97578 37.328 3.83838 37.328Z" fill="#B8B8B8" />
        <path d="M15.7593 7.81707C15.7593 7.68817 15.7593 7.55917 15.7593 7.42627C16.2141 7.44857 16.6687 7.47348 17.1232 7.49958C17.5029 7.51998 17.5029 7.51997 17.8903 7.54077C18.5092 7.61257 18.8749 7.69928 19.3962 8.01258C18.0838 8.24768 17.0505 8.12677 15.7593 7.81707Z" fill="#B6B6B6" />
        <path d="M6.86963 4.49512C6.86963 4.43062 6.86963 4.36612 6.86963 4.29972C7.09883 4.27152 7.32803 4.24332 7.56413 4.21422C8.24513 4.18012 8.24513 4.18012 8.48603 3.90882C8.89413 3.89472 9.30263 3.89252 9.71093 3.89662C9.93413 3.89842 10.1573 3.90011 10.3873 3.90201C10.56 3.90421 10.7327 3.90652 10.9106 3.90882C10.9106 3.97332 10.9106 4.03782 10.9106 4.10432C10.5105 4.10432 10.1105 4.10432 9.69833 4.10432C9.69833 4.23322 9.69833 4.36222 9.69833 4.49512C8.69403 4.67352 7.87393 4.67352 6.86963 4.49512Z" fill="#A0A0A0" />
        <path d="M12.9307 4.104C12.9974 3.9105 13.0641 3.7171 13.1328 3.5177C15.4607 3.4456 15.4607 3.4456 16.5676 3.9086C16.5676 4.0376 16.5676 4.1666 16.5676 4.2995C16.3676 4.235 16.1676 4.1705 15.9615 4.104C15.4417 4.0903 14.9277 4.0857 14.4082 4.0918C14.1955 4.0931 14.1955 4.0931 13.9785 4.0945C13.6292 4.0968 13.28 4.1003 12.9307 4.104Z" fill="#5E5E5E" />
        <path d="M10.5063 38.3048C10.773 38.1113 11.0397 37.9179 11.3145 37.7185C11.6175 37.9628 11.6175 37.9628 11.9206 38.3048C11.9206 38.5628 11.9206 38.8208 11.9206 39.0866C11.5205 39.0866 11.1205 39.0866 10.7083 39.0866C10.6416 38.8286 10.575 38.5706 10.5063 38.3048Z" fill="#CFD0D0" />
        <path d="M7.87988 4.29953C7.94648 4.10603 8.01318 3.91253 8.08188 3.71323C9.16508 3.49263 10.2141 3.49883 11.3147 3.51773C11.3814 3.71123 11.448 3.90473 11.5167 4.10403C11.305 4.10183 11.0932 4.09953 10.8751 4.09713C10.5965 4.09533 10.3179 4.09353 10.0393 4.09183C9.89978 4.09023 9.76028 4.08853 9.61658 4.08683C8.98138 4.08393 8.48718 4.10363 7.87988 4.29953Z" fill="#5C5C5C" />
        <path d="M10.1025 31.0735C10.1692 30.7511 10.2359 30.4286 10.3046 30.0964C10.6379 30.1609 10.9713 30.2254 11.3148 30.2918C11.2481 30.6143 11.1815 30.9367 11.1128 31.269C10.7794 31.2045 10.446 31.14 10.1025 31.0735Z" fill="#7E8080" />
        <path d="M3.0306 2.34546C3.164 2.34546 3.2973 2.34546 3.4347 2.34546C3.4347 3.37736 3.4347 4.40916 3.4347 5.47236C2.9265 4.48926 2.6135 3.42126 3.0306 2.34546Z" fill="#B5B5B5" />
        <path d="M20.0029 24.6246C20.0029 24.4312 20.0029 24.2377 20.0029 24.0383C20.1363 24.0383 20.2696 24.0383 20.407 24.0383C20.407 23.0065 20.407 21.9746 20.407 20.9114C20.4737 20.9114 20.5403 20.9114 20.609 20.9114C20.7091 22.7495 20.7091 22.7495 20.8111 24.6246C20.5444 24.6246 20.2777 24.6246 20.0029 24.6246Z" fill="#959595" />
        <path d="M12.3247 5.86331C12.3247 5.73431 12.3247 5.60531 12.3247 5.47241C14.226 5.66071 14.226 5.66071 15.1534 5.86331C15.1534 5.92771 15.1534 5.9922 15.1534 6.0587C14.7199 6.0639 14.2863 6.0677 13.8527 6.0709C13.6113 6.0732 13.3698 6.07541 13.1211 6.07781C12.5268 6.05871 12.5268 6.05871 12.3247 5.86331Z" fill="#3A3A3A" />
        <path d="M9.69824 4.49475C9.69824 4.36575 9.69824 4.23675 9.69824 4.10385C10.4316 4.03935 11.165 3.97485 11.9207 3.90845C11.9207 4.10185 11.9207 4.29535 11.9207 4.49475C11.1873 4.49475 10.4538 4.49475 9.69824 4.49475Z" fill="#7A7A7A" />
        <path d="M13.1333 37.9142C13.1333 37.7852 13.1333 37.6562 13.1333 37.5233C13.3333 37.5233 13.5333 37.5233 13.7394 37.5233C13.7394 37.3298 13.7394 37.1364 13.7394 36.937C13.9394 37.0015 14.1395 37.066 14.3456 37.1324C14.2789 37.4549 14.2122 37.7774 14.1435 38.1096C13.8101 38.0451 13.4768 37.9806 13.1333 37.9142Z" fill="#6A6C6B" />
        <path d="M13.7388 38.6958C14.0082 38.1747 14.2776 37.6535 14.547 37.1323C14.547 37.7128 14.547 38.2932 14.547 38.8912C13.9409 38.8912 13.9409 38.8912 13.7388 38.6958Z" fill="#E1E2E2" />
        <path d="M12.3247 36.5459C12.4247 36.159 12.4247 36.159 12.5268 35.7642C12.7935 35.8287 13.0602 35.8932 13.335 35.9596C13.2683 36.2176 13.2016 36.4756 13.1329 36.7413C12.8662 36.6769 12.5995 36.6124 12.3247 36.5459Z" fill="#C5C5C5" />
        <path d="M10.1025 37.9141C10.1025 37.7206 10.1025 37.5271 10.1025 37.3278C10.5026 37.2633 10.9026 37.1988 11.3148 37.1323C11.2481 37.4548 11.1815 37.7773 11.1128 38.1095C10.7794 38.045 10.446 37.9805 10.1025 37.9141Z" fill="#676969" />
        <path d="M9.90039 38.8911C9.90039 38.5042 9.90039 38.1172 9.90039 37.7185C10.3045 37.9628 10.3045 37.9628 10.7086 38.3048C10.7086 38.5628 10.7086 38.8208 10.7086 39.0866C10.4419 39.0221 10.1751 38.9576 9.90039 38.8911Z" fill="#E1E2E2" />
        <path d="M20.0029 12.5079C20.0029 12.1855 20.0029 11.863 20.0029 11.5308C20.2696 11.5308 20.5363 11.5308 20.8111 11.5308C20.8111 11.8532 20.8111 12.1757 20.8111 12.5079C20.5444 12.5079 20.2777 12.5079 20.0029 12.5079Z" fill="#5F5F5F" />
        <path d="M3.63672 12.5079C3.63672 12.1855 3.63672 11.863 3.63672 11.5308C3.90342 11.5308 4.17012 11.5308 4.44492 11.5308C4.44492 11.8532 4.44492 12.1757 4.44492 12.5079C4.17822 12.5079 3.91152 12.5079 3.63672 12.5079Z" fill="#5E5E5E" />
        <path d="M3.83838 73.092C4.03848 72.963 4.23848 72.8341 4.44458 72.7012C4.94968 72.9699 4.94968 72.9699 5.45478 73.2875C5.45478 73.4164 5.45478 73.5454 5.45478 73.6783C4.29298 73.5317 4.29298 73.5317 3.83838 73.092Z" fill="#BEBEBE" />
        <path d="M19.5986 3.90872C19.732 3.84422 19.8654 3.77972 20.0027 3.71332C20.0027 3.32632 20.0027 2.93941 20.0027 2.54071C20.2028 2.47621 20.4028 2.41171 20.6089 2.34521C20.4089 3.21591 20.4089 3.21592 20.2048 4.10412C20.0048 4.03962 19.8047 3.97522 19.5986 3.90872Z" fill="#C9C9C9" />
        <path d="M20.0029 61.1709C20.2696 61.2999 20.5363 61.4289 20.8111 61.5618C20.8111 61.8197 20.8111 62.0777 20.8111 62.3435C20.6111 62.3435 20.411 62.3435 20.2049 62.3435C20.0029 61.7572 20.0029 61.7572 20.0029 61.1709Z" fill="#7E7E7E" />
        <path d="M4.44482 72.8969C4.44482 72.7679 4.44482 72.639 4.44482 72.5061C4.77822 72.5061 5.11162 72.5061 5.45512 72.5061C5.45512 72.764 5.45512 73.022 5.45512 73.2878C4.67212 73.1168 4.67212 73.1168 4.44482 72.8969Z" fill="#E4E4E4" />
      </g>
    </svg>
  );



  const [gpsData, setGpsData] = useState<PartialGpsData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [] = useState([]);
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>([]);
  const { devices, updateDevice, setSelectedDeviceId } = useMQTTBuses();


  useEffect(() => {
    //   const brokerUrl = import.meta.env.PROD 
    // ? 'wss://35.181.168.87:9001'  // Production (HTTPS)
    // : 'ws://35.181.168.87:9001';   // Development (HTTP)
    const brokerUrl = "wss://35-181-168-87.sslip.io:9001";
    const options = {
      username: 'admin',
      password: 'lEUmas@12',
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 5000,
      clientId: 'web_client_' + Math.random().toString(16).substr(2, 8)
    };

    console.log('🔧 Attempting MQTT connection to:', brokerUrl);

    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', (packet) => {
      console.log('✅ MQTT Connected successfully!', packet);
      setConnectionStatus('Connected');

      client.subscribe('traccar/positions', { qos: 0 }, (err, granted) => {
        if (err) {
          console.error('❌ Subscribe error:', err);
        } else {
          console.log('✅ Subscribe granted:', granted);
        }
      });
    });

    client.on('message', (topic, message) => {
      console.log(`📨 Message on ${topic}:`, message.toString());
      try {
        const data = JSON.parse(message.toString());
        setGpsData(data);
        const { latitude, longitude } = data.position;
        updateDevice(data);

        setPositionHistory(prev => {
          const newHistory = [...prev, {
            latitude,
            longitude,
            timestamp: data.position.serverTime
          }];
          return newHistory.slice(-50); // Keep only last 50 positions
        });
      } catch (error) {
        console.error('❌ Parse error:', error);
      }
    });

    client.on('error', (err) => {
      console.error('❌ MQTT Error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        // code: err.code,
        stack: err.stack
      });
      setConnectionStatus('Error: ' + err.message);
    });

    client.on('close', (packet?: Packet) => {
      console.log('🔌 MQTT Connection closed:', packet);
      setConnectionStatus('Disconnected');
    });

    client.on('offline', () => {
      console.log('📴 MQTT Client offline');
      setConnectionStatus('Offline');
    });

    client.on('reconnect', () => {
      console.log('🔄 MQTT Reconnecting...');
      setConnectionStatus('Reconnecting');
    });

    client.on('end', () => {
      console.log('🔚 MQTT Connection ended');
      setConnectionStatus('Ended');
    });

    return () => {
      console.log('🧹 Cleaning up MQTT connection');
      if (client.connected) {
        client.end();
      }
    };
  }, []);








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

      {latestCoord && (
        <Marker
          longitude={latestCoord.lng}
          latitude={latestCoord.lat}
          anchor="center"
        >
          <div style={{
            position: 'relative',
            transform: `rotate(${latestCoord.heading || 0}deg)`,
            transition: 'transform 0.5s ease'
          }}>
            <BusIcon />
          </div>
        </Marker>


      )}


      {/* {renderBusMarkers()} */}
      {/* {renderTrackingMarker()} */}
      {/* {renderHighlightedDropPoint()} */}










      {/* GPS Tracker Marker */}
      {/* {gpsData && gpsData.position && (
        <Marker
          longitude={gpsData.position.longitude}
          latitude={gpsData.position.latitude}
          anchor="center"
        >
          <div style={{
            position: 'relative',
            transform: `rotate(${gpsData.position.course || 0}deg)`,
            transition: 'transform 0.3s ease',
            filter: gpsData.position.valid ? 'none' : 'grayscale(0.7) opacity(0.7)'
          }}>
            <BusIcon />
          </div>
        </Marker>
      )} */}

      {Object.values(devices).map((device) => (
        <AnimatedMQTTBus
          key={device.deviceId}
          deviceId={device.deviceId}
          latitude={device.position.latitude}
          longitude={device.position.longitude}
          heading={device.position.course}
          speed={device.position.speed}
          valid={device.position.valid}
          onClick={() => {
            console.log('🚌 Bus clicked:', device.deviceId);
            setSelectedDeviceId(device.deviceId);
          }}
        />
      ))}

      {/* Position History Trail */}
      {positionHistory.length > 0 && (
        <Source
          id="position-history"
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: positionHistory.map((pos, index) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [pos.longitude, pos.latitude]
              },
              properties: {
                index: index,
                timestamp: pos.timestamp
              }
            }))
          }}
        >
        </Source>
      )}

      {/* Connection Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 10,
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor:
            connectionStatus === 'Connected' ? '#4CAF50' :
              connectionStatus === 'Reconnecting' ? '#FF9800' :
                connectionStatus === 'Error' ? '#F44336' : '#9E9E9E'
        }} />
        <span>GPS: {connectionStatus}</span>
        {gpsData && gpsData.position && (
          <span style={{
            color: gpsData.position.valid ? '#4CAF50' : '#FF9800',
            fontSize: '10px'
          }}>
            {gpsData.position.valid ? 'Valid' : 'Invalid GPS'}
          </span>
        )}
      </div>

      {/* Debug Info Panel */}
      {gpsData && gpsData.position && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 10,
          fontSize: '11px',
          maxWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>

        </div>
      )}


      <GeolocateControl
        ref={geolocateControlRef}
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        // showAccuracyCircle={true}
        showUserLocation={true}
        style={{ display: 'none' }}
      />


      <main className='flex flex-col gap-4 absolute top-4 right-4 z-10 items-end justify-end w-full'>


        <section className='z-10 w-[48px] h-[48px] flex items-center justify-center bg-green-600 rounded-full shadow-lg cursor-pointer'>
          <p className='text-white text-xl'>{userInitial}</p>
        </section>

        <button
          onClick={() => geolocateControlRef.current?.trigger()} // Trigger geolocation
          style={{
            // position: 'absolute',
            // top: isMobile ? '5vw' : '2vw',
            // right: '80px',
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




      </main>


    </Map>
  );
}

export default MapGL;

