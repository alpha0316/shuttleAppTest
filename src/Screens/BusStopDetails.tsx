import { useState, useEffect, useMemo, Key } from 'react';
import MapGl from '../components/MapGL';

// import { FlyToInterpolator } from 'react-map-gl';
import useMediaQuery from '../components/useMediaQuery';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useClosestStop, } from "./../Screens/ClosestStopContext";
import { useClosestBus } from './useClosestBus';
import { getDistance } from 'geolib';
import { useShuttleSocket } from './../../hooks/useShuttleSocket'
import { locationsss } from '../../data/locations';



interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  dropPoints: DropPoint[];
}


interface DropPoint {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Driver {
  driverID: string;
  busID: string;
  active: boolean;
  busRoute: Route[];
  coords: Coordinates
}

interface Coordinates {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: number;
  heading?: number;
}

interface Route {
  geometry: GeoJSON.Geometry;
  distance: number;
  duration: number;
  start: Coordinates;
  end: Coordinates;
  stops: string[];
}



function BusStopDetails() {

  const busStops = [
    {
      id: 1,
      name: "Brunei",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
    {
      id: 2,
      name: "Main Library",
      color: "bg-amber-50",
      dotColor: "bg-amber-400",
      waiting: "5 waiting",
    },
    {
      id: 3,
      name: "Casley Hayford",
      color: "bg-amber-50",
      dotColor: "bg-amber-400",
      waiting: "20+ waiting",
    },
    {
      id: 4,
      name: "Pentecost Bus Stop",
      color: "bg-red-500/10",
      dotColor: "bg-red-500",
      waiting: "10+ waiting",
    },
    {
      id: 5,
      name: "KSB",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
    {
      id: 6,
      name: "Hall 7",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
    {
      id: 7,
      name: "Brunei",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
    {
      id: 8,
      name: "Commercial Area",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
    {
      id: 9,
      name: "Conti Bus stop",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
    {
      id: 10,
      name: "Gaza",
      color: "bg-green-600/30",
      dotColor: "bg-green-600",
      waiting: "10+ waiting",
    },
  ];

  const isMobile = useMediaQuery('(max-width: 768px)');
  const { id } = useParams();
  const { state } = useLocation();
  const { pickUp, dropOff } = state || {};
  const { closestStopName } = useClosestStop();
  const { arrived, arriveInTwo, setArriveInTwo, setArrived, closest } = useClosestBus()
  const [startPoint, setStartPoint] = useState<Location | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [time, setTime] = useState<string | number | Date | undefined>(undefined);
  const [previousTime, setPreviousTime] = useState<number | null>(null)
  const [distanceMade, setDistanceMade] = useState(0)
  const [timeInMinutes, setTimeInMinutes] = useState<number | null>(null);
  const [reached, setReached] = useState(true);
  const [final, setFinal] = useState(true);
  const [availableBus, SetAvailableBus] = useState(true)
  const [stoppedBus, setStoppedBus] = useState(false)
  const [closeToastModal, setCloseToastModal] = useState(false);
  const [, setBusAtStop] = useState(false);
  const [busRoute, setBusRoute] = useState([])
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [, setShowLocationList] = useState(false);
  const [, setInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'General' | 'Buses'>('General');




  const BASE_CUSTOMER_URL = "https://shuttle-backend-0.onrender.com/api/v1"

  const navigate = useNavigate();
  const shuttles = useShuttleSocket();

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
            driverID: shuttle.driverId || shuttle.shuttleId || shuttle.id || '',
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

    }
  }, [shuttles, busRoute]);

  useEffect(() => {
    // If both pickup and dropOff selected → show tabs
    if (pickUp && dropOff) {
      setShowLocationList(false);   // hide location list
      setInputFocused(false);       // close input dropdown
    }
  }, [pickUp, dropOff]);

  /// fetch from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/drivers/drivers`);

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


  const filteredBusStops = useMemo(() => {
    // Collect all drop point names from the pickup location
    const dropPointNames = pickUp?.dropPoints?.map((dp: { name: any; }) => dp.name) || [];

    // If both pickUp & dropOff selected → show pickUp, dropPoints, dropOff
    if (pickUp && dropOff) {
      return [
        // The pickup stop
        // ...busStops.filter((stop) => stop.name === pickUp.name),

        // Any bus stops that match the drop points of pickup
        ...busStops.filter((stop) => dropPointNames.includes(stop.name)),

        // The dropOff stop
        // ...busStops.filter((stop) => stop.name === dropOff.name),
      ];
    }

    // If only pickUp selected → show pickUp + its drop points + others
    if (pickUp) {
      return [
        ...busStops.filter((stop) => stop.name === pickUp.name),
        ...busStops.filter((stop) => dropPointNames.includes(stop.name)),
      ];
    }

    // If only dropOff selected → show it
    if (dropOff) {
      return [
        ...busStops.filter((stop) => stop.name === dropOff.name),
      ];
    }

    // else show everything
    return busStops;
  }, [pickUp, dropOff, busStops]);



  interface BusStopCardProps {
    name: string;
    color: string;
    dotColor: string;
    waiting: string;
  }

  const BusStopCard = ({ name, color, dotColor, waiting }: BusStopCardProps) => {
    return (
      <>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className={`w-5 p-1.5 ${color} rounded-[50px] inline-flex justify-start items-center gap-2.5`}>
              <div className={`w-2.5 h-2 relative ${dotColor} rounded-3xl`} />
            </div>
            <p className="text-black text-sm font-normal">{name}</p>
          </div>

          <div className="flex gap-2 items-center p-1 bg-neutral-50 rounded-xl">
            <div className="flex">
              <img src="../src/assets/memoji.png" alt="at" />
              <img src="../src/assets/memoji2.png" alt="at" />
              <img src="../src/assets/memoji3.png" alt="at" />
            </div>
            <p className="text-black/50 text-xs font-normal">{waiting}</p>
          </div>
        </div>

        <div className="relative left-2 w-0 h-5 origin-top-left outline-1 outline-offset-[-0.50px] outline-black/10"></div>
      </>
    );
  };

  useEffect(() => {
    // console.log('closest', closest?.isStartInRoute);
    if (closest && closest.driver && closest.driver.coords && closest.isStartInRoute) {
      SetAvailableBus(true)
    } else {
      SetAvailableBus(false)
    }
  },);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (arrived || arriveInTwo) {
      timer = setTimeout(() => {
        setArriveInTwo(false)
        setArrived(false)
      }, 10000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }

  }, [arriveInTwo, arrived])


  useEffect(() => {
    // If timestamp is not on coords, try closest?.driver?.timestamp or update Coordinates type
    setTime(closest?.driver?.coords?.timestamp)
    setSpeed(closest?.driver?.coords?.speed ?? 0);
    // console.log('time', time)
    // console.log('time', speed)
  }, [closest?.driver?.coords])


  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);


useEffect(() => {
  const selectedBusStop = locationsss.find((location) => location.id === id);

  if (selectedBusStop) {
    // Define route configurations with proper typing
    interface RouteConfigs {
      [key: string]: string[];
    }

    const routeConfigs: RouteConfigs = {
      'Main Library->Brunei': ['', 'SRC Busstop', 'Hall 7', 'Commercial Area', 'Conti Busstop'],
      'Main Library->KSB': ['Commercial Area', 'Conti Busstop', 'SRC Busstop', 'Hall 7'],
      'Main Library->Pentecost Busstop': ['Brunei', 'Commercial Area', 'Conti Busstop', 'KSB', 'Hall 7'],
      'Hall 7->KSB': ['Brunei', 'Conti Busstop', 'Main Library', 'Pentecost Busstop'],
      'Hall 7->Pentecost Busstop': ['Brunei', 'Main Library', 'SRC Busstop'],
      'Pentecost Busstop->KSB': ['Bomso Busstop', 'Conti Busstop', 'SRC Busstop', 'Brunei', 'Main Library'],
      'Brunei->KSB': ['Conti Busstop', 'Bomso Busstop', 'Commercial Area', 'SRC Busstop', 'Hall 7'],
      'Brunei->Pentecost Busstop': ['KSB', 'Bomso Busstop', 'Conti Busstop', 'Commercial Area', 'SRC Busstop', 'Hall 7'],
      'SRC Busstop->Main Library': ['', 'Bomso Busstop', 'Conti Busstop', 'Pentecost Busstop'],
      'Main Library->SRC Busstop': ['Brunei', 'Bomso Busstop', 'Conti Busstop', 'KSB', 'Pentecost Busstop'],
      'SRC Busstop->KSB': ['Brunei', 'Bomso Busstop', 'Conti Busstop', 'Main Library', 'Pentecost Busstop', 'Hall 7'],
      'Brunei->Main Library': ['', 'Bomso Busstop', 'Commercial Area', 'SRC Busstop', 'Hall 7'],
      'SRC Busstop->Brunei': ['', 'Bomso Busstop', 'Conti Busstop', 'KSB', 'Pentecost Busstop'],
      'Commercial Area->KSB': ['Brunei', 'Main Library', 'Conti Busstop', 'SRC Busstop'],
      'Commercial Area->Pentecost Busstop': ['Main Library', 'Conti Busstop', 'Brunei'],
      'Commercial Area->Hall 7': ['Main Library', 'Conti Busstop', 'Brunei'],
      'Conti Busstop->Commercial Area': ['KSB', 'Pentecost Busstop', 'SRC Busstop', 'Hall 7'],
      'SRC Busstop->Conti Busstop': ['Commercial Area', 'Bomso Busstop', 'Pentecost Busstop', 'Hall 7'],
      'SRC Busstop->Commercial Area': ['Pentecost Busstop', 'KSB', 'Commercial Area'],
      'KSB->Commercial Area': ['Main Library', 'Bomso Busstop', 'Conti Busstop', 'Pentecost Busstop'],
      'KSB->SRC Busstop': ['Main Library', 'Commercial Area', 'Conti Busstop', 'Pentecost Busstop', 'Brunei'],
      'Gaza->Pharmacy Busstop': [''],
      'Gaza->Medical Village': [''],
      'Pharmacy Busstop->Medical Village': ['Gaza'],
      'Pharmacy Busstop->Gaza': [''],
      'Medical Village->Pharmacy Busstop': ['']
    };

    const routeKey = `${pickUp.name}->${dropOff.name}`;
    const excludedPoints = routeConfigs[routeKey] || []; // Use empty array as default
    
    let updatedBusStop = { ...selectedBusStop };
    
    updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
      (dropPoint) => !excludedPoints.includes(dropPoint.name)
    );
    
    setStartPoint(pickUp);
    setSelectedLocation(updatedBusStop);
  } else {
    console.error('Bus stop not found');
    navigate('/');
  }
}, [id, navigate, pickUp, dropOff, locationsss]);

  const closeModal = () => {
    setCloseToastModal(true)
  }

  const filteredDropPointsForUI = selectedLocation?.dropPoints?.filter(
    (dropPoint: DropPoint) => dropPoint.name !== 'Paa Joe Round About'

  );

  const safeLat = (val: number | undefined): number => val ?? 0
  const safeLng = (val: number | undefined): number => val ?? 0


  const start = {
    lat: safeLat(startPoint?.latitude),
    lng: safeLng(startPoint?.longitude),
  };

  const end = {
    lat: safeLat(dropOff?.latitude),
    lng: safeLng(dropOff?.longitude),
  };

  const distance = getDistance(start, end);

  useEffect(() => {
    if (!time || !speed) return;

    const currentTimeStamp = new Date(time).getTime()

    if (previousTime !== null) {
      const deltaTimeSeconds = (currentTimeStamp - previousTime) / 1000
      const speedInMps = (speed * 1000) / 3600
      const distanceCovered = speedInMps * deltaTimeSeconds
      console.log('distance', distanceCovered)
      console.log('time', deltaTimeSeconds)
      console.log('speed convert', speedInMps)
      setDistanceMade(distanceCovered)

    }
    console.log('speed', speed)

    setPreviousTime(currentTimeStamp)
  }, [time, speed, previousTime])


  useEffect(() => {
    if ((speed ?? 0) <= 1 && !isAtAnyStop.isAtStop) {
      setStoppedBus(true);
    } else {
      setStoppedBus(false);
    }
  }, [speed]);



  const barWidth = 100
  const totalDistance = distance || 1
  const safeCovered = Math.min(distanceMade ?? 0, totalDistance)
  // console.log('safe distance', distanceMade)


  const coverDistance = (safeCovered / totalDistance) * barWidth
  const distanceLeft = Math.max(totalDistance - safeCovered, 0);
  const dynamicDistance = (distanceLeft / totalDistance) * barWidth

  useEffect(() => {

    let time = 0;

    time = distance / (speed || 1);
    // console.log('to cover distance:', coverDistance);
    // console.log('safe:', safeCovered);
    // console.log('total:', totalDistance);

    const minutes = time / 60;
    const fixedMinutes = Math.round(minutes);
    setTimeInMinutes(fixedMinutes);
  })

  // const hasReachedNotified = useRef(false);

  // useEffect(() => {
  //   const reached =
  //     closest?.driver?.coords?.latitude === startPoint?.latitude &&
  //     closest?.driver?.coords?.longitude === startPoint?.longitude;

  //   if (closest?.driver?.coords?.latitude === startPoint?.latitude &&
  //     closest?.driver?.coords?.longitude === startPoint?.longitude) {
  //     setReached(true);
  //     hasReachedNotified.current = true;
  //     console.log('bus', reached);
  //     console.log('driver latude', closest)
  //     console.log('start latotitude', startPoint)


  //     // Reset state after 5 seconds
  //     const timer = setTimeout(() => {
  //       setReached(false);
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }

  //   if (!reached) {
  //     hasReachedNotified.current = false;
  //   }
  // }, [
  //   closest?.driver?.coords?.latitude,
  //   closest?.driver?.coords?.longitude,
  //   startPoint?.latitude,
  //   startPoint?.longitude,
  // ]);

  // useEffect(() => {
  //       console.log('driver latude', closest?.driver?.coords.latitude)
  //     console.log('start latotitude', startPoint?.latitude)
  //   if (closest?.driver?.coords?.latitude === startPoint?.latitude){
  //     console.log('arrive',true)
  //     setReached(true);
  //   } else{
  //     console.log('nahhh', false)
  //     setReached(false);
  //   }
  // }, [closest, startPoint]);


  const BUS_STOP_RADIUS = 5;

  const hasArrivedAtStop = (driverCoords: { latitude: number; longitude: number }, stopCoords: { latitude: number; longitude: number }) => {
    const distance = getDistance(
      { latitude: driverCoords.latitude, longitude: driverCoords.longitude },
      { latitude: stopCoords.latitude, longitude: stopCoords.longitude }
    );
    return distance <= BUS_STOP_RADIUS;
  };

  useEffect(() => {
    if (!closest?.driver?.coords || !startPoint) return;

    const driverCoords = closest.driver.coords;
    const stopCoords = startPoint;

    const arrived = hasArrivedAtStop(driverCoords, stopCoords);

    console.log('Driver Coordsssssssss:', driverCoords);

    console.log(arrived ? "✅ Bus arrived at stop" : "⏳ Approaching...");

    setReached(arrived);
  }, [closest, startPoint]);


  useEffect(() => {
    if (!availableBus) {
      setFinal(false);
      return;
    }


    if (closest?.driver?.coords?.latitude === dropOff?.latitude &&
      closest?.driver?.coords?.longitude === dropOff?.longitude) {
      setFinal(true);
    } else {
      setFinal(false);
    }
  }, [closest?.driver?.coords?.latitude, closest?.driver?.coords?.longitude, dropOff?.latitude, dropOff?.longitude])


  const isAtAnyStop = useMemo(() => {
    if (!closest?.driver?.coords || !selectedLocation) {
      return { isAtStop: false, stopName: null };
    }

    const driverCoords = {
      latitude: closest.driver.coords.latitude,
      longitude: closest.driver.coords.longitude,
    };

    // Check all drop points in the selected route
    for (const dropPoint of selectedLocation.dropPoints) {
      if (hasArrivedAtStop(driverCoords, dropPoint)) {
        return { isAtStop: true, stopName: dropPoint.name };
      }
    }

    // Check the start point
    if (startPoint && hasArrivedAtStop(driverCoords, startPoint)) {
      return { isAtStop: true, stopName: startPoint.name };
    }

    // Optional: Check ALL locations (not just current route)
    for (const location of locationsss) {
      if (hasArrivedAtStop(driverCoords, location)) {
        return { isAtStop: true, stopName: location.name };
      }
    }

    return { isAtStop: false, stopName: null };
  }, [closest?.driver?.coords, selectedLocation, startPoint, locationsss]);

  useEffect(() => {
    if (isAtAnyStop.isAtStop) {
      console.log(`🚌 Bus is currently at: ${isAtAnyStop.stopName}`);
      setBusAtStop(true);
    } else {
      console.log('🚌 Bus is in transit (not at any stop)');
    }
  }, [isAtAnyStop]);

  const BusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="19" viewBox="0 0 56 19" fill="none">
      <g clip-path="url(#clip0_1507_7323)">
        <path d="M38.6878 3.93983C38.6413 4.03586 38.5949 4.13189 38.5471 4.23083C33.1596 4.27885 27.7721 4.32687 22.2213 4.37634C22.2213 7.59342 22.2213 10.8105 22.2213 14.1251C22.5422 14.2909 22.7291 14.292 23.0858 14.2981C23.2061 14.3006 23.3263 14.303 23.4502 14.3055C23.5802 14.3075 23.7102 14.3095 23.8442 14.3115C23.9775 14.3142 24.1107 14.3169 24.248 14.3196C24.6749 14.3282 25.1018 14.3359 25.5287 14.3433C26.0902 14.3532 26.6517 14.3639 27.2132 14.3752C27.3432 14.3771 27.4732 14.3791 27.6072 14.3811C27.7275 14.3836 27.8477 14.386 27.9716 14.3885C28.0776 14.3903 28.1836 14.3922 28.2929 14.394C28.5546 14.4161 28.5546 14.4161 28.8361 14.5616C28.8361 14.6576 28.8361 14.7537 28.8361 14.8526C20.4762 14.8526 12.1163 14.8526 3.50304 14.8526C3.4566 14.6605 3.41016 14.4685 3.3623 14.2706C3.54808 14.2706 3.73386 14.2706 3.92526 14.2706C3.92526 11.2936 3.92526 8.31658 3.92526 5.24936C5.27213 5.24936 6.619 5.24936 8.00669 5.24936C8.00669 4.81721 8.00669 4.38507 8.00669 3.93983C11.9447 3.91745 15.8826 3.89591 19.8206 3.87538C21.649 3.86582 23.4774 3.85599 25.3057 3.84551C26.8989 3.83638 28.492 3.82777 30.0852 3.81978C30.9292 3.81553 31.7731 3.81102 32.6171 3.80589C33.4108 3.80107 34.2045 3.79694 34.9982 3.79335C35.2901 3.7919 35.582 3.79021 35.8739 3.78824C36.2713 3.7856 36.6687 3.78386 37.0661 3.78235C37.1826 3.78136 37.2991 3.78037 37.4191 3.77935C37.8795 3.77841 38.2477 3.78818 38.6878 3.93983Z" fill="#34A853" />
        <path d="M48.3909 3.87523C50.862 2.99391 50.7916 10.8104 50.7916 14.1249C51.1125 14.2908 50.0127 14.3878 50.3694 14.3939C50.4897 14.3963 50.1583 14.5615 52.0205 14.3054C50.1793 14.5586 49.9645 14.6938 52.0821 14.3639C51.482 14.4576 50.8855 14.5442 50.3694 14.6171C50.377 14.6172 50.3659 14.6187 50.3393 14.6213C50.0146 14.6671 49.7228 14.7073 49.4834 14.7403C49.6187 14.7371 49.7496 14.7338 49.8681 14.7305C49.894 14.7277 49.9203 14.7249 49.9472 14.722C49.9926 14.7172 50.0395 14.7121 50.0879 14.707C50.5148 14.7155 49.9425 14.6995 50.3694 14.707C50.4722 14.7088 50.3559 14.715 50.1303 14.7225C50.7938 14.7265 50.708 14.7532 50.5805 14.7815C50.4251 14.8159 50.2077 14.8525 51.2139 14.8525L48.7645 14.8525C48.3532 14.8639 48.1624 14.8624 48.1219 14.8525L32.0734 14.8525L31.9326 14.2704H32.4956V5.24922H36.577V3.93968C40.515 3.91731 44.3176 3.57593 48.3909 3.87523Z" fill="#34A853" />
        <path d="M23.0481 4.79512C23.2223 4.79532 23.2223 4.79532 23.4 4.79553C23.5328 4.79533 23.6656 4.79513 23.8025 4.79492C23.9493 4.79545 24.0962 4.79597 24.2476 4.79651C24.4013 4.79649 24.5551 4.79646 24.7135 4.79644C25.2245 4.79654 25.7355 4.79768 26.2465 4.79882C26.5997 4.79909 26.9529 4.79929 27.3061 4.79944C28.1425 4.79994 28.9788 4.80109 29.8152 4.80255C31.0274 4.80461 32.2396 4.80538 33.4517 4.8063C35.1503 4.80771 36.8488 4.8105 38.5474 4.81303C38.5474 7.83805 38.5474 10.8631 38.5474 13.9798C33.2992 13.9798 28.0511 13.9798 22.6439 13.9798C22.641 12.4943 22.6381 11.0087 22.6351 9.47823C22.6338 9.00859 22.6325 8.53894 22.6312 8.05506C22.6308 7.68542 22.6304 7.31577 22.6301 6.94613C22.6298 6.84948 22.6294 6.75283 22.629 6.65326C22.628 6.3699 22.6279 6.08653 22.6279 5.80317C22.6276 5.64323 22.6273 5.48329 22.627 5.31851C22.6503 4.82215 22.6503 4.82215 23.0481 4.79512Z" fill="#34A853" />
        <path d="M54.3104 2.77579C54.3164 3.01822 54.3161 3.26088 54.3104 3.50331C54.0656 3.75642 53.7202 3.70293 53.3868 3.73066C53.1732 3.74895 53.1732 3.74895 52.9552 3.7676C52.8451 3.77642 52.735 3.78523 52.6215 3.79432C52.6419 3.91192 52.6622 4.02952 52.6831 4.15069C52.7092 4.30618 52.7354 4.46167 52.7623 4.62187C52.7884 4.77548 52.8145 4.9291 52.8414 5.08737C52.8961 5.48929 52.9146 5.863 52.903 6.26788C53.0424 6.31589 53.1817 6.36391 53.3252 6.41338C53.4823 7.18458 53.5146 7.95589 53.466 8.74144C53.4195 8.78945 53.3731 8.83747 53.3252 8.88694C53.3018 9.3962 53.3018 9.3962 53.3252 9.90547C53.3717 9.95348 53.4181 10.0015 53.466 10.051C53.5274 10.9177 53.5227 11.7159 53.1845 12.5245C53.0916 12.5245 52.9987 12.5245 52.903 12.5245C52.9088 12.6716 52.9146 12.8186 52.9206 12.9701C52.9022 13.5694 52.7999 13.9968 52.6215 14.5616C52.8538 14.6096 53.086 14.6576 53.3252 14.7071C53.3252 14.8031 53.3252 14.8991 53.3252 14.9981C53.4617 14.9951 53.5981 14.9921 53.7387 14.989C54.1697 14.9981 54.1697 14.9981 54.3104 15.1436C54.3162 15.4345 54.3164 15.7257 54.3104 16.0166C53.6771 15.9963 53.0437 15.9747 52.4104 15.953C52.2319 15.9472 52.0534 15.9415 51.8695 15.9356C51.6953 15.9295 51.5211 15.9234 51.3417 15.9172C51.1825 15.9118 51.0233 15.9065 50.8593 15.901C50.3697 15.8711 50.3697 15.8711 49.8925 15.7976C49.058 15.6883 48.2219 15.7058 47.382 15.7075C47.1935 15.7073 47.0049 15.7071 46.8163 15.7069C46.4078 15.7064 45.9993 15.7064 45.5908 15.7068C44.926 15.7074 44.2612 15.707 43.5964 15.7065C42.7564 15.7059 41.9163 15.7055 41.0762 15.7055C39.4263 15.7055 37.7764 15.7037 36.1265 15.7012C35.8666 15.7008 35.6068 15.7005 35.3469 15.7001C34.953 15.6995 34.5592 15.6989 34.1654 15.6984C32.682 15.6962 31.1987 15.6942 29.7153 15.6924C29.5798 15.6923 29.4442 15.6921 29.3046 15.6919C27.1054 15.6894 24.9063 15.689 22.7071 15.6892C20.4489 15.6894 18.1907 15.6868 15.9325 15.6818C14.5397 15.6788 13.1469 15.678 11.754 15.6801C10.8003 15.6813 9.84658 15.6799 8.89286 15.6764C8.34235 15.6745 7.79189 15.6737 7.24137 15.6761C6.73759 15.6783 6.23392 15.6772 5.73014 15.6733C5.46124 15.6722 5.19233 15.6746 4.92343 15.6771C3.62183 15.6619 3.62183 15.6619 3.18503 15.2416C2.8629 14.7288 2.85229 14.3898 2.85185 13.7798C2.85034 13.6217 2.85034 13.6217 2.8488 13.4605C2.84643 13.1135 2.84915 12.7669 2.85216 12.4199C2.85204 12.1781 2.8517 11.9362 2.85113 11.6943C2.85073 11.1879 2.8528 10.6816 2.85666 10.1752C2.86146 9.52691 2.86061 8.87875 2.85798 8.23042C2.85649 7.73111 2.85775 7.23183 2.85986 6.73252C2.86059 6.49352 2.86052 6.25451 2.85964 6.0155C2.85887 5.68112 2.86175 5.34698 2.8656 5.01262C2.86647 4.82257 2.86734 4.63252 2.86824 4.4367C2.95967 3.80952 3.03053 3.62355 3.50363 3.2123C4.10126 3.09868 4.69602 3.11457 5.30212 3.12027C5.49067 3.11946 5.67923 3.11832 5.86778 3.1169C6.38641 3.1139 6.90496 3.11543 7.4236 3.11769C7.98274 3.11934 8.54186 3.11679 9.10099 3.11475C10.0701 3.11177 11.0391 3.11144 12.0082 3.11288C13.4103 3.11495 14.8123 3.11288 16.2144 3.10977C18.4903 3.10481 20.7661 3.103 23.042 3.10325C25.2509 3.10348 27.4598 3.10261 29.6687 3.09998C29.8727 3.09974 29.8727 3.09974 30.0808 3.09949C31.5655 3.0977 33.0501 3.09565 34.5348 3.09347C34.9286 3.0929 35.3224 3.09233 35.7162 3.09176C35.9758 3.09138 36.2354 3.091 36.495 3.09062C38.1471 3.08818 39.7993 3.0869 41.4514 3.08688C42.285 3.08685 43.1187 3.08634 43.9523 3.08568C44.6116 3.08519 45.2709 3.08531 45.9302 3.08589C46.3303 3.0861 46.7304 3.08571 47.1304 3.08514C47.4004 3.08493 47.6703 3.08545 47.9403 3.086C48.1009 3.08565 48.2616 3.0853 48.4271 3.08494C48.5655 3.08495 48.7038 3.08496 48.8463 3.08497C49.2697 3.06562 49.6714 2.99799 50.0882 2.92129C50.2935 2.91867 50.4989 2.92159 50.704 2.93039C51.4708 2.94247 52.2121 2.8385 52.9686 2.72098C53.4511 2.6501 53.8467 2.60003 54.3104 2.77579ZM36.4369 3.80156C32.2942 3.81781 28.1515 3.83776 24.0089 3.85912C22.2578 3.86814 20.5068 3.87683 18.7558 3.88551C15.173 3.90328 11.5901 3.92141 8.00728 3.93982C8.00728 4.37197 8.00728 4.80411 8.00728 5.24935C6.6604 5.24935 5.31353 5.24935 3.92585 5.24935C3.92585 8.22636 3.92585 11.2034 3.92585 14.2706C3.69363 14.2706 3.46141 14.2706 3.22215 14.2706C3.26859 14.5107 3.31504 14.7507 3.36289 14.9981C18.4571 14.9981 33.5514 14.9981 49.1031 14.9981C49.1031 14.9021 49.1031 14.806 49.1031 14.7071C49.1898 14.6934 49.2765 14.6797 49.3659 14.6656C49.6757 14.5894 49.6757 14.5894 49.8343 14.3439C50.5302 12.8413 50.5624 11.3177 50.5544 9.67812C50.5543 9.57525 50.5541 9.47239 50.5539 9.36641C50.6207 6.58896 50.6207 6.58896 49.666 4.08532C49.2062 3.77928 48.8357 3.75852 48.2952 3.76012C48.0454 3.75981 48.0454 3.75981 47.7905 3.75949C47.5146 3.7614 47.5146 3.7614 47.2332 3.76334C47.0349 3.76367 46.8365 3.76388 46.6382 3.76397C46.0883 3.76462 45.5384 3.76714 44.9885 3.76996C44.3904 3.77272 43.7924 3.77381 43.1943 3.77515C41.8453 3.77854 40.4964 3.78427 39.1474 3.79039C38.2439 3.79447 37.3404 3.79805 36.4369 3.80156Z" fill="#C4C4C3" />
        <path d="M24.7539 6.99512C28.5623 6.99512 32.3707 6.99512 36.2945 6.99512C36.2945 8.57965 36.2945 10.1642 36.2945 11.7967C32.4861 11.7967 28.6777 11.7967 24.7539 11.7967C24.7539 10.2122 24.7539 8.62767 24.7539 6.99512Z" fill="#34A853" />
        <path d="M51.4335 3.63041C51.5317 3.62984 51.6299 3.62928 51.7312 3.6287C52.4624 3.63017 52.4624 3.63017 52.6209 3.7941C52.6774 4.07164 52.7259 4.35091 52.7705 4.63074C52.7953 4.78304 52.8202 4.93534 52.8458 5.09226C52.8962 5.49124 52.9132 5.86612 52.9024 6.26766C53.0418 6.31567 53.1811 6.36369 53.3246 6.41316C53.4817 7.18436 53.514 7.95567 53.4654 8.74122C53.4189 8.78923 53.3725 8.83725 53.3246 8.88672C53.3012 9.39598 53.3012 9.39598 53.3246 9.90525C53.3943 9.97727 53.3943 9.97727 53.4654 10.0508C53.5268 10.9175 53.5221 11.7157 53.1839 12.5243C53.091 12.5243 52.9981 12.5243 52.9024 12.5243C52.9082 12.6714 52.914 12.8184 52.92 12.9699C52.9016 13.5691 52.7993 13.9966 52.6209 14.5614C52.8067 14.6094 52.9925 14.6574 53.1839 14.7069C53.1839 14.8029 53.1839 14.8989 53.1839 14.9979C52.6097 15.139 52.067 15.1674 51.4774 15.1707C51.22 15.1738 51.22 15.1738 50.9574 15.1769C50.5099 15.1434 50.5099 15.1434 50.0876 14.8524C50.1308 14.7342 50.174 14.616 50.2185 14.4943C51.1339 11.365 51.0866 6.89231 50.0876 3.7941C50.5169 3.57222 50.9632 3.6277 51.4335 3.63041Z" fill="#282828" />
        <path d="M22.2208 4.37638C24.4204 4.37299 26.62 4.37042 28.8196 4.36884C29.8408 4.36809 30.862 4.36707 31.8833 4.3654C32.7731 4.36396 33.6629 4.36301 34.5527 4.36269C35.0241 4.3625 35.4955 4.36205 35.9669 4.361C36.4924 4.35995 37.0178 4.35979 37.5432 4.35986C37.7006 4.35934 37.858 4.35882 38.0202 4.35828C38.1625 4.35848 38.3048 4.35868 38.4514 4.35888C38.6381 4.35868 38.6381 4.35868 38.8284 4.35848C39.1095 4.37638 39.1095 4.37638 39.2503 4.52188C39.2635 4.82543 39.2668 5.12945 39.2662 5.43331C39.2663 5.52841 39.2663 5.62352 39.2663 5.72151C39.2662 6.03722 39.2651 6.35292 39.264 6.66863C39.2637 6.88699 39.2635 7.10535 39.2634 7.32371C39.2629 7.89948 39.2615 8.47525 39.2599 9.05102C39.2585 9.63813 39.2578 10.2252 39.2571 10.8124C39.2556 11.9651 39.2532 13.1179 39.2503 14.2706C37.0323 14.274 34.8144 14.2766 32.5965 14.2782C31.5667 14.2789 30.537 14.2799 29.5072 14.2816C28.61 14.283 27.7128 14.284 26.8156 14.2843C26.3402 14.2845 25.8649 14.285 25.3895 14.286C24.8597 14.2871 24.3299 14.2872 23.8001 14.2871C23.6413 14.2877 23.4826 14.2882 23.3191 14.2887C23.1038 14.2884 23.1038 14.2884 22.8843 14.2881C22.7588 14.2883 22.6334 14.2884 22.5041 14.2885C22.2208 14.2706 22.2208 14.2706 22.0801 14.1251C22.0661 13.832 22.0621 13.5385 22.0619 13.245C22.0614 13.0566 22.061 12.8682 22.0605 12.6741C22.0608 12.4668 22.0611 12.2595 22.0614 12.0523C22.0613 11.8411 22.0612 11.63 22.061 11.4188C22.0608 10.9757 22.0611 10.5325 22.0618 10.0893C22.0626 9.52061 22.0621 8.95189 22.0613 8.38315C22.0607 7.9469 22.0609 7.51065 22.0613 7.0744C22.0614 6.86468 22.0612 6.65496 22.0609 6.44524C22.0606 6.15226 22.0612 5.85928 22.0619 5.56631C22.062 5.39937 22.0621 5.23244 22.0622 5.06046C22.0801 4.66739 22.0801 4.66739 22.2208 4.37638ZM22.6431 4.95839C22.6298 5.23966 22.6265 5.52143 22.6271 5.80303C22.6271 5.98617 22.6271 6.16931 22.6271 6.358C22.6278 6.554 22.6286 6.75 22.6293 6.946C22.6295 7.12319 22.6296 7.30038 22.6297 7.48295C22.6305 8.148 22.6324 8.81305 22.6343 9.4781C22.6372 10.9636 22.6401 12.4491 22.6431 13.9796C27.8912 13.9796 33.1394 13.9796 38.5466 13.9796C38.5466 10.9546 38.5466 7.92958 38.5466 4.81289C35.7484 4.80866 35.7484 4.80866 32.9503 4.80579C31.8098 4.80491 30.6694 4.8039 29.529 4.80191C28.6101 4.80031 27.6912 4.79946 26.7722 4.79909C26.4208 4.79882 26.0693 4.79829 25.7179 4.79751C25.2275 4.79646 24.7371 4.7963 24.2467 4.79637C24.0999 4.79585 23.953 4.79533 23.8016 4.79479C23.6688 4.79499 23.536 4.79519 23.3991 4.79539C23.283 4.79526 23.1669 4.79512 23.0473 4.79499C22.7818 4.78297 22.7818 4.78297 22.6431 4.95839Z" fill="#34A853" fill-opacity="0.6" />
        <path d="M4.2458 3.11816C4.34383 3.12028 4.44185 3.1224 4.54285 3.12459C4.64793 3.12396 4.75301 3.12334 4.86127 3.1227C5.21359 3.1215 5.56567 3.12551 5.91796 3.12948C6.1704 3.12969 6.42284 3.12957 6.67528 3.12916C7.36093 3.12895 8.04649 3.13323 8.73212 3.13831C9.44851 3.14285 10.1649 3.14328 10.8813 3.14415C12.2381 3.14641 13.5948 3.15238 14.9515 3.15968C16.4961 3.16781 18.0406 3.17181 19.5851 3.17546C22.7625 3.18307 25.9399 3.19587 29.1172 3.21207C29.1172 3.35612 29.1172 3.50017 29.1172 3.64858C28.9879 3.64818 28.8586 3.64778 28.7254 3.64736C25.581 3.63773 22.4367 3.6305 19.2924 3.62597C17.7718 3.62372 16.2513 3.62064 14.7307 3.61565C13.4056 3.61131 12.0806 3.60849 10.7555 3.60751C10.0536 3.60694 9.3518 3.6056 8.64997 3.60243C7.98968 3.59947 7.32941 3.59855 6.66911 3.59921C6.42651 3.59909 6.18391 3.59822 5.94131 3.59655C5.61052 3.59438 5.27983 3.5949 4.94904 3.59609C4.76378 3.59569 4.57852 3.59529 4.38765 3.59487C3.8976 3.65176 3.70121 3.7219 3.36199 4.08509C3.31554 4.22914 3.2691 4.37319 3.22125 4.52161C3.45347 4.52161 3.68568 4.52161 3.92494 4.52161C3.97139 4.32954 4.01783 4.13748 4.06568 3.93959C4.06568 4.32372 4.06568 4.70785 4.06568 5.10362C5.27322 5.10362 6.48076 5.10362 7.72489 5.10362C7.72489 4.71949 7.72489 4.33536 7.72489 3.93959C7.77134 3.93959 7.81778 3.93959 7.86563 3.93959C7.86563 4.37174 7.86563 4.80388 7.86563 5.24912C6.5652 5.24912 5.26478 5.24912 3.92494 5.24912C3.92494 8.17811 3.92494 11.1071 3.92494 14.1248C3.59983 14.1248 3.27473 14.1248 2.93977 14.1248C2.92672 12.8094 2.91672 11.494 2.9106 10.1786C2.90766 9.56771 2.90368 8.95691 2.8973 8.34608C2.89118 7.75644 2.88781 7.16683 2.88636 6.57715C2.88532 6.35235 2.88329 6.12756 2.88025 5.90278C2.87615 5.58752 2.8756 5.27244 2.87586 4.95716C2.87461 4.77783 2.87336 4.59851 2.87207 4.41375C2.99683 3.5399 3.37843 3.13207 4.2458 3.11816Z" fill="#BABABA" />
        <path d="M4.92617 3.44997C5.07761 3.44926 5.07761 3.44926 5.2321 3.44853C5.57042 3.44747 5.90866 3.44953 6.24697 3.45158C6.48947 3.45146 6.73198 3.45116 6.97448 3.45068C7.63307 3.44993 8.29163 3.4519 8.95022 3.45439C9.63856 3.45658 10.3269 3.45641 11.0153 3.45653C12.1708 3.45706 13.3264 3.45924 14.4819 3.46252C15.9671 3.46673 17.4523 3.46823 18.9375 3.46888C20.2124 3.46945 21.4873 3.47127 22.7622 3.47329C23.1731 3.47389 23.5839 3.47431 23.9948 3.47472C24.639 3.47543 25.2833 3.47691 25.9275 3.479C26.1646 3.47966 26.4017 3.48007 26.6388 3.48022C26.9611 3.48048 27.2833 3.48162 27.6056 3.48301C27.7863 3.48344 27.9671 3.48387 28.1533 3.48432C28.5537 3.50344 28.5537 3.50344 28.6945 3.64895C28.9923 3.66698 29.2907 3.67485 29.589 3.67882C29.6823 3.68026 29.7757 3.6817 29.8719 3.68319C30.1818 3.6878 30.4917 3.69139 30.8017 3.69498C31.0161 3.69798 31.2304 3.70103 31.4448 3.70415C32.01 3.71219 32.5753 3.71938 33.1405 3.72639C33.7169 3.73369 34.2933 3.74179 34.8697 3.74983C36.0013 3.7655 37.133 3.78026 38.2647 3.79445C38.2647 3.84247 38.2647 3.89048 38.2647 3.93995C28.2793 3.93995 18.2938 3.93995 8.00583 3.93995C8.00583 4.3721 8.00583 4.80424 8.00583 5.24949C7.91294 5.20147 7.82005 5.15345 7.72435 5.10398C7.44859 5.0916 7.17242 5.08839 6.89641 5.08977C6.65013 5.09048 6.65013 5.09048 6.39888 5.09119C6.22671 5.09241 6.05454 5.09363 5.87715 5.09489C5.70389 5.09554 5.53064 5.0962 5.35213 5.09688C4.92312 5.0986 4.49413 5.10099 4.06514 5.10398C4.01869 4.91192 3.97225 4.71985 3.9244 4.52197C3.69218 4.52197 3.45996 4.52197 3.2207 4.52197C3.27011 4.15166 3.32934 3.97339 3.58691 3.70515C4.04929 3.4288 4.39314 3.44934 4.92617 3.44997Z" fill="#CFCFCF" />
        <path d="M3.22144 14.2699C3.36077 14.3419 3.36077 14.3419 3.50291 14.4154C3.50291 14.5594 3.50291 14.7035 3.50291 14.8519C11.8628 14.8519 20.2227 14.8519 28.8359 14.8519C28.8359 14.7559 28.8359 14.6598 28.8359 14.5609C26.746 14.5129 24.656 14.4649 22.5027 14.4154C22.5027 14.3674 22.5027 14.3194 22.5027 14.2699C27.9831 14.2699 33.4634 14.2699 39.1099 14.2699C38.9706 14.4139 38.8312 14.558 38.6877 14.7064C43.8429 14.7784 43.8429 14.7784 49.1024 14.8519C49.1024 14.8999 49.1024 14.9479 49.1024 14.9974C34.0081 14.9974 18.9138 14.9974 3.36217 14.9974C3.31573 14.7573 3.26929 14.5173 3.22144 14.2699Z" fill="#34A853" />
        <path d="M2.93945 4.66748C3.26456 4.66748 3.58967 4.66748 3.92463 4.66748C3.92463 7.78853 3.92463 10.9096 3.92463 14.1252C3.59952 14.1252 3.27441 14.1252 2.93945 14.1252C2.93945 11.0042 2.93945 7.88311 2.93945 4.66748Z" fill="#4B4B4B" />
        <path d="M51.3893 3.62952C51.517 3.62989 51.6447 3.63027 51.7763 3.63065C51.9679 3.63009 51.9679 3.63009 52.1634 3.62952C52.48 3.64884 52.48 3.64884 52.6208 3.79434C52.6772 4.07189 52.7257 4.35115 52.7703 4.63099C52.7951 4.78329 52.82 4.93559 52.8456 5.09251C52.896 5.49149 52.913 5.86636 52.9022 6.26791C53.0416 6.31592 53.1809 6.36394 53.3244 6.41341C53.5294 7.42013 53.6338 8.39288 53.1837 9.32348C52.6728 9.32348 52.1619 9.32348 51.6356 9.32348C51.6124 8.99909 51.6124 8.99909 51.5888 8.66815C51.4738 7.14302 51.3351 5.65989 51.0006 4.16833C50.9779 4.04492 50.9552 3.9215 50.9319 3.79434C51.0726 3.64884 51.0726 3.64884 51.3893 3.62952Z" fill="#3E3E3E" />
        <path d="M24.7539 6.99512C28.5623 6.99512 32.3707 6.99512 36.2945 6.99512C36.2945 8.57965 36.2945 10.1642 36.2945 11.7967C32.4861 11.7967 28.6777 11.7967 24.7539 11.7967C24.7539 10.2122 24.7539 8.62767 24.7539 6.99512ZM25.0354 7.28612C25.0354 8.67859 25.0354 10.0711 25.0354 11.5057C28.658 11.5057 32.2806 11.5057 36.013 11.5057C36.013 10.1133 36.013 8.72079 36.013 7.28612C32.3904 7.28612 28.7678 7.28612 25.0354 7.28612Z" fill="#D4D4D4" />
        <path d="M54.3084 2.77616C54.3145 3.01858 54.3142 3.26124 54.3084 3.50368C54.0546 3.76616 53.6657 3.68367 53.3227 3.69522C53.1517 3.70131 52.9807 3.70741 52.8046 3.71369C52.6245 3.71941 52.4444 3.72513 52.2589 3.73102C52.0783 3.73731 51.8977 3.74359 51.7116 3.75007C51.2637 3.76556 50.8157 3.7804 50.3677 3.79468C50.3677 4.23028 50.4386 4.61989 50.5179 5.04606C50.8763 7.04654 50.8311 9.04258 50.79 11.0699C50.7435 11.0699 50.6971 11.0699 50.6492 11.0699C50.6457 10.9569 50.6422 10.844 50.6385 10.7277C50.6221 10.2112 50.6049 9.69477 50.5877 9.17831C50.5821 9.00069 50.5766 8.82307 50.5709 8.64007C50.498 6.2335 50.498 6.2335 49.5233 4.08569C49.1398 3.95352 48.8728 3.91347 48.4749 3.89415C48.3556 3.88805 48.2363 3.88196 48.1134 3.87568C47.9894 3.86995 47.8654 3.86423 47.7377 3.85834C47.6121 3.85206 47.4864 3.84577 47.357 3.8393C47.047 3.82388 46.7371 3.80903 46.4271 3.79468C46.4271 3.69865 46.4271 3.60262 46.4271 3.50368C43.9191 3.50368 41.4111 3.50368 38.8271 3.50368C38.8271 3.45566 38.8271 3.40764 38.8271 3.35817C38.9244 3.35667 39.0217 3.35517 39.1219 3.35363C40.0491 3.33923 40.9762 3.3243 41.9034 3.3088C42.3798 3.30085 42.8562 3.29309 43.3326 3.28581C46.7221 3.28328 46.7221 3.28328 50.0863 2.92166C50.2915 2.91904 50.4969 2.92195 50.702 2.93075C51.4688 2.94284 52.2101 2.83887 52.9667 2.72134C53.4491 2.65046 53.8448 2.60039 54.3084 2.77616Z" fill="#BAB0A5" />
        <path d="M29.1354 7.72168C29.3049 7.74503 29.3049 7.74503 29.4779 7.76885C29.648 7.79052 29.648 7.79052 29.8215 7.81262C30.1024 7.86889 30.1024 7.86889 30.2431 8.01439C30.2573 8.42206 30.2627 8.82535 30.2607 9.23298C30.2616 9.40348 30.2616 9.40348 30.2624 9.57742C30.2616 10.0626 30.2518 10.4612 30.1024 10.9245C29.8796 10.9324 29.6568 10.938 29.4339 10.9427C29.3098 10.946 29.1857 10.9494 29.0579 10.9529C28.6769 10.923 28.4662 10.8122 28.1321 10.6335C28.0392 10.6815 27.9463 10.7295 27.8506 10.779C27.8506 9.96268 27.8506 9.14641 27.8506 8.3054C28.0828 8.20937 28.315 8.11333 28.5543 8.01439C28.8358 7.72338 28.8358 7.72338 29.1354 7.72168Z" fill="#E5E7E6" />
        <path d="M53.1831 9.46924C53.5814 10.1654 53.5217 10.8655 53.4646 11.6518C53.3239 12.1883 53.3239 12.1883 53.1831 12.5248C53.0902 12.5248 52.9973 12.5248 52.9016 12.5248C52.9104 12.7454 52.9104 12.7454 52.9192 12.9704C52.9008 13.5696 52.7986 13.9971 52.6202 14.5619C52.8059 14.6099 52.9917 14.6579 53.1831 14.7074C53.1831 14.8034 53.1831 14.8994 53.1831 14.9984C52.5626 15.1588 51.9891 15.155 51.3535 15.1439C51.4928 15.0719 51.4928 15.0719 51.635 14.9984C51.6321 14.8333 51.6292 14.6683 51.6262 14.4982C51.635 13.9798 51.635 13.9798 51.7757 13.8343C52.1303 12.4624 52.1409 11.025 52.1979 9.61474C52.6202 9.46924 52.6202 9.46924 53.1831 9.46924Z" fill="#595959" />
        <path d="M51.0721 3.6489C51.4368 5.55624 51.7335 7.37495 51.635 9.32354C52.1459 9.32354 52.6568 9.32354 53.1832 9.32354C53.1832 9.37155 53.1832 9.41957 53.1832 9.46904C52.4401 9.46904 51.697 9.46904 50.9313 9.46904C50.894 9.15694 50.8566 8.84483 50.8181 8.52327C50.781 8.21744 50.7437 7.91164 50.7063 7.60584C50.6807 7.39505 50.6553 7.18424 50.6301 6.97338C50.4403 5.36818 50.4403 5.36818 50.0869 3.7944C50.4335 3.61523 50.6892 3.63848 51.0721 3.6489Z" fill="#212121" />
        <path d="M33.6208 7.86865C33.853 7.91667 34.0852 7.96468 34.3245 8.01416C34.3709 8.20622 34.4174 8.39829 34.4652 8.59617C34.651 8.59617 34.8368 8.59617 35.0282 8.59617C35.0282 8.78823 35.0282 8.9803 35.0282 9.17818C34.5529 9.10001 34.0857 9.01658 33.6208 8.88718C33.6469 8.97421 33.6731 9.06124 33.7 9.1509C33.7615 9.46919 33.7615 9.46919 33.6208 9.9057C33.853 9.9057 34.0852 9.9057 34.3245 9.9057C34.3245 9.80967 34.3245 9.71364 34.3245 9.6147C34.5567 9.56668 34.7889 9.51866 35.0282 9.46919C35.0282 9.70927 35.0282 9.94935 35.0282 10.1967C34.8424 10.1967 34.6566 10.1967 34.4652 10.1967C34.4188 10.3888 34.3723 10.5808 34.3245 10.7787C34.0923 10.8267 33.8601 10.8748 33.6208 10.9242C33.586 10.8342 33.5511 10.7442 33.5152 10.6514C33.3379 10.2755 33.3379 10.2755 32.7764 10.0512C32.7764 9.52303 32.7764 8.99485 32.7764 8.45067C33.0086 8.40265 33.2408 8.35463 33.4801 8.30516C33.5265 8.16111 33.5729 8.01707 33.6208 7.86865Z" fill="#CCCCCC" />
        <path d="M4.20617 4.08545C5.36727 4.08545 6.52836 4.08545 7.72464 4.08545C7.72464 4.42156 7.72464 4.75768 7.72464 5.10397C6.5171 5.10397 5.30956 5.10397 4.06543 5.10397C4.11187 4.76786 4.15832 4.43175 4.20617 4.08545Z" fill="#D7D7D7" />
        <path d="M51.916 3.6488C52.2643 3.72083 52.2643 3.72083 52.6197 3.79431C52.6673 4.07002 52.7141 4.34591 52.7604 4.62186C52.7866 4.77547 52.8127 4.92909 52.8396 5.08736C52.8942 5.48928 52.9128 5.86299 52.9012 6.26787C53.0405 6.31588 53.1799 6.3639 53.3234 6.41337C53.479 7.17749 53.5406 7.96313 53.4641 8.74143C53.3713 8.88548 53.2784 9.02953 53.1827 9.17794C52.9969 9.17794 52.8111 9.17794 52.6197 9.17794C52.6119 9.05605 52.6041 8.93415 52.5961 8.80857C52.5669 8.35677 52.5372 7.90502 52.5072 7.45328C52.4943 7.25768 52.4816 7.06207 52.4691 6.86644C52.4512 6.58541 52.4324 6.30444 52.4135 6.02347C52.4025 5.85431 52.3914 5.68515 52.38 5.51087C52.3622 5.11093 52.3622 5.11093 52.1975 4.81283C52.2004 4.66878 52.2033 4.52474 52.2063 4.37632C52.2459 3.92269 52.2459 3.92269 51.916 3.6488Z" fill="#717171" />
        <path d="M54.3093 2.77602C54.3153 3.01845 54.315 3.26111 54.3093 3.50354C54.1686 3.64905 54.1686 3.64905 53.7521 3.66556C53.57 3.6648 53.388 3.66404 53.2004 3.66326C53.0555 3.66295 53.0555 3.66295 52.9076 3.66263C52.5978 3.66181 52.2881 3.65999 51.9783 3.65814C51.7688 3.65741 51.5592 3.65675 51.3497 3.65615C50.835 3.65454 50.3203 3.65203 49.8057 3.64905C49.8057 3.40896 49.8057 3.16888 49.8057 2.92153C49.9015 2.9249 49.9972 2.92828 50.0959 2.93176C51.077 2.95064 52.0137 2.87328 52.9816 2.72125C53.4603 2.6498 53.8491 2.60247 54.3093 2.77602Z" fill="#C0C0C0" />
        <path d="M52.2067 9.45972C52.4114 9.46422 52.4114 9.46422 52.6202 9.46881C52.4808 9.51683 52.3415 9.56484 52.1979 9.61431C52.2012 9.78481 52.2045 9.9553 52.2078 10.131C52.2247 11.401 52.2009 12.591 51.9165 13.8339C51.8931 13.959 51.8696 14.0841 51.8455 14.213C51.7757 14.5614 51.7757 14.5614 51.635 14.9979C51.3447 15.098 51.3447 15.098 51.072 15.1435C51.1451 14.4886 51.2365 13.8453 51.3535 13.1973C51.5055 12.2906 51.5519 11.3878 51.5869 10.4698C51.6276 9.47194 51.6276 9.47194 52.2067 9.45972Z" fill="#444444" />
        <path d="M4.90322 3.46053C5.0426 3.46145 5.0426 3.46145 5.18479 3.4624C5.48022 3.46483 5.77552 3.47031 6.07091 3.47587C6.27176 3.47807 6.4726 3.48006 6.67345 3.48184C7.16462 3.48664 7.6557 3.49417 8.14681 3.50316C8.10037 4.07935 8.05392 4.65554 8.00607 5.2492C7.95963 5.2492 7.91319 5.2492 7.86533 5.2492C7.79567 4.67301 7.79567 4.67301 7.7246 4.08517C6.5635 4.08517 5.4024 4.08517 4.20612 4.08517C4.15968 4.1812 4.11323 4.27724 4.06538 4.37618C3.92464 4.52168 3.92464 4.52168 3.564 4.53078C3.39419 4.52627 3.39419 4.52627 3.22095 4.52168C3.2705 4.15024 3.32973 3.97283 3.5886 3.70418C4.04452 3.43144 4.37845 3.45363 4.90322 3.46053Z" fill="#C5C5C5" />
        <path d="M52.7614 9.6145C52.9008 9.6145 53.0401 9.6145 53.1836 9.6145C53.6022 10.2636 53.5197 10.8901 53.4651 11.6516C53.3244 12.1881 53.3244 12.1881 53.1836 12.5246C53.0908 12.5246 52.9979 12.5246 52.9022 12.5246C52.9109 12.7451 52.9109 12.7451 52.9198 12.9702C52.9014 13.5694 52.7991 13.9968 52.6207 14.5616C52.8065 14.6096 52.9922 14.6577 53.1836 14.7071C53.1836 14.8032 53.1836 14.8992 53.1836 14.9981C52.5567 15.0702 52.5567 15.0702 51.917 15.1436C52.0099 14.9996 52.1028 14.8555 52.1985 14.7071C52.2546 14.424 52.3005 14.1386 52.3392 13.8523C52.4515 13.0253 52.4515 13.0253 52.6284 12.6263C52.8251 12.0455 52.7911 11.4888 52.779 10.8786C52.7777 10.7569 52.7765 10.6353 52.7752 10.51C52.7719 10.2115 52.7668 9.91298 52.7614 9.6145Z" fill="#848484" />
        <path d="M53.1845 14.707C53.2309 14.8031 53.2774 14.8991 53.3252 14.998C53.4617 14.995 53.5981 14.992 53.7386 14.9889C54.1697 14.998 54.1697 14.998 54.3104 15.1435C54.3161 15.4345 54.3164 15.7256 54.3104 16.0166C53.6682 15.9963 53.0261 15.9747 52.384 15.9529C52.202 15.9472 52.0199 15.9415 51.8324 15.9356C51.6568 15.9295 51.4813 15.9234 51.3005 15.9171C51.139 15.9118 50.9776 15.9064 50.8113 15.9009C50.4162 15.8742 50.0513 15.8172 49.666 15.7256C49.7589 15.5335 49.8518 15.3414 49.9475 15.1435C49.9939 15.2396 50.0404 15.3356 50.0882 15.4345C51.11 15.3865 52.1318 15.3385 53.1845 15.289C53.138 15.193 53.0916 15.097 53.0438 14.998C53.0902 14.902 53.1366 14.806 53.1845 14.707Z" fill="#CECCCB" />
        <path d="M51.6357 3.6488C51.9841 3.72083 51.9841 3.72083 52.3394 3.79431C52.3365 3.95636 52.3336 4.11842 52.3306 4.28538C52.3023 4.78841 52.3023 4.78841 52.4802 5.10384C52.5136 5.48957 52.5398 5.87226 52.5593 6.25877C52.5653 6.36952 52.5713 6.48026 52.5774 6.59436C52.6212 7.45597 52.6371 8.31516 52.6209 9.17794C52.8067 9.22596 52.9925 9.27397 53.1839 9.32344C52.9517 9.32344 52.7194 9.32344 52.4802 9.32344C52.2525 8.906 52.1612 8.59354 52.1454 8.11565C52.1406 7.99739 52.1358 7.87913 52.1308 7.75729C52.1271 7.63491 52.1234 7.51252 52.1195 7.38643C52.0906 6.5664 52.0452 5.76878 51.9172 4.95834C51.8708 4.95834 51.8243 4.95834 51.7765 4.95834C51.73 4.52619 51.6836 4.09404 51.6357 3.6488Z" fill="#5C5C5C" />
        <path d="M38.2646 14.998C38.4039 14.998 38.5432 14.998 38.6868 14.998C38.6868 15.0941 38.6868 15.1901 38.6868 15.2891C39.4299 15.2891 40.173 15.2891 40.9386 15.2891C40.9386 15.3371 40.9386 15.3851 40.9386 15.4346C38.5083 15.6361 36.0793 15.5689 33.6446 15.5226C33.085 15.5122 32.5253 15.5028 31.9657 15.4934C30.8752 15.4748 29.7848 15.4551 28.6943 15.4346C28.6943 15.3385 28.6943 15.2425 28.6943 15.1436C28.8122 15.1439 28.93 15.1442 29.0514 15.1445C30.1594 15.1474 31.2674 15.1497 32.3754 15.1511C32.9451 15.1519 33.5148 15.1529 34.0845 15.1545C34.6339 15.1561 35.1832 15.157 35.7325 15.1574C35.9426 15.1576 36.1526 15.1582 36.3627 15.1589C36.6559 15.16 36.9491 15.1601 37.2423 15.1601C37.4931 15.1606 37.4931 15.1606 37.7489 15.161C38.1128 15.1877 38.1128 15.1877 38.2646 14.998Z" fill="#A8A8A8" />
        <path d="M28.8352 7.72314C29.1211 7.73565 29.1211 7.73565 29.4685 7.77771C29.6405 7.7974 29.6405 7.7974 29.816 7.81749C30.1018 7.86865 30.1018 7.86865 30.2426 8.01415C30.2624 8.40273 30.2486 8.78886 30.2426 9.17818C29.9985 9.2731 29.9985 9.2731 29.6796 9.32368C29.3784 9.17875 29.3784 9.17875 29.0815 8.96902C28.9821 8.90018 28.8826 8.83135 28.7802 8.76043C28.7055 8.70622 28.6307 8.65201 28.5537 8.59617C28.6769 7.88684 28.6769 7.88684 28.8352 7.72314Z" fill="#CBCCCC" />
        <path d="M28.3525 9.45959C28.5223 9.4641 28.5223 9.4641 28.6956 9.46869C28.6956 9.61274 28.6956 9.75679 28.6956 9.9052C28.9278 9.95322 29.16 10.0012 29.3993 10.0507C29.4872 10.3235 29.4872 10.3235 29.54 10.6327C29.4471 10.7287 29.3542 10.8248 29.2585 10.9237C28.9243 10.8692 28.9243 10.8692 28.5548 10.7782C28.369 10.7782 28.1833 10.7782 27.9919 10.7782C27.9454 10.7782 27.899 10.7782 27.8511 10.7782C27.8374 9.88303 27.8374 9.88303 27.8511 9.61419C27.9919 9.46869 27.9919 9.46869 28.3525 9.45959Z" fill="#C8C9C9" />
        <path d="M46.9912 14.9983C47.3548 14.9944 47.7183 14.9915 48.0819 14.9892C48.1846 14.988 48.2873 14.9868 48.3931 14.9855C48.8893 14.9832 49.3289 15.0051 49.806 15.1438C49.7595 15.3359 49.7131 15.5279 49.6653 15.7258C48.7828 15.6778 47.9004 15.6298 46.9912 15.5803C46.9912 15.3882 46.9912 15.1962 46.9912 14.9983Z" fill="#B8A898" />
        <path d="M53.1827 9.61423C53.0433 9.61423 52.904 9.61423 52.7604 9.61423C52.7739 9.79485 52.7873 9.97547 52.8011 10.1616C52.817 10.4005 52.8327 10.6394 52.8484 10.8783C52.8575 10.9971 52.8666 11.1159 52.8759 11.2384C52.9173 11.8987 52.9088 12.3542 52.6197 12.9608C52.566 13.2992 52.5177 13.6387 52.479 13.9793C52.4325 13.9793 52.3861 13.9793 52.3382 13.9793C52.3382 12.5388 52.3382 11.0984 52.3382 9.61423C52.6888 9.43301 52.8183 9.5012 53.1827 9.61423ZM52.1975 13.9793C52.2439 13.9793 52.2904 13.9793 52.3382 13.9793C52.3382 14.3154 52.3382 14.6516 52.3382 14.9979C52.1989 14.9979 52.0596 14.9979 51.916 14.9979C52.0392 14.3067 52.0392 14.3067 52.1975 13.9793Z" fill="#6C6C6C" />
        <path d="M29.1175 3.21216C29.1175 3.35621 29.1175 3.50026 29.1175 3.64867C26.2845 3.64867 23.4514 3.64867 20.5325 3.64867C20.5325 3.55264 20.5325 3.4566 20.5325 3.35766C21.5895 3.33865 22.6465 3.31967 23.7035 3.30075C24.1943 3.29196 24.6851 3.28316 25.1759 3.27432C25.7401 3.26417 26.3043 3.25408 26.8685 3.24399C27.0448 3.2408 27.2212 3.23762 27.4029 3.23434C27.648 3.22997 27.648 3.22997 27.8981 3.22551C28.0422 3.22293 28.1862 3.22035 28.3347 3.21768C28.5956 3.21369 28.8566 3.21216 29.1175 3.21216Z" fill="#ABABAB" />
        <path d="M38.8281 3.35803C41.5219 3.35803 44.2156 3.35803 46.991 3.35803C46.991 3.50208 46.991 3.64613 46.991 3.79454C46.8052 3.79454 46.6194 3.79454 46.428 3.79454C46.428 3.69851 46.428 3.60248 46.428 3.50354C43.9201 3.50354 41.4121 3.50354 38.8281 3.50354C38.8281 3.45552 38.8281 3.4075 38.8281 3.35803Z" fill="#B5B5B5" />
        <path d="M32.7761 7.72314C33.5192 7.72314 34.2623 7.72314 35.0279 7.72314C35.0744 8.20331 35.1208 8.68347 35.1687 9.17818C34.9829 9.08215 34.7971 8.98612 34.6057 8.88717C34.7451 8.88717 34.8844 8.88717 35.0279 8.88717C35.0279 8.79114 35.0279 8.69511 35.0279 8.59617C34.8422 8.59617 34.6564 8.59617 34.465 8.59617C34.3721 8.4041 34.2792 8.21204 34.1835 8.01415C33.6377 7.95102 33.6377 7.95102 33.3743 8.23241C33.3162 8.30443 33.2582 8.37646 33.1983 8.45066C33.059 8.40265 32.9197 8.35463 32.7761 8.30516C32.7761 8.11309 32.7761 7.92103 32.7761 7.72314Z" fill="#DDDEDE" />
        <path d="M32.7762 10.051C33.2211 10.2503 33.3382 10.3404 33.6207 10.7785C33.8529 10.7305 34.0851 10.6825 34.3244 10.633C34.3708 10.489 34.4173 10.3449 34.4651 10.1965C34.6973 10.2445 34.9295 10.2926 35.1688 10.342C35.1224 10.5821 35.0759 10.8222 35.0281 11.0696C34.3314 11.0696 33.6347 11.0696 32.917 11.0696C32.8241 10.8295 32.7312 10.5894 32.6355 10.342C32.6819 10.246 32.7284 10.15 32.7762 10.051Z" fill="#E0E0E0" />
        <path d="M35.0291 9.46875C35.0291 9.70883 35.0291 9.94891 35.0291 10.1963C34.8433 10.1963 34.6575 10.1963 34.4661 10.1963C34.4197 10.3883 34.3732 10.5804 34.3254 10.7783C34.0932 10.8263 33.8609 10.8743 33.6217 10.9238C33.4633 10.2326 33.4633 10.2326 33.6217 9.90526C33.8539 9.90526 34.0861 9.90526 34.3254 9.90526C34.3254 9.80923 34.3254 9.7132 34.3254 9.61425C34.6069 9.46875 34.6069 9.46875 35.0291 9.46875Z" fill="#9E9E9E" />
        <path d="M11.9479 14.9978C11.9479 15.0938 11.9479 15.1899 11.9479 15.2888C13.8521 15.2888 15.7563 15.2888 17.7182 15.2888C17.7182 15.3368 17.7182 15.3848 17.7182 15.4343C15.5354 15.4823 13.3525 15.5303 11.1035 15.5798C11.1035 15.4358 11.1035 15.2917 11.1035 15.1433C11.5257 14.9978 11.5257 14.9978 11.9479 14.9978Z" fill="#B5B5B5" />
        <path d="M4.48828 4.23059C5.41716 4.23059 6.34604 4.23059 7.30306 4.23059C7.30306 4.37464 7.30306 4.51869 7.30306 4.6671C6.37418 4.6671 5.44531 4.6671 4.48828 4.6671C4.48828 4.52305 4.48828 4.379 4.48828 4.23059Z" fill="#34A853" />
        <path d="M30.244 9.6145C30.1975 10.0466 30.1511 10.4788 30.1032 10.924C29.8246 10.924 29.5459 10.924 29.2588 10.924C29.282 10.816 29.3052 10.708 29.3292 10.5966C29.4163 10.1689 29.4163 10.1689 29.3995 9.6145C29.681 9.469 29.681 9.469 30.244 9.6145Z" fill="#DEDEDE" />
        <path d="M50.2279 4.81323C50.3208 4.86125 50.4137 4.90926 50.5094 4.95874C51.0512 6.88461 50.8167 9.09085 50.7909 11.0699C50.7444 11.0699 50.698 11.0699 50.6501 11.0699C50.6448 10.9005 50.6448 10.9005 50.6394 10.7277C50.623 10.2112 50.6058 9.69479 50.5885 9.17834C50.583 9.00072 50.5775 8.8231 50.5718 8.64009C50.5374 7.03997 50.5374 7.03997 50.2103 5.48619C50.1697 5.36014 50.129 5.2341 50.0872 5.10424C50.1336 5.00821 50.18 4.91217 50.2279 4.81323Z" fill="#B0B0B0" />
        <path d="M52.6211 14.8525C52.8997 14.9486 53.1784 15.0446 53.4655 15.1435C53.184 15.4346 53.184 15.4346 52.8808 15.4676C52.7584 15.4661 52.6361 15.4645 52.51 15.463C52.3776 15.462 52.2452 15.4611 52.1087 15.4601C51.9701 15.4577 51.8315 15.4553 51.6887 15.4527C51.549 15.4514 51.4093 15.4501 51.2654 15.4488C50.9197 15.4453 50.5741 15.4405 50.2285 15.4346C50.2285 15.2905 50.2285 15.1465 50.2285 14.998C50.3894 14.9997 50.5504 15.0014 50.7162 15.0032C50.926 15.0045 51.1358 15.0058 51.3456 15.0071C51.4519 15.0084 51.5581 15.0096 51.6675 15.0108C51.9385 15.0121 52.2095 15.0056 52.4803 14.998C52.5268 14.95 52.5732 14.902 52.6211 14.8525Z" fill="#B8B8B8" />
        <path d="M51.917 4.8125C51.9634 4.8125 52.0099 4.8125 52.0577 4.8125C52.1893 5.79642 52.2438 6.77225 52.2837 7.76406C52.2889 7.88166 52.2942 7.99927 52.2996 8.12043C52.3039 8.2258 52.3082 8.33116 52.3125 8.43972C52.3397 8.74666 52.4001 9.02657 52.4799 9.32311C52.3406 9.27509 52.2013 9.22708 52.0577 9.17761C52.0099 8.69269 51.9633 8.20764 51.917 7.72257C51.9036 7.58659 51.8901 7.4506 51.8763 7.3105C51.8017 6.52241 51.7479 5.74997 51.7763 4.958C51.8227 4.90999 51.8691 4.86197 51.917 4.8125Z" fill="#4D4D4D" />
        <path d="M49.8047 2.92188C50.78 2.9939 50.78 2.9939 51.775 3.06738C51.775 3.11539 51.775 3.16341 51.775 3.21288C52.193 3.28491 52.193 3.28491 52.6195 3.35839C52.6195 3.4064 52.6195 3.45442 52.6195 3.50389C51.6906 3.55191 50.7617 3.59992 49.8047 3.64939C49.8047 3.40931 49.8047 3.16923 49.8047 2.92188Z" fill="#CCCAC9" />
        <path d="M38.6871 3.21289C38.6871 3.40496 38.6871 3.59702 38.6871 3.7949C38.6175 3.77185 38.548 3.74879 38.4764 3.72503C37.9837 3.61925 37.4929 3.61499 36.9916 3.60336C36.8831 3.60034 36.7745 3.59732 36.6627 3.5942C36.3171 3.58471 35.9716 3.57612 35.626 3.56756C35.3912 3.56127 35.1565 3.55492 34.9217 3.54852C34.3473 3.53296 33.7728 3.51822 33.1982 3.5039C33.1982 3.45588 33.1982 3.40787 33.1982 3.35839C33.9121 3.33759 34.6259 3.31687 35.3397 3.29623C35.5826 3.28919 35.8255 3.28214 36.0683 3.27506C36.4173 3.26489 36.7663 3.2548 37.1153 3.24472C37.2239 3.24154 37.3326 3.23835 37.4445 3.23507C37.8589 3.22317 38.2725 3.21289 38.6871 3.21289Z" fill="#A2A2A2" />
        <path d="M52.7611 9.61426C52.9004 9.61426 53.0398 9.61426 53.1833 9.61426C53.1833 10.4305 53.1833 11.2468 53.1833 12.0878C53.0904 12.1358 52.9975 12.1839 52.9018 12.2333C52.7321 11.7068 52.7459 11.2257 52.7523 10.6783C52.7529 10.5761 52.7536 10.474 52.7542 10.3688C52.7559 10.1173 52.7584 9.86576 52.7611 9.61426Z" fill="#959595" />
        <path d="M34.3248 8.74121C34.3712 8.88526 34.4177 9.02931 34.4655 9.17772C34.7491 9.28441 34.7491 9.28441 35.0285 9.32323C34.7963 9.41926 34.564 9.51529 34.3248 9.61423C34.3248 9.71026 34.3248 9.8063 34.3248 9.90524C34.0926 9.90524 33.8604 9.90524 33.6211 9.90524C33.6211 9.56913 33.6211 9.23301 33.6211 8.88671C33.8533 8.8387 34.0855 8.79068 34.3248 8.74121Z" fill="#E6E6E6" />
        <path d="M29.1175 3.35791C30.4644 3.35791 31.8113 3.35791 33.199 3.35791C33.199 3.40593 33.199 3.45394 33.199 3.50341C33.1175 3.50706 33.0361 3.51071 32.9522 3.51446C30.8205 3.60617 30.8205 3.60617 28.6953 3.79442C28.8346 3.7464 28.974 3.69839 29.1175 3.64892C29.1175 3.55288 29.1175 3.45685 29.1175 3.35791Z" fill="#B8B8B8" />
        <path d="M50.3682 11.9429C50.4611 11.9429 50.554 11.9429 50.6497 11.9429C50.6336 12.2703 50.6156 12.5977 50.5969 12.925C50.5822 13.1985 50.5822 13.1985 50.5672 13.4775C50.5155 13.9232 50.4531 14.1865 50.2275 14.5619C50.0582 13.6168 50.1452 12.8727 50.3682 11.9429Z" fill="#B6B6B6" />
        <path d="M52.7604 5.54053C52.8069 5.54053 52.8533 5.54053 52.9012 5.54053C52.9215 5.70558 52.9418 5.87064 52.9627 6.0407C52.9873 6.53108 52.9873 6.53108 53.1826 6.70456C53.1928 6.99842 53.1944 7.29263 53.1914 7.58667C53.1902 7.74741 53.1889 7.90815 53.1876 8.07377C53.186 8.19812 53.1843 8.32248 53.1826 8.4506C53.1362 8.4506 53.0898 8.4506 53.0419 8.4506C53.0419 8.1625 53.0419 7.8744 53.0419 7.57758C52.949 7.57758 52.8561 7.57758 52.7604 7.57758C52.6319 6.85433 52.6319 6.26377 52.7604 5.54053Z" fill="#A0A0A0" />
        <path d="M53.0428 9.90576C53.1822 9.95378 53.3215 10.0018 53.4651 10.0513C53.517 11.7277 53.517 11.7277 53.1836 12.5248C53.0907 12.5248 52.9978 12.5248 52.9021 12.5248C52.9485 12.3808 52.995 12.2367 53.0428 12.0883C53.0527 11.714 53.056 11.3439 53.0516 10.9698C53.0507 10.8166 53.0507 10.8166 53.0497 10.6603C53.0481 10.4088 53.0455 10.1573 53.0428 9.90576Z" fill="#5E5E5E" />
        <path d="M28.4133 8.16028C28.5526 8.35234 28.692 8.54441 28.8355 8.74229C28.6596 8.96055 28.6596 8.96055 28.4133 9.1788C28.2275 9.1788 28.0417 9.1788 27.8503 9.1788C27.8503 8.89071 27.8503 8.60261 27.8503 8.30578C28.0361 8.25777 28.2219 8.20975 28.4133 8.16028Z" fill="#CFD0D0" />
        <path d="M52.9014 6.26807C53.0407 6.31608 53.18 6.3641 53.3236 6.41357C53.4824 7.19361 53.478 7.94908 53.4643 8.74163C53.325 8.78964 53.1857 8.83766 53.0421 8.88713C53.0437 8.73464 53.0454 8.58215 53.0471 8.42504C53.0484 8.22441 53.0497 8.02377 53.0509 7.82314C53.0521 7.7227 53.0533 7.62226 53.0545 7.51877C53.0566 7.06131 53.0424 6.70542 52.9014 6.26807Z" fill="#5C5C5C" />
        <path d="M33.6212 7.86816C33.8534 7.91618 34.0856 7.9642 34.3249 8.01367C34.2785 8.25375 34.232 8.49383 34.1842 8.74119C33.9519 8.69317 33.7197 8.64515 33.4805 8.59568C33.5269 8.3556 33.5734 8.11552 33.6212 7.86816Z" fill="#7E8080" />
        <path d="M54.3092 2.7762C54.3092 2.87223 54.3092 2.96826 54.3092 3.0672C53.5661 3.0672 52.823 3.0672 52.0574 3.0672C52.7654 2.70123 53.5345 2.47583 54.3092 2.7762Z" fill="#B5B5B5" />
        <path d="M38.2646 14.9985C38.404 14.9985 38.5433 14.9985 38.6869 14.9985C38.6869 15.0946 38.6869 15.1906 38.6869 15.2895C39.43 15.2895 40.1731 15.2895 40.9387 15.2895C40.9387 15.3376 40.9387 15.3856 40.9387 15.435C39.615 15.5071 39.615 15.5071 38.2646 15.5805C38.2646 15.3885 38.2646 15.1964 38.2646 14.9985Z" fill="#959595" />
        <path d="M51.7766 9.46875C51.8694 9.46875 51.9623 9.46875 52.058 9.46875C51.9224 10.8379 51.9224 10.8379 51.7766 11.5058C51.7301 11.5058 51.6837 11.5058 51.6358 11.5058C51.632 11.1936 51.6293 10.8814 51.627 10.5691C51.6254 10.3952 51.6238 10.2214 51.6221 10.0422C51.6358 9.61425 51.6358 9.61425 51.7766 9.46875Z" fill="#3A3A3A" />
        <path d="M52.761 7.57739C52.8539 7.57739 52.9468 7.57739 53.0425 7.57739C53.0889 8.10557 53.1354 8.63375 53.1832 9.17793C53.0439 9.17793 52.9045 9.17793 52.761 9.17793C52.761 8.64975 52.761 8.12158 52.761 7.57739Z" fill="#7A7A7A" />
        <path d="M28.6954 10.0511C28.7883 10.0511 28.8812 10.0511 28.9769 10.0511C28.9769 10.1952 28.9769 10.3392 28.9769 10.4877C29.1162 10.4877 29.2556 10.4877 29.3991 10.4877C29.3527 10.6317 29.3062 10.7758 29.2584 10.9242C29.0262 10.8762 28.7939 10.8281 28.5547 10.7787C28.6011 10.5386 28.6476 10.2985 28.6954 10.0511Z" fill="#6A6C6B" />
        <path d="M28.1319 10.4875C28.5073 10.6816 28.8826 10.8756 29.2579 11.0696C28.8399 11.0696 28.4219 11.0696 27.9912 11.0696C27.9912 10.6331 27.9912 10.6331 28.1319 10.4875Z" fill="#E1E2E2" />
        <path d="M29.6798 9.46875C29.9585 9.54077 29.9585 9.54077 30.2428 9.61425C30.1963 9.80632 30.1499 9.99838 30.102 10.1963C29.9162 10.1483 29.7305 10.1002 29.5391 10.0508C29.5855 9.8587 29.632 9.66663 29.6798 9.46875Z" fill="#C5C5C5" />
        <path d="M28.6952 7.86853C28.8345 7.86853 28.9738 7.86853 29.1174 7.86853C29.1638 8.15663 29.2103 8.44472 29.2581 8.74155C29.0259 8.69354 28.7937 8.64552 28.5544 8.59605C28.6009 8.35597 28.6473 8.11589 28.6952 7.86853Z" fill="#676969" />
        <path d="M27.9913 7.72363C28.27 7.72363 28.5487 7.72363 28.8358 7.72363C28.6598 8.01464 28.6598 8.01464 28.4135 8.30565C28.2278 8.30565 28.042 8.30565 27.8506 8.30565C27.897 8.11358 27.9435 7.92152 27.9913 7.72363Z" fill="#E1E2E2" />
        <path d="M46.9902 14.9985C47.2225 14.9985 47.4547 14.9985 47.6939 14.9985C47.6939 15.1906 47.6939 15.3827 47.6939 15.5805C47.4617 15.5805 47.2295 15.5805 46.9902 15.5805C46.9902 15.3885 46.9902 15.1964 46.9902 14.9985Z" fill="#5F5F5F" />
        <path d="M46.9912 3.21204C47.2234 3.21204 47.4556 3.21204 47.6949 3.21204C47.6949 3.4041 47.6949 3.59617 47.6949 3.79405C47.4627 3.79405 47.2305 3.79405 46.9912 3.79405C46.9912 3.60199 46.9912 3.40992 46.9912 3.21204Z" fill="#5E5E5E" />
        <path d="M3.36167 3.35791C3.45456 3.50196 3.54745 3.64601 3.64315 3.79442C3.44963 4.15818 3.44963 4.15818 3.22093 4.52194C3.12804 4.52194 3.03516 4.52194 2.93945 4.52194C3.04501 3.68529 3.04501 3.68529 3.36167 3.35791Z" fill="#BEBEBE" />
        <path d="M53.1837 14.707C53.2302 14.8031 53.2766 14.8991 53.3244 14.998C53.6031 14.998 53.8818 14.998 54.1689 14.998C54.2153 15.1421 54.2618 15.2861 54.3096 15.4345C53.6826 15.2905 53.6826 15.2905 53.043 15.1435C53.0894 14.9995 53.1359 14.8554 53.1837 14.707Z" fill="#C9C9C9" />
        <path d="M11.9479 14.9978C11.8551 15.1899 11.7622 15.3819 11.6665 15.5798C11.4807 15.5798 11.2949 15.5798 11.1035 15.5798C11.1035 15.4358 11.1035 15.2917 11.1035 15.1433C11.5257 14.9978 11.5257 14.9978 11.9479 14.9978Z" fill="#7E7E7E" />
        <path d="M3.50316 3.79443C3.59605 3.79443 3.68893 3.79443 3.78464 3.79443C3.78464 4.03451 3.78464 4.2746 3.78464 4.52195C3.59886 4.52195 3.41308 4.52195 3.22168 4.52195C3.34483 3.95813 3.34483 3.95813 3.50316 3.79443Z" fill="#E4E4E4" />
      </g>
      <defs>
        <clipPath id="clip0_1507_7323">
          <rect width="55.8734" height="17.4604" fill="white" transform="translate(0.125 0.593262)" />
        </clipPath>
      </defs>
    </svg>
  )


  return (
    <div style={{
      flexDirection: "column",
      margin: 0,
      top: 0,

    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        borderRadius: 24,
        height: 'auto',
        overflow: 'hidden',
        flexDirection: isMobile ? 'column' : 'row',
      }}>

        <div style={{
          display: 'flex',
          paddingInline: 16,
          paddingBlock: 16,
          backgroundColor: 'white',
          left: isMobile ? 0 : 16,
          borderRadius: 24,
          gap: 16,
          flexDirection: 'column',
          width: isMobile ? '100%' : 390,
          minHeight: isMobile ? 310 : 'auto',
          height: isMobile ? 300 : 'auto',
          zIndex: 11111,
          marginTop: 24,
          border: '1px solid rgba(0,0,0,0.1)',
          margin: isMobile ? '16px auto' : '16px 16px 16px 0',
          position: 'fixed',
          bottom: isMobile ? -10 : '',
          overflow: 'hidden'

        }}>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16',
            boxSizing: 'border-box',
          }}>


            <div style={{
              display: 'flex',
              backgroundColor: '#F6F6F6',
              borderRadius: 36,
              padding: 8,
              alignItems: 'center'
            }}
              onClick={() => navigate(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8L10 3" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexWrap: 'nowrap',
              overflowX: 'auto',
            }}>


              <div style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}>


                {

                  availableBus === true ?

                    (
                      arrived === true ?
                        <p style={{
                          margin: 0,
                          fontSize: 14,
                          color: 'rgba(0,0,0,0.5)'
                        }}> Bus has arrived at {startPoint?.name} </p>

                        :

                        isAtAnyStop.isAtStop && isAtAnyStop.stopName !== startPoint?.name ? (
                          <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }}>
                            Passengers are boarding at <span style={{ fontWeight: 'bold', color: '#000' }}>
                              {isAtAnyStop.stopName}
                            </span>
                          </p>
                        ) :



                          (
                            stoppedBus ?

                              <p style={{
                                margin: 0,
                                fontSize: 14,
                                color: 'rgba(0,0,0,0.5)'
                              }}>Traffic ahead is causing some delays</p>
                              :
                              <p style={{
                                margin: 0,
                                fontSize: 14,
                                color: 'rgba(0,0,0,0.5)'
                              }}>Bus will arrive in about <span style={{
                                fontWeight: '800',
                                color: 'black'
                              }}>{timeInMinutes}</span> minutes </p>

                          )

                    )
                    :
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: 'rgba(0,0,0,0.5)'
                    }}>There is no availabale bus </p>
                }

                {/* <p style={{
                    margin : 0,
                    fontSize : 14,
                    color : 'rgba(0,0,0,0.5)'
                  }}>Bus will arrive in <span style={{
                    fontWeight : '800',
                    color : 'black'
                  }}>{timeInMinutes}</span> minutes </p> */}
              </div>

            </div>

          </div>

          <nav className='flex w-full items-center border-b border-neutral-200'>
            <button
              className={`flex items-center w-full justify-center pb-2 text-sm font-normal ${activeTab === 'General' ? 'text-green-600 border-b-2 border-green-600' : 'text-black/50 hover:text-black/80 '}`}
              onClick={() => setActiveTab('General')}
            >
              Bus Stops
            </button>
            <button
              className={`flex items-center w-full justify-center pb-2 text-sm font-normal ${activeTab === 'Buses' ? 'text-green-600 border-b-2 border-green-600' : 'text-black/50 hover:text-black/80 '}`}
              onClick={() => setActiveTab('Buses')}
            >
              Buses
            </button>
          </nav>


          {activeTab === 'General' && (
            <main className='flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-none' >
              <section style={{
                display: 'flex',
                paddingInline: 12,
                paddingBlock: 12,
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: "center",
                  justifyContent: 'center'
                }} >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: "center",
                  }}>
                    <p style={{
                      fontWeight: '500',
                      fontSize: 13,
                      textAlign: 'center'
                    }}>   {
                        closestStopName === startPoint?.name
                          ? startPoint?.name
                          : closestStopName ?? 'Loading...'
                      }</p>
                    <p style={{
                      fontSize: 11,
                      color: 'rgba(0,0,0,0.5)',
                      padding: 2,
                      borderRadius: 4,
                      backgroundColor: '#fafafa',
                    }}>Start</p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: "center",
                    gap: 4,
                    borderRadius: 6,
                  }}>
                    <p style={{
                      fontSize: 12,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      minWidth: 48,
                    }}>
                      {closest?.driver?.coords?.timestamp
                        ? new Date(closest.driver.coords.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>

                  <div style={{
                    height: 2,
                    width: coverDistance,
                    borderRadius: 8,
                    backgroundColor: '#34A853',
                    transition: 'width 0.5s ease-in-out'
                  }}></div>

                  <svg xmlns="http://www.w3.org/2000/svg" width="57" height="36" viewBox="0 0 57 36" fill="none">
                    <path d="M31.0068 10.9014H30.0068C26.1408 10.9014 23.0068 14.0354 23.0068 17.9014C23.0068 21.7674 26.1408 24.9014 30.0068 24.9014H31.0068C34.8728 24.9014 38.0068 21.7674 38.0068 17.9014C38.0068 14.0354 34.8728 10.9014 31.0068 10.9014Z" fill="#699635" fill-opacity="0.8" />
                    <path d="M42.0068 17.4014C42.0068 11.0501 36.8581 5.90137 30.5068 5.90137C24.1556 5.90137 19.0068 11.0501 19.0068 17.4014C19.0068 23.7526 24.1556 28.9014 30.5068 28.9014C36.8581 28.9014 42.0068 23.7526 42.0068 17.4014Z" fill="#699635" fill-opacity="0.4" />
                    <path d="M45.0068 17.4014C45.0068 9.39324 38.515 2.90137 30.5068 2.90137C22.4987 2.90137 16.0068 9.39324 16.0068 17.4014C16.0068 25.4095 22.4987 31.9014 30.5068 31.9014C38.515 31.9014 45.0068 25.4095 45.0068 17.4014Z" fill="#699635" fill-opacity="0.1" />
                    <g mask="url(#mask0_945_306)">
                      <path d="M39.1878 12.4398C39.1413 12.5359 39.0949 12.6319 39.0471 12.7308C33.6596 12.7789 28.2721 12.8269 22.7213 12.8763C22.7213 16.0934 22.7213 19.3105 22.7213 22.6251C23.0422 22.7909 23.2291 22.792 23.5858 22.7981C23.7061 22.8006 23.8263 22.803 23.9502 22.8055C24.0802 22.8075 24.2102 22.8095 24.3442 22.8115C24.4775 22.8142 24.6107 22.8169 24.748 22.8196C25.1749 22.8282 25.6018 22.8359 26.0287 22.8433C26.5902 22.8532 27.1517 22.8639 27.7132 22.8752C27.8432 22.8771 27.9732 22.8791 28.1072 22.8811C28.2275 22.8836 28.3477 22.886 28.4716 22.8885C28.5776 22.8903 28.6836 22.8922 28.7929 22.894C29.0546 22.9161 29.0546 22.9161 29.3361 23.0616C29.3361 23.1576 29.3361 23.2537 29.3361 23.3526C20.9762 23.3526 12.6163 23.3526 4.00304 23.3526C3.9566 23.1605 3.91016 22.9685 3.8623 22.7706C4.04808 22.7706 4.23386 22.7706 4.42526 22.7706C4.42526 19.7936 4.42526 16.8166 4.42526 13.7494C5.77213 13.7494 7.119 13.7494 8.50669 13.7494C8.50669 13.3172 8.50669 12.8851 8.50669 12.4398C12.4447 12.4174 16.3826 12.3959 20.3206 12.3754C22.149 12.3658 23.9774 12.356 25.8057 12.3455C27.3989 12.3364 28.992 12.3278 30.5852 12.3198C31.4292 12.3155 32.2731 12.311 33.1171 12.3059C33.9108 12.3011 34.7045 12.2969 35.4982 12.2933C35.7901 12.2919 36.082 12.2902 36.3739 12.2882C36.7713 12.2856 37.1687 12.2839 37.5661 12.2824C37.6826 12.2814 37.7991 12.2804 37.9191 12.2794C38.3795 12.2784 38.7477 12.2882 39.1878 12.4398Z" fill="#34A853" />
                      <path d="M48.8909 12.3752C51.362 11.4939 51.2916 19.3104 51.2916 22.6249C51.6125 22.7908 50.5127 22.8878 50.8694 22.8939C50.9897 22.8963 50.6583 23.0615 52.5205 22.8054C50.6793 23.0586 50.4645 23.1938 52.5821 22.8639C51.982 22.9576 51.3855 23.0442 50.8694 23.1171C50.877 23.1172 50.8659 23.1187 50.8393 23.1213C50.5146 23.1671 50.2228 23.2073 49.9834 23.2403C50.1187 23.2371 50.2496 23.2338 50.3681 23.2305C50.394 23.2277 50.4203 23.2249 50.4472 23.222C50.4926 23.2172 50.5395 23.2121 50.5879 23.207C51.0148 23.2155 50.4425 23.1995 50.8694 23.207C50.9722 23.2088 50.8559 23.215 50.6303 23.2225C51.2938 23.2265 51.208 23.2532 51.0805 23.2815C50.9251 23.3159 50.7077 23.3525 51.7139 23.3525H49.2645C48.8532 23.3639 48.6624 23.3624 48.6219 23.3525H32.5734L32.4326 22.7704H32.9956V13.7492H37.077V12.4397C41.015 12.4173 44.8176 12.0759 48.8909 12.3752Z" fill="#34A853" />
                      <path d="M23.5481 13.2951C23.7223 13.2953 23.7223 13.2953 23.9 13.2955C24.0328 13.2953 24.1656 13.2951 24.3025 13.2949C24.4493 13.2954 24.5962 13.296 24.7476 13.2965C24.9013 13.2965 25.0551 13.2965 25.2135 13.2964C25.7245 13.2965 26.2355 13.2977 26.7465 13.2988C27.0997 13.2991 27.4529 13.2993 27.8061 13.2994C28.6425 13.2999 29.4788 13.3011 30.3152 13.3025C31.5274 13.3046 32.7396 13.3054 33.9517 13.3063C35.6503 13.3077 37.3488 13.3105 39.0474 13.313C39.0474 16.338 39.0474 19.3631 39.0474 22.4798C33.7992 22.4798 28.5511 22.4798 23.1439 22.4798C23.141 20.9943 23.1381 19.5087 23.1351 17.9782C23.1338 17.5086 23.1325 17.0389 23.1312 16.5551C23.1308 16.1854 23.1304 15.8158 23.1301 15.4461C23.1298 15.3495 23.1294 15.2528 23.129 15.1533C23.128 14.8699 23.1279 14.5865 23.1279 14.3032C23.1276 14.1432 23.1273 13.9833 23.127 13.8185C23.1503 13.3222 23.1503 13.3222 23.5481 13.2951Z" fill="#34A853" />
                      <path d="M54.8102 11.2757C54.8162 11.5181 54.8159 11.7608 54.8102 12.0032C54.5653 12.2563 54.22 12.2028 53.8866 12.2305C53.6729 12.2488 53.6729 12.2488 53.455 12.2675C53.3449 12.2763 53.2348 12.2851 53.1213 12.2942C53.1416 12.4118 53.1619 12.5294 53.1829 12.6506C53.209 12.8061 53.2351 12.9615 53.262 13.1217C53.2882 13.2754 53.3143 13.429 53.3412 13.5872C53.3958 13.9892 53.4144 14.3629 53.4028 14.7678C53.5421 14.8158 53.6814 14.8638 53.825 14.9133C53.982 15.6845 54.0144 16.4558 53.9657 17.2413C53.9193 17.2893 53.8728 17.3373 53.825 17.3868C53.8015 17.8961 53.8015 17.8961 53.825 18.4053C53.8714 18.4534 53.9179 18.5014 53.9657 18.5508C54.0271 19.4176 54.0225 20.2158 53.6843 21.0244C53.5914 21.0244 53.4985 21.0244 53.4028 21.0244C53.4086 21.1715 53.4144 21.3185 53.4204 21.47C53.402 22.0692 53.2997 22.4967 53.1213 23.0615C53.3535 23.1095 53.5857 23.1575 53.825 23.207C53.825 23.303 53.825 23.399 53.825 23.498C53.9614 23.495 54.0979 23.492 54.2384 23.4889C54.6694 23.498 54.6694 23.498 54.8102 23.6435C54.8159 23.9344 54.8162 24.2256 54.8102 24.5165C54.1768 24.4961 53.5435 24.4746 52.9102 24.4528C52.7317 24.4471 52.5532 24.4414 52.3692 24.4355C52.1951 24.4294 52.0209 24.4233 51.8415 24.417C51.6823 24.4117 51.5231 24.4064 51.359 24.4009C50.8695 24.371 50.8695 24.371 50.3923 24.2975C49.5578 24.1881 48.7216 24.2056 47.8818 24.2074C47.6932 24.2072 47.5047 24.207 47.3161 24.2067C46.9076 24.2063 46.4991 24.2063 46.0905 24.2067C45.4258 24.2073 44.761 24.2069 44.0962 24.2063C43.2561 24.2057 42.416 24.2054 41.576 24.2054C39.9261 24.2054 38.2762 24.2036 36.6263 24.2011C36.3664 24.2007 36.1065 24.2003 35.8466 24.2C35.4528 24.1994 35.059 24.1988 34.6652 24.1982C33.1818 24.1961 31.6985 24.1941 30.2151 24.1923C30.0795 24.1921 29.944 24.192 29.8043 24.1918C27.6052 24.1893 25.406 24.1888 23.2069 24.1891C20.9487 24.1893 18.6905 24.1867 16.4323 24.1817C15.0394 24.1787 13.6466 24.1779 12.2538 24.18C11.3 24.1812 10.3463 24.1798 9.39262 24.1763C8.8421 24.1743 8.29164 24.1736 7.74113 24.176C7.23734 24.1782 6.73367 24.177 6.2299 24.1732C5.96099 24.1721 5.69208 24.1745 5.42319 24.177C4.12158 24.1618 4.12158 24.1618 3.68479 23.7415C3.36266 23.2286 3.35204 22.8896 3.35161 22.2797C3.3501 22.1216 3.3501 22.1216 3.34856 21.9603C3.34619 21.6134 3.34891 21.2668 3.35192 20.9198C3.3518 20.6779 3.35145 20.4361 3.35089 20.1942C3.35048 19.6878 3.35255 19.1815 3.35642 18.6751C3.36122 18.0268 3.36037 17.3786 3.35773 16.7303C3.35624 16.231 3.35751 15.7317 3.35962 15.2324C3.36035 14.9934 3.36028 14.7544 3.3594 14.5154C3.35863 14.181 3.3615 13.8469 3.36535 13.5125C3.36622 13.3224 3.36709 13.1324 3.36799 12.9366C3.45942 12.3094 3.53029 12.1234 4.00338 11.7122C4.60101 11.5986 5.19578 11.6144 5.80187 11.6201C5.99043 11.6193 6.17898 11.6182 6.36753 11.6168C6.88617 11.6138 7.40472 11.6153 7.92336 11.6176C8.48249 11.6192 9.04162 11.6167 9.60075 11.6146C10.5698 11.6116 11.5389 11.6113 12.508 11.6128C13.9101 11.6148 15.3121 11.6128 16.7142 11.6096C18.99 11.6047 21.2659 11.6029 23.5418 11.6031C25.7507 11.6034 27.9596 11.6025 30.1685 11.5999C30.3725 11.5996 30.3725 11.5996 30.5806 11.5994C32.0652 11.5976 33.5499 11.5955 35.0345 11.5934C35.4283 11.5928 35.8221 11.5922 36.2159 11.5916C36.4755 11.5913 36.7351 11.5909 36.9947 11.5905C38.6469 11.5881 40.299 11.5868 41.9512 11.5868C42.7848 11.5867 43.6184 11.5862 44.4521 11.5856C45.1114 11.5851 45.7707 11.5852 46.43 11.5858C46.8301 11.586 47.2301 11.5856 47.6302 11.585C47.9001 11.5848 48.1701 11.5853 48.44 11.5859C48.6007 11.5855 48.7614 11.5852 48.9269 11.5848C49.0652 11.5848 49.2035 11.5848 49.346 11.5848C49.7694 11.5655 50.1711 11.4979 50.588 11.4212C50.7932 11.4185 50.9986 11.4215 51.2037 11.4303C51.9705 11.4424 52.7118 11.3384 53.4684 11.2209C53.9509 11.15 54.3465 11.0999 54.8102 11.2757ZM36.9366 12.3014C32.794 12.3177 28.6513 12.3376 24.5086 12.359C22.7576 12.368 21.0066 12.3767 19.2556 12.3854C15.6727 12.4032 12.0899 12.4213 8.50703 12.4397C8.50703 12.8718 8.50703 13.304 8.50703 13.7492C7.16016 13.7492 5.81329 13.7492 4.4256 13.7492C4.4256 16.7262 4.4256 19.7032 4.4256 22.7705C4.19338 22.7705 3.96116 22.7705 3.72191 22.7705C3.76835 23.0105 3.81479 23.2506 3.86265 23.498C18.9569 23.498 34.0512 23.498 49.6028 23.498C49.6028 23.4019 49.6028 23.3059 49.6028 23.207C49.6895 23.1933 49.7763 23.1796 49.8656 23.1655C50.1754 23.0893 50.1754 23.0893 50.334 22.8438C51.03 21.3412 51.0622 19.8176 51.0542 18.178C51.054 18.0751 51.0539 17.9723 51.0537 17.8663C51.1204 15.0888 51.1204 15.0888 50.1658 12.5852C49.706 12.2792 49.3354 12.2584 48.795 12.26C48.5451 12.2597 48.5451 12.2597 48.2902 12.2594C48.0144 12.2613 48.0144 12.2613 47.733 12.2632C47.5346 12.2636 47.3363 12.2638 47.138 12.2639C46.588 12.2645 46.0382 12.267 45.4882 12.2698C44.8902 12.2726 44.2921 12.2737 43.6941 12.275C42.3451 12.2784 40.9961 12.2842 39.6472 12.2903C38.7437 12.2944 37.8402 12.2979 36.9366 12.3014Z" fill="#C4C4C3" />
                      <path d="M25.2539 15.4951C29.0623 15.4951 32.8707 15.4951 36.7945 15.4951C36.7945 17.0797 36.7945 18.6642 36.7945 20.2967C32.9861 20.2967 29.1777 20.2967 25.2539 20.2967C25.2539 18.7122 25.2539 17.1277 25.2539 15.4951Z" fill="#34A853" />
                      <path d="M51.9337 12.1306C52.0319 12.1301 52.1302 12.1295 52.2314 12.1289C52.9626 12.1304 52.9626 12.1304 53.1212 12.2943C53.1776 12.5719 53.2262 12.8512 53.2707 13.131C53.2956 13.2833 53.3204 13.4356 53.346 13.5925C53.3965 13.9915 53.4135 14.3664 53.4027 14.7679C53.542 14.8159 53.6813 14.8639 53.8249 14.9134C53.9819 15.6846 54.0143 16.4559 53.9656 17.2415C53.9192 17.2895 53.8727 17.3375 53.8249 17.387C53.8014 17.8962 53.8014 17.8962 53.8249 18.4055C53.8946 18.4775 53.8946 18.4775 53.9656 18.551C54.027 19.4177 54.0224 20.216 53.6841 21.0246C53.5913 21.0246 53.4984 21.0246 53.4027 21.0246C53.4085 21.1716 53.4143 21.3187 53.4203 21.4702C53.4019 22.0694 53.2996 22.4968 53.1212 23.0616C53.307 23.1096 53.4927 23.1576 53.6841 23.2071C53.6841 23.3031 53.6841 23.3992 53.6841 23.4981C53.1099 23.6392 52.5672 23.6677 51.9777 23.6709C51.7203 23.674 51.7203 23.674 51.4576 23.6772C51.0101 23.6436 51.0101 23.6436 50.5879 23.3526C50.6311 23.2344 50.6742 23.1163 50.7187 22.9945C51.6341 19.8653 51.5868 15.3926 50.5879 12.2943C51.0171 12.0725 51.4635 12.1279 51.9337 12.1306Z" fill="#282828" />
                      <path d="M22.7208 12.8765C24.9204 12.8731 27.12 12.8705 29.3196 12.869C30.3408 12.8682 31.362 12.8672 32.3833 12.8655C33.2731 12.8641 34.1629 12.8631 35.0527 12.8628C35.5241 12.8626 35.9955 12.8622 36.4669 12.8611C36.9924 12.8601 37.5178 12.8599 38.0432 12.86C38.2006 12.8595 38.358 12.8589 38.5202 12.8584C38.6625 12.8586 38.8048 12.8588 38.9514 12.859C39.1381 12.8588 39.1381 12.8588 39.3284 12.8586C39.6095 12.8765 39.6095 12.8765 39.7503 13.022C39.7635 13.3256 39.7668 13.6296 39.7662 13.9334C39.7663 14.0285 39.7663 14.1236 39.7663 14.2216C39.7662 14.5373 39.7651 14.853 39.764 15.1688C39.7637 15.3871 39.7635 15.6055 39.7634 15.8238C39.7629 16.3996 39.7615 16.9754 39.7599 17.5511C39.7585 18.1383 39.7578 18.7254 39.7571 19.3125C39.7556 20.4652 39.7532 21.618 39.7503 22.7707C37.5323 22.7741 35.3144 22.7767 33.0965 22.7783C32.0667 22.779 31.037 22.7801 30.0072 22.7817C29.11 22.7832 28.2128 22.7841 27.3156 22.7844C26.8402 22.7846 26.3649 22.7851 25.8895 22.7861C25.3597 22.7872 24.8299 22.7873 24.3001 22.7873C24.1413 22.7878 23.9826 22.7883 23.8191 22.7888C23.6038 22.7885 23.6038 22.7885 23.3843 22.7882C23.2588 22.7884 23.1334 22.7885 23.0041 22.7886C22.7208 22.7707 22.7208 22.7707 22.5801 22.6252C22.5661 22.3322 22.5621 22.0386 22.5619 21.7452C22.5614 21.5568 22.561 21.3684 22.5605 21.1742C22.5608 20.967 22.5611 20.7597 22.5614 20.5524C22.5613 20.3412 22.5612 20.1301 22.561 19.919C22.5608 19.4758 22.5611 19.0326 22.5618 18.5895C22.5626 18.0207 22.5621 17.452 22.5613 16.8833C22.5607 16.447 22.5609 16.0108 22.5613 15.5745C22.5614 15.3648 22.5612 15.1551 22.5609 14.9454C22.5606 14.6524 22.5612 14.3594 22.5619 14.0664C22.562 13.8995 22.5621 13.7326 22.5622 13.5606C22.5801 13.1675 22.5801 13.1675 22.7208 12.8765ZM23.1431 13.4585C23.1298 13.7398 23.1265 14.0216 23.1271 14.3032C23.1271 14.4863 23.1271 14.6694 23.1271 14.8581C23.1278 15.0541 23.1286 15.2501 23.1293 15.4461C23.1295 15.6233 23.1296 15.8005 23.1297 15.9831C23.1305 16.6481 23.1324 17.3132 23.1343 17.9782C23.1372 19.4637 23.1401 20.9492 23.1431 22.4797C28.3912 22.4797 33.6394 22.4797 39.0466 22.4797C39.0466 19.4547 39.0466 16.4297 39.0466 13.313C36.2484 13.3088 36.2484 13.3088 33.4503 13.3059C32.3098 13.305 31.1694 13.304 30.029 13.302C29.1101 13.3004 28.1912 13.2996 27.2722 13.2992C26.9208 13.2989 26.5693 13.2984 26.2179 13.2976C25.7275 13.2966 25.2371 13.2964 24.7467 13.2965C24.5999 13.296 24.453 13.2954 24.3016 13.2949C24.1688 13.2951 24.036 13.2953 23.8991 13.2955C23.783 13.2954 23.6669 13.2952 23.5473 13.2951C23.2818 13.2831 23.2818 13.2831 23.1431 13.4585Z" fill="#34A853" fill-opacity="0.6" />
                      <path d="M4.7458 11.6182C4.84383 11.6203 4.94185 11.6224 5.04285 11.6246C5.14793 11.624 5.25301 11.6233 5.36127 11.6227C5.71359 11.6215 6.06567 11.6255 6.41796 11.6295C6.6704 11.6297 6.92284 11.6296 7.17528 11.6292C7.86093 11.629 8.54649 11.6332 9.23212 11.6383C9.94851 11.6429 10.6649 11.6433 11.3813 11.6441C12.7381 11.6464 14.0948 11.6524 15.4515 11.6597C16.9961 11.6678 18.5406 11.6718 20.0851 11.6755C23.2625 11.6831 26.4399 11.6959 29.6172 11.7121C29.6172 11.8561 29.6172 12.0002 29.6172 12.1486C29.4879 12.1482 29.3586 12.1478 29.2254 12.1474C26.081 12.1377 22.9367 12.1305 19.7924 12.126C18.2718 12.1237 16.7513 12.1206 15.2307 12.1157C13.9056 12.1113 12.5806 12.1085 11.2555 12.1075C10.5536 12.1069 9.8518 12.1056 9.14997 12.1024C8.48968 12.0995 7.82941 12.0986 7.16911 12.0992C6.92651 12.0991 6.68391 12.0982 6.44131 12.0965C6.11052 12.0944 5.77983 12.0949 5.44904 12.0961C5.26378 12.0957 5.07852 12.0953 4.88765 12.0949C4.3976 12.1518 4.20121 12.2219 3.86199 12.5851C3.81554 12.7291 3.7691 12.8732 3.72125 13.0216C3.95347 13.0216 4.18568 13.0216 4.42494 13.0216C4.47139 12.8295 4.51783 12.6375 4.56568 12.4396C4.56568 12.8237 4.56568 13.2079 4.56568 13.6036C5.77322 13.6036 6.98076 13.6036 8.22489 13.6036C8.22489 13.2195 8.22489 12.8354 8.22489 12.4396C8.27134 12.4396 8.31778 12.4396 8.36563 12.4396C8.36563 12.8717 8.36563 13.3039 8.36563 13.7491C7.0652 13.7491 5.76478 13.7491 4.42494 13.7491C4.42494 16.6781 4.42494 19.6071 4.42494 22.6248C4.09983 22.6248 3.77473 22.6248 3.43977 22.6248C3.42672 21.3094 3.41672 19.994 3.4106 18.6786C3.40766 18.0677 3.40368 17.4569 3.3973 16.8461C3.39118 16.2564 3.38781 15.6668 3.38636 15.0772C3.38532 14.8524 3.38329 14.6276 3.38025 14.4028C3.37615 14.0875 3.3756 13.7724 3.37586 13.4572C3.37461 13.2778 3.37336 13.0985 3.37207 12.9138C3.49683 12.0399 3.87843 11.6321 4.7458 11.6182Z" fill="#BABABA" />
                      <path d="M5.42617 11.95C5.57761 11.9493 5.57761 11.9493 5.7321 11.9485C6.07042 11.9475 6.40866 11.9495 6.74697 11.9516C6.98947 11.9515 7.23198 11.9512 7.47448 11.9507C8.13307 11.9499 8.79163 11.9519 9.45022 11.9544C10.1386 11.9566 10.8269 11.9564 11.5153 11.9565C12.6708 11.9571 13.8264 11.9592 14.9819 11.9625C16.4671 11.9667 17.9523 11.9682 19.4375 11.9689C20.7124 11.9695 21.9873 11.9713 23.2622 11.9733C23.6731 11.9739 24.0839 11.9743 24.4948 11.9747C25.139 11.9754 25.7833 11.9769 26.4275 11.979C26.6646 11.9797 26.9017 11.9801 27.1388 11.9802C27.4611 11.9805 27.7833 11.9816 28.1056 11.983C28.2863 11.9834 28.4671 11.9839 28.6533 11.9843C29.0537 12.0034 29.0537 12.0034 29.1945 12.1489C29.4923 12.167 29.7907 12.1748 30.089 12.1788C30.1823 12.1803 30.2757 12.1817 30.3719 12.1832C30.6818 12.1878 30.9917 12.1914 31.3017 12.195C31.5161 12.198 31.7304 12.201 31.9448 12.2041C32.51 12.2122 33.0753 12.2194 33.6405 12.2264C34.2169 12.2337 34.7933 12.2418 35.3697 12.2498C36.5013 12.2655 37.633 12.2803 38.7647 12.2944C38.7647 12.3425 38.7647 12.3905 38.7647 12.44C28.7793 12.44 18.7938 12.44 8.50583 12.44C8.50583 12.8721 8.50583 13.3042 8.50583 13.7495C8.41294 13.7015 8.32005 13.6535 8.22435 13.604C7.94859 13.5916 7.67242 13.5884 7.39641 13.5898C7.15013 13.5905 7.15013 13.5905 6.89888 13.5912C6.72671 13.5924 6.55454 13.5936 6.37715 13.5949C6.20389 13.5955 6.03064 13.5962 5.85213 13.5969C5.42312 13.5986 4.99413 13.601 4.56514 13.604C4.51869 13.4119 4.47225 13.2199 4.4244 13.022C4.19218 13.022 3.95996 13.022 3.7207 13.022C3.77011 12.6517 3.82934 12.4734 4.08691 12.2051C4.54929 11.9288 4.89314 11.9493 5.42617 11.95Z" fill="#CFCFCF" />
                      <path d="M3.72168 22.77C3.86101 22.842 3.86101 22.842 4.00316 22.9155C4.00316 23.0596 4.00316 23.2036 4.00316 23.352C12.3631 23.352 20.723 23.352 29.3362 23.352C29.3362 23.256 29.3362 23.16 29.3362 23.061C27.2462 23.013 25.1562 22.965 23.0029 22.9155C23.0029 22.8675 23.0029 22.8195 23.0029 22.77C28.4833 22.77 33.9637 22.77 39.6101 22.77C39.4708 22.9141 39.3315 23.0581 39.1879 23.2065C44.3432 23.2786 44.3432 23.2786 49.6026 23.352C49.6026 23.4001 49.6026 23.4481 49.6026 23.4975C34.5083 23.4975 19.4141 23.4975 3.86242 23.4975C3.81597 23.2575 3.76953 23.0174 3.72168 22.77Z" fill="#34A853" />
                      <path d="M3.43945 13.1675C3.76456 13.1675 4.08967 13.1675 4.42463 13.1675C4.42463 16.2885 4.42463 19.4096 4.42463 22.6252C4.09952 22.6252 3.77441 22.6252 3.43945 22.6252C3.43945 19.5042 3.43945 16.3831 3.43945 13.1675Z" fill="#4B4B4B" />
                      <path d="M51.889 12.1294C52.0168 12.1298 52.1445 12.1301 52.2761 12.1305C52.4677 12.13 52.4677 12.13 52.6631 12.1294C52.9798 12.1487 52.9798 12.1487 53.1205 12.2942C53.1769 12.5718 53.2255 12.851 53.27 13.1309C53.2949 13.2832 53.3198 13.4355 53.3454 13.5924C53.3958 13.9914 53.4128 14.3662 53.402 14.7678C53.5413 14.8158 53.6806 14.8638 53.8242 14.9133C54.0292 15.92 54.1335 16.8928 53.6835 17.8234C53.1726 17.8234 52.6617 17.8234 52.1353 17.8234C52.1122 17.499 52.1122 17.499 52.0886 17.168C51.9736 15.6429 51.8349 14.1598 51.5004 12.6682C51.4777 12.5448 51.455 12.4214 51.4316 12.2942C51.5724 12.1487 51.5724 12.1487 51.889 12.1294Z" fill="#3E3E3E" />
                      <path d="M25.2539 15.4951C29.0623 15.4951 32.8707 15.4951 36.7945 15.4951C36.7945 17.0797 36.7945 18.6642 36.7945 20.2967C32.9861 20.2967 29.1777 20.2967 25.2539 20.2967C25.2539 18.7122 25.2539 17.1277 25.2539 15.4951ZM25.5354 15.7861C25.5354 17.1786 25.5354 18.5711 25.5354 20.0057C29.158 20.0057 32.7806 20.0057 36.513 20.0057C36.513 18.6133 36.513 17.2208 36.513 15.7861C32.8904 15.7861 29.2678 15.7861 25.5354 15.7861Z" fill="#D4D4D4" />
                      <path d="M54.8084 11.2762C54.8145 11.5186 54.8142 11.7612 54.8084 12.0037C54.5546 12.2662 54.1658 12.1837 53.8228 12.1952C53.6518 12.2013 53.4807 12.2074 53.3046 12.2137C53.1245 12.2194 52.9444 12.2251 52.7589 12.231C52.5783 12.2373 52.3978 12.2436 52.2117 12.2501C51.7638 12.2656 51.3157 12.2804 50.8677 12.2947C50.8677 12.7303 50.9386 13.1199 51.0179 13.5461C51.3763 15.5465 51.3312 17.5426 51.2901 19.5699C51.2436 19.5699 51.1972 19.5699 51.1493 19.5699C51.1458 19.4569 51.1422 19.344 51.1385 19.2277C51.1221 18.7112 51.1049 18.1948 51.0877 17.6783C51.0821 17.5007 51.0766 17.3231 51.0709 17.1401C50.998 14.7335 50.998 14.7335 50.0233 12.5857C49.6398 12.4535 49.3728 12.4135 48.9749 12.3941C48.8556 12.3881 48.7363 12.382 48.6134 12.3757C48.4894 12.37 48.3655 12.3642 48.2378 12.3583C48.1122 12.3521 47.9864 12.3458 47.857 12.3393C47.547 12.3239 47.2372 12.309 46.9272 12.2947C46.9272 12.1987 46.9272 12.1026 46.9272 12.0037C44.4192 12.0037 41.9111 12.0037 39.3271 12.0037C39.3271 11.9557 39.3271 11.9076 39.3271 11.8582C39.4244 11.8567 39.5217 11.8552 39.6219 11.8536C40.5491 11.8392 41.4762 11.8243 42.4035 11.8088C42.8799 11.8008 43.3562 11.7931 43.8326 11.7858C47.2221 11.7833 47.2221 11.7833 50.5863 11.4217C50.7915 11.419 50.9969 11.422 51.202 11.4308C51.9688 11.4428 52.7102 11.3389 53.4668 11.2213C53.9492 11.1505 54.3448 11.1004 54.8084 11.2762Z" fill="#BAB0A5" />
                      <path d="M29.6354 16.2217C29.8049 16.245 29.8049 16.245 29.9779 16.2689C30.148 16.2905 30.148 16.2905 30.3215 16.3126C30.6024 16.3689 30.6024 16.3689 30.7431 16.5144C30.7573 16.9221 30.7627 17.3254 30.7607 17.733C30.7616 17.9035 30.7616 17.9035 30.7624 18.0774C30.7616 18.5626 30.7518 18.9612 30.6024 19.4245C30.3796 19.4324 30.1568 19.438 29.9339 19.4427C29.8098 19.446 29.6857 19.4494 29.5579 19.4529C29.1769 19.423 28.9662 19.3122 28.6321 19.1335C28.5392 19.1815 28.4463 19.2295 28.3506 19.279C28.3506 18.4627 28.3506 17.6464 28.3506 16.8054C28.5828 16.7094 28.815 16.6133 29.0543 16.5144C29.3358 16.2234 29.3358 16.2234 29.6354 16.2217Z" fill="#E5E7E6" />
                      <path d="M53.6831 17.9692C54.0814 18.6654 54.0217 19.3655 53.9646 20.1518C53.8239 20.6883 53.8239 20.6883 53.6831 21.0248C53.5902 21.0248 53.4973 21.0248 53.4016 21.0248C53.4104 21.2454 53.4104 21.2454 53.4192 21.4704C53.4008 22.0696 53.2986 22.4971 53.1202 23.0619C53.3059 23.1099 53.4917 23.1579 53.6831 23.2074C53.6831 23.3034 53.6831 23.3994 53.6831 23.4984C53.0626 23.6588 52.4891 23.655 51.8535 23.6439C51.9928 23.5719 51.9928 23.5719 52.135 23.4984C52.1321 23.3333 52.1292 23.1683 52.1262 22.9982C52.135 22.4798 52.135 22.4798 52.2757 22.3343C52.6303 20.9624 52.6409 19.525 52.6979 18.1147C53.1202 17.9692 53.1202 17.9692 53.6831 17.9692Z" fill="#595959" />
                      <path d="M51.5721 12.1487C51.9368 14.056 52.2335 15.8747 52.135 17.8233C52.6459 17.8233 53.1568 17.8233 53.6832 17.8233C53.6832 17.8713 53.6832 17.9193 53.6832 17.9688C52.9401 17.9688 52.197 17.9688 51.4313 17.9688C51.394 17.6567 51.3566 17.3446 51.3181 17.023C51.281 16.7172 51.2437 16.4114 51.2063 16.1056C51.1807 15.8948 51.1553 15.684 51.1301 15.4731C50.9403 13.8679 50.9403 13.8679 50.5869 12.2942C50.9335 12.115 51.1892 12.1382 51.5721 12.1487Z" fill="#212121" />
                      <path d="M34.1208 16.3687C34.353 16.4167 34.5852 16.4647 34.8245 16.5142C34.8709 16.7062 34.9174 16.8983 34.9652 17.0962C35.151 17.0962 35.3368 17.0962 35.5282 17.0962C35.5282 17.2882 35.5282 17.4803 35.5282 17.6782C35.0529 17.6 34.5857 17.5166 34.1208 17.3872C34.1469 17.4742 34.1731 17.5612 34.2 17.6509C34.2615 17.9692 34.2615 17.9692 34.1208 18.4057C34.353 18.4057 34.5852 18.4057 34.8245 18.4057C34.8245 18.3097 34.8245 18.2136 34.8245 18.1147C35.0567 18.0667 35.2889 18.0187 35.5282 17.9692C35.5282 18.2093 35.5282 18.4494 35.5282 18.6967C35.3424 18.6967 35.1566 18.6967 34.9652 18.6967C34.9188 18.8888 34.8723 19.0808 34.8245 19.2787C34.5923 19.3267 34.3601 19.3748 34.1208 19.4242C34.086 19.3342 34.0511 19.2442 34.0152 19.1514C33.8379 18.7755 33.8379 18.7755 33.2764 18.5512C33.2764 18.023 33.2764 17.4948 33.2764 16.9507C33.5086 16.9027 33.7408 16.8546 33.9801 16.8052C34.0265 16.6611 34.0729 16.5171 34.1208 16.3687Z" fill="#CCCCCC" />
                      <path d="M4.70617 12.5854C5.86727 12.5854 7.02836 12.5854 8.22464 12.5854C8.22464 12.9216 8.22464 13.2577 8.22464 13.604C7.0171 13.604 5.80956 13.604 4.56543 13.604C4.61187 13.2679 4.65832 12.9317 4.70617 12.5854Z" fill="#D7D7D7" />
                      <path d="M52.416 12.1489C52.7643 12.221 52.7643 12.221 53.1197 12.2944C53.1673 12.5701 53.2141 12.846 53.2604 13.122C53.2866 13.2756 53.3127 13.4292 53.3396 13.5875C53.3942 13.9894 53.4128 14.3631 53.4012 14.768C53.5405 14.816 53.6799 14.864 53.8234 14.9135C53.979 15.6776 54.0406 16.4633 53.9641 17.2416C53.8713 17.3856 53.7784 17.5296 53.6827 17.6781C53.4969 17.6781 53.3111 17.6781 53.1197 17.6781C53.1119 17.5562 53.1041 17.4343 53.0961 17.3087C53.0669 16.8569 53.0372 16.4051 53.0072 15.9534C52.9943 15.7578 52.9816 15.5622 52.9691 15.3666C52.9512 15.0855 52.9324 14.8046 52.9135 14.5236C52.9025 14.3544 52.8914 14.1853 52.88 14.011C52.8622 13.6111 52.8622 13.6111 52.6975 13.313C52.7004 13.1689 52.7033 13.0249 52.7063 12.8764C52.7459 12.4228 52.7459 12.4228 52.416 12.1489Z" fill="#717171" />
                      <path d="M54.8093 11.276C54.8153 11.5185 54.815 11.7611 54.8093 12.0035C54.6686 12.149 54.6686 12.149 54.2521 12.1656C54.07 12.1648 53.888 12.164 53.7004 12.1633C53.5555 12.1629 53.5555 12.1629 53.4076 12.1626C53.0978 12.1618 52.7881 12.16 52.4783 12.1581C52.2688 12.1574 52.0592 12.1567 51.8497 12.1562C51.335 12.1545 50.8203 12.152 50.3057 12.149C50.3057 11.909 50.3057 11.6689 50.3057 11.4215C50.4015 11.4249 50.4972 11.4283 50.5959 11.4318C51.577 11.4506 52.5137 11.3733 53.4816 11.2212C53.9603 11.1498 54.3491 11.1025 54.8093 11.276Z" fill="#C0C0C0" />
                      <path d="M52.707 17.9595C52.9116 17.964 52.9116 17.964 53.1204 17.9686C52.9811 18.0166 52.8417 18.0646 52.6982 18.1141C52.7014 18.2846 52.7047 18.4551 52.7081 18.6307C52.725 19.9008 52.7012 21.0907 52.4167 22.3337C52.3933 22.4588 52.3699 22.5839 52.3458 22.7128C52.276 23.0612 52.276 23.0612 52.1352 23.4977C51.8449 23.5977 51.8449 23.5977 51.5723 23.6432C51.6453 22.9884 51.7368 22.3451 51.8537 21.6971C52.0057 20.7904 52.0522 19.8876 52.0871 18.9695C52.1279 17.9717 52.1279 17.9717 52.707 17.9595Z" fill="#444444" />
                      <path d="M5.40297 11.9605C5.54235 11.9615 5.54235 11.9615 5.68455 11.9624C5.97998 11.9648 6.27528 11.9703 6.57067 11.9759C6.77151 11.9781 6.97236 11.9801 7.17321 11.9818C7.66437 11.9866 8.15546 11.9942 8.64657 12.0032C8.60012 12.5794 8.55368 13.1555 8.50583 13.7492C8.45938 13.7492 8.41294 13.7492 8.36509 13.7492C8.29542 13.173 8.29542 13.173 8.22435 12.5852C7.06325 12.5852 5.90216 12.5852 4.70588 12.5852C4.65943 12.6812 4.61299 12.7772 4.56514 12.8762C4.4244 13.0217 4.4244 13.0217 4.06375 13.0308C3.89394 13.0263 3.89394 13.0263 3.7207 13.0217C3.77026 12.6502 3.82949 12.4728 4.08836 12.2042C4.54428 11.9314 4.8782 11.9536 5.40297 11.9605Z" fill="#C5C5C5" />
                      <path d="M53.2614 18.1143C53.4008 18.1143 53.5401 18.1143 53.6836 18.1143C54.1022 18.7633 54.0197 19.3898 53.9651 20.1513C53.8244 20.6879 53.8244 20.6879 53.6836 21.0243C53.5908 21.0243 53.4979 21.0243 53.4022 21.0243C53.4109 21.2449 53.4109 21.2449 53.4198 21.4699C53.4014 22.0692 53.2991 22.4966 53.1207 23.0614C53.3065 23.1094 53.4922 23.1574 53.6836 23.2069C53.6836 23.3029 53.6836 23.3989 53.6836 23.4979C53.0567 23.5699 53.0567 23.5699 52.417 23.6434C52.5099 23.4993 52.6028 23.3553 52.6985 23.2069C52.7546 22.9237 52.8005 22.6383 52.8392 22.352C52.9515 21.525 52.9515 21.525 53.1284 21.1261C53.3251 20.5453 53.2911 19.9885 53.279 19.3783C53.2777 19.2567 53.2765 19.1351 53.2752 19.0097C53.2719 18.7112 53.2668 18.4127 53.2614 18.1143Z" fill="#848484" />
                      <path d="M53.6845 23.207C53.7309 23.3031 53.7774 23.3991 53.8252 23.498C53.9617 23.495 54.0981 23.492 54.2386 23.4889C54.6697 23.498 54.6697 23.498 54.8104 23.6435C54.8161 23.9345 54.8164 24.2256 54.8104 24.5166C54.1682 24.4963 53.5261 24.4747 52.884 24.4529C52.702 24.4472 52.5199 24.4415 52.3324 24.4356C52.1568 24.4295 51.9813 24.4234 51.8005 24.4171C51.639 24.4118 51.4776 24.4064 51.3113 24.4009C50.9162 24.3742 50.5513 24.3172 50.166 24.2256C50.2589 24.0335 50.3518 23.8414 50.4475 23.6435C50.4939 23.7396 50.5404 23.8356 50.5882 23.9345C51.61 23.8865 52.6318 23.8385 53.6845 23.789C53.638 23.693 53.5916 23.597 53.5438 23.498C53.5902 23.402 53.6366 23.306 53.6845 23.207Z" fill="#CECCCB" />
                      <path d="M52.1357 12.1489C52.4841 12.221 52.4841 12.221 52.8394 12.2944C52.8365 12.4565 52.8336 12.6185 52.8306 12.7855C52.8023 13.2885 52.8023 13.2885 52.9802 13.604C53.0136 13.9897 53.0398 14.3724 53.0593 14.7589C53.0653 14.8696 53.0713 14.9804 53.0774 15.0945C53.1212 15.9561 53.1371 16.8153 53.1209 17.6781C53.3067 17.7261 53.4925 17.7741 53.6839 17.8236C53.4517 17.8236 53.2194 17.8236 52.9802 17.8236C52.7525 17.4061 52.6612 17.0937 52.6454 16.6158C52.6406 16.4975 52.6358 16.3793 52.6308 16.2574C52.6271 16.135 52.6234 16.0126 52.6195 15.8865C52.5906 15.0665 52.5452 14.2689 52.4172 13.4585C52.3708 13.4585 52.3243 13.4585 52.2765 13.4585C52.23 13.0263 52.1836 12.5942 52.1357 12.1489Z" fill="#5C5C5C" />
                      <path d="M38.7646 23.498C38.9039 23.498 39.0432 23.498 39.1868 23.498C39.1868 23.5941 39.1868 23.6901 39.1868 23.7891C39.9299 23.7891 40.673 23.7891 41.4386 23.7891C41.4386 23.8371 41.4386 23.8851 41.4386 23.9346C39.0083 24.1361 36.5793 24.0689 34.1446 24.0226C33.585 24.0122 33.0253 24.0028 32.4657 23.9934C31.3752 23.9748 30.2848 23.9551 29.1943 23.9346C29.1943 23.8385 29.1943 23.7425 29.1943 23.6436C29.3122 23.6439 29.43 23.6442 29.5514 23.6445C30.6594 23.6474 31.7674 23.6497 32.8754 23.6511C33.4451 23.6519 34.0148 23.6529 34.5845 23.6545C35.1339 23.6561 35.6832 23.657 36.2325 23.6574C36.4426 23.6576 36.6526 23.6582 36.8627 23.6589C37.1559 23.66 37.4491 23.6601 37.7423 23.6601C37.9931 23.6606 37.9931 23.6606 38.2489 23.661C38.6128 23.6877 38.6128 23.6877 38.7646 23.498Z" fill="#A8A8A8" />
                      <path d="M29.3352 16.2231C29.6211 16.2356 29.6211 16.2356 29.9685 16.2777C30.1405 16.2974 30.1405 16.2974 30.316 16.3175C30.6018 16.3686 30.6018 16.3686 30.7426 16.5142C30.7624 16.9027 30.7486 17.2889 30.7426 17.6782C30.4985 17.7731 30.4985 17.7731 30.1796 17.8237C29.8784 17.6787 29.8784 17.6787 29.5815 17.469C29.4821 17.4002 29.3826 17.3313 29.2802 17.2604C29.2055 17.2062 29.1307 17.152 29.0537 17.0962C29.1769 16.3868 29.1769 16.3868 29.3352 16.2231Z" fill="#CBCCCC" />
                      <path d="M28.8525 17.9595C29.0223 17.964 29.0223 17.964 29.1956 17.9686C29.1956 18.1126 29.1956 18.2567 29.1956 18.4051C29.4278 18.4531 29.66 18.5011 29.8993 18.5506C29.9872 18.8234 29.9872 18.8234 30.04 19.1326C29.9471 19.2286 29.8542 19.3247 29.7585 19.4236C29.4243 19.369 29.4243 19.369 29.0548 19.2781C28.869 19.2781 28.6833 19.2781 28.4919 19.2781C28.4454 19.2781 28.399 19.2781 28.3511 19.2781C28.3374 18.3829 28.3374 18.3829 28.3511 18.1141C28.4919 17.9686 28.4919 17.9686 28.8525 17.9595Z" fill="#C8C9C9" />
                      <path d="M47.4912 23.4983C47.8548 23.4944 48.2183 23.4915 48.5819 23.4892C48.6846 23.488 48.7873 23.4868 48.8931 23.4855C49.3893 23.4832 49.8289 23.5051 50.306 23.6438C50.2595 23.8359 50.2131 24.0279 50.1653 24.2258C49.2828 24.1778 48.4004 24.1298 47.4912 24.0803C47.4912 23.8882 47.4912 23.6962 47.4912 23.4983Z" fill="#B8A898" />
                      <path d="M53.6827 18.1142C53.5433 18.1142 53.404 18.1142 53.2604 18.1142C53.2739 18.2948 53.2873 18.4755 53.3011 18.6616C53.317 18.9005 53.3327 19.1394 53.3484 19.3783C53.3575 19.4971 53.3666 19.6159 53.3759 19.7384C53.4173 20.3987 53.4088 20.8542 53.1197 21.4608C53.066 21.7992 53.0177 22.1387 52.979 22.4793C52.9325 22.4793 52.8861 22.4793 52.8382 22.4793C52.8382 21.0388 52.8382 19.5984 52.8382 18.1142C53.1888 17.933 53.3183 18.0012 53.6827 18.1142ZM52.6975 22.4793C52.7439 22.4793 52.7904 22.4793 52.8382 22.4793C52.8382 22.8154 52.8382 23.1516 52.8382 23.4979C52.6989 23.4979 52.5596 23.4979 52.416 23.4979C52.5392 22.8067 52.5392 22.8067 52.6975 22.4793Z" fill="#6C6C6C" />
                      <path d="M29.6173 11.7124C29.6173 11.8565 29.6173 12.0005 29.6173 12.1489C26.7842 12.1489 23.9512 12.1489 21.0322 12.1489C21.0322 12.0529 21.0322 11.9568 21.0322 11.8579C22.0892 11.8389 23.1463 11.8199 24.2033 11.801C24.6941 11.7922 25.1849 11.7834 25.6757 11.7746C26.2399 11.7644 26.804 11.7543 27.3682 11.7442C27.5446 11.741 27.721 11.7379 27.9027 11.7346C28.1478 11.7302 28.1478 11.7302 28.3978 11.7258C28.5419 11.7232 28.686 11.7206 28.8344 11.7179C29.0954 11.7139 29.3563 11.7124 29.6173 11.7124Z" fill="#ABABAB" />
                      <path d="M39.3281 11.8579C42.0219 11.8579 44.7156 11.8579 47.491 11.8579C47.491 12.002 47.491 12.146 47.491 12.2944C47.3052 12.2944 47.1194 12.2944 46.928 12.2944C46.928 12.1984 46.928 12.1024 46.928 12.0034C44.4201 12.0034 41.9121 12.0034 39.3281 12.0034C39.3281 11.9554 39.3281 11.9074 39.3281 11.8579Z" fill="#B5B5B5" />
                      <path d="M33.2764 16.2231C34.0195 16.2231 34.7626 16.2231 35.5282 16.2231C35.5746 16.7033 35.6211 17.1835 35.6689 17.6782C35.4832 17.5821 35.2974 17.4861 35.106 17.3872C35.2453 17.3872 35.3846 17.3872 35.5282 17.3872C35.5282 17.2911 35.5282 17.1951 35.5282 17.0962C35.3424 17.0962 35.1566 17.0962 34.9652 17.0962C34.8723 16.9041 34.7795 16.712 34.6838 16.5142C34.138 16.451 34.138 16.451 33.8745 16.7324C33.8165 16.8044 33.7584 16.8765 33.6986 16.9507C33.5593 16.9026 33.4199 16.8546 33.2764 16.8052C33.2764 16.6131 33.2764 16.421 33.2764 16.2231Z" fill="#DDDEDE" />
                      <path d="M33.2765 18.5513C33.7214 18.7506 33.8384 18.8407 34.1209 19.2788C34.3531 19.2308 34.5854 19.1828 34.8246 19.1333C34.8711 18.9892 34.9175 18.8452 34.9653 18.6968C35.1976 18.7448 35.4298 18.7928 35.669 18.8423C35.6226 19.0824 35.5762 19.3224 35.5283 19.5698C34.8316 19.5698 34.135 19.5698 33.4172 19.5698C33.3243 19.3297 33.2314 19.0896 33.1357 18.8423C33.1822 18.7462 33.2286 18.6502 33.2765 18.5513Z" fill="#E0E0E0" />
                      <path d="M35.5291 17.9688C35.5291 18.2087 35.5291 18.4489 35.5291 18.6963C35.3433 18.6963 35.1575 18.6963 34.9661 18.6963C34.9197 18.8883 34.8732 19.0803 34.8254 19.2782C34.5932 19.3262 34.3609 19.3742 34.1217 19.4237C33.9633 18.7325 33.9633 18.7326 34.1217 18.4053C34.3539 18.4053 34.5861 18.4053 34.8254 18.4053C34.8254 18.3092 34.8254 18.2132 34.8254 18.1143C35.1069 17.9688 35.1069 17.9688 35.5291 17.9688Z" fill="#9E9E9E" />
                      <path d="M12.4479 23.4976C12.4479 23.5936 12.4479 23.6896 12.4479 23.7886C14.3521 23.7886 16.2563 23.7886 18.2182 23.7886C18.2182 23.8366 18.2182 23.8846 18.2182 23.9341C16.0354 23.9821 13.8525 24.0301 11.6035 24.0796C11.6035 23.9355 11.6035 23.7915 11.6035 23.6431C12.0257 23.4976 12.0257 23.4976 12.4479 23.4976Z" fill="#B5B5B5" />
                      <path d="M4.98828 12.7305C5.91716 12.7305 6.84604 12.7305 7.80306 12.7305C7.80306 12.8745 7.80306 13.0186 7.80306 13.167C6.87418 13.167 5.94531 13.167 4.98828 13.167C4.98828 13.0229 4.98828 12.8789 4.98828 12.7305Z" fill="#34A853" />
                      <path d="M30.744 18.1145C30.6975 18.5466 30.6511 18.9788 30.6032 19.424C30.3246 19.424 30.0459 19.424 29.7588 19.424C29.782 19.316 29.8052 19.208 29.8292 19.0966C29.9163 18.6689 29.9163 18.6689 29.8995 18.1145C30.181 17.969 30.181 17.969 30.744 18.1145Z" fill="#DEDEDE" />
                      <path d="M50.7277 13.3135C50.8205 13.3615 50.9134 13.4095 51.0091 13.459C51.5509 15.3849 51.3165 17.5911 51.2906 19.5701C51.2442 19.5701 51.1977 19.5701 51.1499 19.5701C51.1446 19.4008 51.1446 19.4008 51.1392 19.228C51.1228 18.7115 51.1055 18.195 51.0883 17.6786C51.0828 17.501 51.0772 17.3233 51.0715 17.1403C51.0372 15.5402 51.0372 15.5402 50.7101 13.9864C50.6694 13.8604 50.6288 13.7343 50.5869 13.6045C50.6334 13.5085 50.6798 13.4124 50.7277 13.3135Z" fill="#B0B0B0" />
                      <path d="M53.1211 23.3525C53.3997 23.4486 53.6784 23.5446 53.9655 23.6435C53.684 23.9346 53.684 23.9346 53.3808 23.9676C53.2584 23.9661 53.1361 23.9645 53.01 23.963C52.8776 23.962 52.7452 23.9611 52.6087 23.9601C52.4701 23.9577 52.3315 23.9553 52.1887 23.9527C52.049 23.9514 51.9093 23.9501 51.7654 23.9488C51.4197 23.9453 51.0741 23.9405 50.7285 23.9346C50.7285 23.7905 50.7285 23.6465 50.7285 23.498C50.8894 23.4997 51.0504 23.5014 51.2162 23.5032C51.426 23.5045 51.6358 23.5058 51.8456 23.5071C51.9519 23.5084 52.0581 23.5096 52.1675 23.5108C52.4385 23.5121 52.7095 23.5056 52.9803 23.498C53.0268 23.45 53.0732 23.402 53.1211 23.3525Z" fill="#B8B8B8" />
                      <path d="M52.417 13.3125C52.4634 13.3125 52.5099 13.3125 52.5577 13.3125C52.6893 14.2964 52.7438 15.2723 52.7837 16.2641C52.7889 16.3817 52.7942 16.4993 52.7996 16.6204C52.8039 16.7258 52.8082 16.8312 52.8125 16.9397C52.8397 17.2467 52.9001 17.5266 52.9799 17.8231C52.8406 17.7751 52.7013 17.7271 52.5577 17.6776C52.5099 17.1927 52.4633 16.7076 52.417 16.2226C52.4036 16.0866 52.3901 15.9506 52.3763 15.8105C52.3017 15.0224 52.2479 14.25 52.2763 13.458C52.3227 13.41 52.3691 13.362 52.417 13.3125Z" fill="#4D4D4D" />
                      <path d="M50.3047 11.4219C51.28 11.4939 51.28 11.4939 52.275 11.5674C52.275 11.6154 52.275 11.6634 52.275 11.7129C52.693 11.7849 52.693 11.7849 53.1195 11.8584C53.1195 11.9064 53.1195 11.9544 53.1195 12.0039C52.1906 12.0519 51.2617 12.0999 50.3047 12.1494C50.3047 11.9093 50.3047 11.6692 50.3047 11.4219Z" fill="#CCCAC9" />
                      <path d="M39.1871 11.7129C39.1871 11.905 39.1871 12.097 39.1871 12.2949C39.1175 12.2718 39.048 12.2488 38.9764 12.225C38.4837 12.1193 37.9929 12.115 37.4916 12.1034C37.3831 12.1003 37.2745 12.0973 37.1627 12.0942C36.8171 12.0847 36.4716 12.0761 36.126 12.0676C35.8912 12.0613 35.6565 12.0549 35.4217 12.0485C34.8473 12.033 34.2728 12.0182 33.6982 12.0039C33.6982 11.9559 33.6982 11.9079 33.6982 11.8584C34.4121 11.8376 35.1259 11.8169 35.8397 11.7962C36.0826 11.7892 36.3255 11.7821 36.5683 11.7751C36.9173 11.7649 37.2663 11.7548 37.6153 11.7447C37.7239 11.7415 37.8326 11.7384 37.9445 11.7351C38.3589 11.7232 38.7725 11.7129 39.1871 11.7129Z" fill="#A2A2A2" />
                      <path d="M53.2611 18.1143C53.4004 18.1143 53.5398 18.1143 53.6833 18.1143C53.6833 18.9305 53.6833 19.7468 53.6833 20.5878C53.5904 20.6358 53.4975 20.6839 53.4018 20.7333C53.2321 20.2068 53.2459 19.7257 53.2523 19.1783C53.2529 19.0761 53.2536 18.974 53.2542 18.8688C53.2559 18.6173 53.2584 18.3658 53.2611 18.1143Z" fill="#959595" />
                      <path d="M34.8248 17.2412C34.8712 17.3853 34.9177 17.5293 34.9655 17.6777C35.2491 17.7844 35.2491 17.7844 35.5285 17.8232C35.2963 17.9193 35.064 18.0153 34.8248 18.1142C34.8248 18.2103 34.8248 18.3063 34.8248 18.4052C34.5926 18.4052 34.3604 18.4052 34.1211 18.4052C34.1211 18.0691 34.1211 17.733 34.1211 17.3867C34.3533 17.3387 34.5855 17.2907 34.8248 17.2412Z" fill="#E6E6E6" />
                      <path d="M29.6175 11.8579C30.9644 11.8579 32.3113 11.8579 33.699 11.8579C33.699 11.9059 33.699 11.9539 33.699 12.0034C33.6175 12.0071 33.5361 12.0107 33.4522 12.0145C31.3205 12.1062 31.3205 12.1062 29.1953 12.2944C29.3346 12.2464 29.474 12.1984 29.6175 12.1489C29.6175 12.0529 29.6175 11.9569 29.6175 11.8579Z" fill="#B8B8B8" />
                      <path d="M50.8682 20.4429C50.9611 20.4429 51.054 20.4429 51.1497 20.4429C51.1336 20.7703 51.1156 21.0977 51.0969 21.425C51.0822 21.6985 51.0822 21.6985 51.0672 21.9775C51.0155 22.4232 50.9531 22.6865 50.7275 23.0619C50.5582 22.1168 50.6452 21.3727 50.8682 20.4429Z" fill="#B6B6B6" />
                      <path d="M53.2604 14.0405C53.3069 14.0405 53.3533 14.0405 53.4012 14.0405C53.4215 14.2056 53.4418 14.3706 53.4627 14.5407C53.4873 15.0311 53.4873 15.0311 53.6826 15.2046C53.6928 15.4984 53.6944 15.7926 53.6914 16.0867C53.6902 16.2474 53.6889 16.4082 53.6876 16.5738C53.686 16.6981 53.6843 16.8225 53.6826 16.9506C53.6362 16.9506 53.5898 16.9506 53.5419 16.9506C53.5419 16.6625 53.5419 16.3744 53.5419 16.0776C53.449 16.0776 53.3561 16.0776 53.2604 16.0776C53.1319 15.3543 53.1319 14.7638 53.2604 14.0405Z" fill="#A0A0A0" />
                      <path d="M53.5431 18.4058C53.6824 18.4538 53.8217 18.5018 53.9653 18.5513C54.0172 20.2277 54.0172 20.2277 53.6838 21.0248C53.5909 21.0248 53.498 21.0248 53.4023 21.0248C53.4488 20.8808 53.4952 20.7367 53.5431 20.5883C53.553 20.214 53.5563 19.8439 53.5519 19.4698C53.5509 19.3166 53.5509 19.3166 53.55 19.1603C53.5483 18.9088 53.5458 18.6573 53.5431 18.4058Z" fill="#5E5E5E" />
                      <path d="M28.9135 16.6602C29.0529 16.8522 29.1922 17.0443 29.3358 17.2422C29.1598 17.4604 29.1598 17.4604 28.9135 17.6787C28.7278 17.6787 28.542 17.6787 28.3506 17.6787C28.3506 17.3906 28.3506 17.1025 28.3506 16.8057C28.5364 16.7576 28.7221 16.7096 28.9135 16.6602Z" fill="#CFD0D0" />
                      <path d="M53.4014 14.7681C53.5407 14.8161 53.68 14.8641 53.8236 14.9136C53.9824 15.6936 53.978 16.4491 53.9643 17.2416C53.825 17.2896 53.6857 17.3377 53.5421 17.3871C53.5437 17.2346 53.5454 17.0822 53.5471 16.925C53.5484 16.7244 53.5497 16.5238 53.5509 16.3231C53.5521 16.2227 53.5533 16.1223 53.5545 16.0188C53.5566 15.5613 53.5424 15.2054 53.4014 14.7681Z" fill="#5C5C5C" />
                      <path d="M34.1212 16.3682C34.3534 16.4162 34.5856 16.4642 34.8249 16.5137C34.7785 16.7537 34.732 16.9938 34.6842 17.2412C34.4519 17.1932 34.2197 17.1452 33.9805 17.0957C34.0269 16.8556 34.0734 16.6155 34.1212 16.3682Z" fill="#7E8080" />
                      <path d="M54.8094 11.2762C54.8094 11.3722 54.8094 11.4683 54.8094 11.5672C54.0663 11.5672 53.3232 11.5672 52.5576 11.5672C53.2656 11.2012 54.0347 10.9758 54.8094 11.2762Z" fill="#B5B5B5" />
                      <path d="M38.7646 23.4985C38.904 23.4985 39.0434 23.4985 39.187 23.4985C39.187 23.5946 39.187 23.6906 39.187 23.7895C39.9301 23.7895 40.6732 23.7895 41.4388 23.7895C41.4388 23.8376 41.4388 23.8856 41.4388 23.935C40.1151 24.0071 40.115 24.0071 38.7646 24.0805C38.7646 23.8885 38.7646 23.6964 38.7646 23.4985Z" fill="#959595" />
                      <path d="M52.2766 17.9688C52.3694 17.9688 52.4623 17.9688 52.558 17.9688C52.4224 19.3378 52.4224 19.3379 52.2766 20.0058C52.2301 20.0058 52.1837 20.0058 52.1358 20.0058C52.132 19.6936 52.1293 19.3813 52.127 19.069C52.1254 18.8951 52.1238 18.7214 52.1221 18.5422C52.1358 18.1143 52.1358 18.1143 52.2766 17.9688Z" fill="#3A3A3A" />
                      <path d="M53.2607 16.0776C53.3536 16.0776 53.4465 16.0776 53.5422 16.0776C53.5887 16.6058 53.6351 17.134 53.683 17.6782C53.5436 17.6782 53.4043 17.6782 53.2607 17.6782C53.2607 17.15 53.2607 16.6218 53.2607 16.0776Z" fill="#7A7A7A" />
                      <path d="M29.1954 18.5513C29.2883 18.5513 29.3812 18.5513 29.4769 18.5513C29.4769 18.6953 29.4769 18.8394 29.4769 18.9878C29.6162 18.9878 29.7556 18.9878 29.8991 18.9878C29.8527 19.1318 29.8062 19.2759 29.7584 19.4243C29.5262 19.3763 29.2939 19.3283 29.0547 19.2788C29.1011 19.0387 29.1476 18.7986 29.1954 18.5513Z" fill="#6A6C6B" />
                      <path d="M28.6319 18.9873C29.0073 19.1813 29.3826 19.3753 29.7579 19.5693C29.3399 19.5693 28.9219 19.5693 28.4912 19.5693C28.4912 19.1328 28.4912 19.1328 28.6319 18.9873Z" fill="#E1E2E2" />
                      <path d="M30.1798 17.9688C30.4585 18.0407 30.4585 18.0408 30.7428 18.1143C30.6963 18.3063 30.6499 18.4984 30.602 18.6963C30.4162 18.6483 30.2305 18.6002 30.0391 18.5508C30.0855 18.3587 30.132 18.1665 30.1798 17.9688Z" fill="#C5C5C5" />
                      <path d="M29.1954 16.3687C29.3348 16.3687 29.4741 16.3687 29.6176 16.3687C29.6641 16.6567 29.7105 16.9448 29.7584 17.2417C29.5262 17.1937 29.2939 17.1456 29.0547 17.0962C29.1011 16.8561 29.1476 16.616 29.1954 16.3687Z" fill="#676969" />
                      <path d="M28.4913 16.2236C28.77 16.2236 29.0487 16.2236 29.3358 16.2236C29.1598 16.5146 29.1598 16.5146 28.9135 16.8056C28.7278 16.8056 28.542 16.8056 28.3506 16.8056C28.397 16.6136 28.4435 16.4215 28.4913 16.2236Z" fill="#E1E2E2" />
                      <path d="M47.4902 23.4985C47.7225 23.4985 47.9547 23.4985 48.1939 23.4985C48.1939 23.6906 48.1939 23.8827 48.1939 24.0805C47.9617 24.0805 47.7295 24.0805 47.4902 24.0805C47.4902 23.8885 47.4902 23.6964 47.4902 23.4985Z" fill="#5F5F5F" />
                      <path d="M47.4912 11.7119C47.7234 11.7119 47.9556 11.7119 48.1949 11.7119C48.1949 11.904 48.1949 12.096 48.1949 12.2939C47.9627 12.2939 47.7305 12.2939 47.4912 12.2939C47.4912 12.1019 47.4912 11.9098 47.4912 11.7119Z" fill="#5E5E5E" />
                      <path d="M3.86167 11.8579C3.95456 12.002 4.04745 12.146 4.14315 12.2944C3.94963 12.6582 3.94963 12.6582 3.72093 13.0219C3.62804 13.0219 3.53516 13.0219 3.43945 13.0219C3.54501 12.1853 3.54501 12.1853 3.86167 11.8579Z" fill="#BEBEBE" />
                      <path d="M53.6837 23.207C53.7302 23.3031 53.7766 23.3991 53.8244 23.498C54.1031 23.498 54.3818 23.498 54.6689 23.498C54.7153 23.6421 54.7618 23.7861 54.8096 23.9345C54.1826 23.7905 54.1826 23.7905 53.543 23.6435C53.5894 23.4995 53.6359 23.3554 53.6837 23.207Z" fill="#C9C9C9" />
                      <path d="M12.4479 23.4976C12.3551 23.6896 12.2622 23.8817 12.1665 24.0796C11.9807 24.0796 11.7949 24.0796 11.6035 24.0796C11.6035 23.9355 11.6035 23.7915 11.6035 23.6431C12.0257 23.4976 12.0257 23.4976 12.4479 23.4976Z" fill="#7E7E7E" />
                      <path d="M4.00316 12.2944C4.09605 12.2944 4.18893 12.2944 4.28464 12.2944C4.28464 12.5345 4.28464 12.7746 4.28464 13.022C4.09886 13.022 3.91308 13.022 3.72168 13.022C3.84483 12.4581 3.84483 12.4581 4.00316 12.2944Z" fill="#E4E4E4" />
                    </g>
                  </svg>

                  <div style={{
                    height: 6,
                    width: dynamicDistance,
                    borderRadius: 8,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    maxWidth: '100%',
                    transition: 'width 0.5s ease-in-out'
                  }}></div>

                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: "center",
                  justifyContent: 'center'
                }} >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: "center",
                    justifyContent: 'center'

                  }}>
                    <p style={{ fontWeight: '500', fontSize: 13, textAlign: 'center' }}>
                      {closestStopName === startPoint?.name ? dropOff?.name : startPoint?.name ?? dropOff?.name ?? 'Unknown stop'}
                    </p>

                    <p style={{
                      fontSize: 11,
                      color: 'rgba(0,0,0,0.5)',
                      padding: 2,
                      borderRadius: 4,
                      backgroundColor: '#fafafa',
                    }}>Arrriving</p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: "center",
                    gap: 4,
                    borderRadius: 6,
                  }}>

                    <p style={{
                      fontSize: 12,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      minWidth: 48,
                    }}>
                      {closest?.driver?.coords?.timestamp && timeInMinutes
                        ? (() => {
                          const startTime = new Date(closest.driver.coords.timestamp);
                          const arrivalTime = new Date(startTime.getTime() + (Number(timeInMinutes) * 60 * 1000));
                          return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        })()
                        : '--:--'}
                    </p>
                  </div>
                </div>

              </section>

              <section style={{
                display: 'flex',
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.1)',
                paddingInline: 16,
                paddingBlock: 12,
                flexDirection: 'column',
                gap: 16,

              }}>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: '700'
                }}>Bus Stops</p>

                {isMobile ? (
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    overflow: 'hidden',
                    overflowX: 'auto',
                    maxWidth: 600,
                    flexDirection: 'row',
                  }}>

                    {

                      reached === false ?
                        filteredDropPointsForUI?.reverse()?.map((dropPoint: DropPoint, index: number) => (
                          <div key={dropPoint.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              flexDirection: 'column',
                              minWidth: 60,
                              justifyContent: 'center',
                            }}>

                              {(() => {
                                let iconColor = "white";
                                let iconBg = "#52B922";

                                let busHasPassed = false;
                                if (closest?.driver?.coords && dropPoint && filteredDropPointsForUI && startPoint) {
                                  const driverPos = {
                                    latitude: closest.driver.coords.latitude,
                                    longitude: closest.driver.coords.longitude,
                                  };
                                  const dropPoints = filteredDropPointsForUI;
                                  const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);

                                  // Calculate cumulative distance from start to this stop
                                  let stopDistance = 0;
                                  for (let i = 0; i <= thisIndex; i++) {
                                    const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                    const curr = dropPoints[i];
                                    stopDistance += getDistance(
                                      { latitude: prev.latitude, longitude: prev.longitude },
                                      { latitude: curr.latitude, longitude: curr.longitude }
                                    );
                                  }

                                  // Calculate distance from start to driver
                                  const driverDistance = getDistance(
                                    { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                    driverPos
                                  );

                                  // If driverDistance > stopDistance, bus has passed this stop
                                  busHasPassed = driverDistance > stopDistance;

                                  // If bus is within 100m of this stop, keep green
                                  const dropPos = {
                                    latitude: dropPoint.latitude,
                                    longitude: dropPoint.longitude,
                                  };
                                  const dist = getDistance(driverPos, dropPos);
                                  if (dist <= 100) {
                                    iconColor = "white";
                                    iconBg = "#52B922";
                                  } else if (busHasPassed) {
                                    iconColor = "rgba(0,0,0,.5)";
                                    iconBg = "rgba(0,0,0,0.2)";
                                  } else {
                                    iconColor = "rgba(0,0,0,.5)";
                                    iconBg = "#fafafa";
                                  }
                                }

                                // Use the 'reached' condition to highlight the current stop
                                if (!reached && dropPoint.latitude === startPoint?.latitude && dropPoint.longitude === startPoint?.longitude) {
                                  iconColor = "#fff";
                                  iconBg = "#4285F4";
                                }

                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: 4,
                                      backgroundColor: iconBg,
                                      borderRadius: 40,
                                      transition: "background 0.3s",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 25"
                                      fill="none"
                                    >
                                      <path
                                        d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z"
                                        fill={iconColor}
                                        fillOpacity="1"
                                      />
                                    </svg>
                                  </div>
                                );
                              })()}

                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                alignItems: 'center',
                                width: 'auto'
                              }}>
                                <p style={{
                                  margin: 0,
                                  fontSize: 12,
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  color: reached ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.5)',
                                }}>{dropPoint.name}</p>


                              </div>


                            </div>
                            {index < (filteredDropPointsForUI ?? []).length - 1 && (
                              <div style={{
                                width: 30,
                                height: 4,
                                borderRadius: 24,
                                backgroundColor: (() => {
                                  // Use green if bus hasn't passed, else faded
                                  let busHasPassed = false;
                                  if (closest?.driver?.coords && dropPoint && filteredDropPointsForUI && startPoint) {
                                    const driverPos = {
                                      latitude: closest.driver.coords.latitude,
                                      longitude: closest.driver.coords.longitude,
                                    };
                                    const dropPoints = filteredDropPointsForUI;
                                    const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);


                                    let stopDistance = 0;
                                    for (let i = 0; i <= thisIndex; i++) {
                                      const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                      const curr = dropPoints[i];
                                      stopDistance += getDistance(
                                        { latitude: prev.latitude, longitude: prev.longitude },
                                        { latitude: curr.latitude, longitude: curr.longitude }
                                      );
                                    }

                                    // Calculate distance from start to driver
                                    const driverDistance = getDistance(
                                      { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                      driverPos
                                    );

                                    busHasPassed = driverDistance > stopDistance;
                                  }
                                  return busHasPassed ? 'rgba(0,0,0,0.2)' : '#52B922';
                                })()
                              }}></div>
                            )}
                          </div>
                        ))
                        :

                        filteredDropPointsForUI?.map((dropPoint: DropPoint, index: number) => (
                          <div key={dropPoint.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              flexDirection: 'column',
                              minWidth: 60,
                              justifyContent: 'center',
                            }}>

                              {(() => {
                                // Calculate distance from driver to this dropPoint
                                let iconColor = "white";
                                let iconBg = "#fafafa"; // default: faded

                                let busHasPassed = false;
                                if (closest?.driver?.coords && dropPoint && filteredDropPointsForUI && startPoint) {
                                  const driverPos = {
                                    latitude: closest.driver.coords.latitude,
                                    longitude: closest.driver.coords.longitude,
                                  };
                                  const dropPoints = filteredDropPointsForUI;
                                  const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);

                                  // Calculate cumulative distance from start to this stop
                                  let stopDistance = 0;
                                  for (let i = 0; i <= thisIndex; i++) {
                                    const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                    const curr = dropPoints[i];
                                    stopDistance += getDistance(
                                      { latitude: prev.latitude, longitude: prev.longitude },
                                      { latitude: curr.latitude, longitude: curr.longitude }
                                    );
                                  }

                                  // Calculate distance from start to driver
                                  const driverDistance = getDistance(
                                    { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                    driverPos
                                  );

                                  // If driverDistance > stopDistance, bus has passed this stop
                                  busHasPassed = driverDistance > stopDistance;

                                  // If bus is within 100m of this stop, keep green
                                  const dropPos = {
                                    latitude: dropPoint.latitude,
                                    longitude: dropPoint.longitude,
                                  };
                                  const dist = getDistance(driverPos, dropPos);
                                  if (dist <= 100) {
                                    iconColor = "white";
                                    iconBg = "#52B922";
                                  } else if (busHasPassed) {
                                    iconColor = "rgba(0,0,0,.5)";
                                    iconBg = "#52B922"; // green only if bus has made this stop
                                  } else {
                                    iconColor = "rgba(0,0,0,.5)";
                                    iconBg = "#fafafa";
                                  }
                                }

                                // Use the 'reached' condition to highlight the current stop
                                if (!reached && dropPoint.latitude === startPoint?.latitude && dropPoint.longitude === startPoint?.longitude) {
                                  iconColor = "#fff";
                                  iconBg = "#4285F4";
                                }

                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: 4,
                                      backgroundColor: iconBg,
                                      borderRadius: 40,
                                      transition: "background 0.3s",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 25"
                                      fill="none"
                                    >
                                      <path
                                        d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z"
                                        fill={iconColor}
                                        fillOpacity="1"
                                      />
                                    </svg>
                                  </div>
                                );
                              })()}

                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                alignItems: 'center',
                                width: 'auto'
                              }}>
                                <p style={{
                                  margin: 0,
                                  fontSize: 12,
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  color:
                                    dropPoint.latitude === closest?.driver?.coords?.latitude &&
                                      dropPoint.longitude === closest?.driver?.coords?.longitude
                                      ? 'rgba(0,0,0,1)'
                                      : 'rgba(0,0,0,0.6)',
                                }}>
                                  {dropPoint.name}
                                </p>

                              </div>
                            </div>
                            {index < (filteredDropPointsForUI ?? []).length - 1 && (
                              <div style={{
                                width: 30,
                                height: 4,
                                borderRadius: 24,
                                backgroundColor: (() => {
                                  let busHasPassed = false;
                                  if (closest?.driver?.coords && dropPoint && filteredDropPointsForUI && startPoint) {
                                    const driverPos = {
                                      latitude: closest.driver.coords.latitude,
                                      longitude: closest.driver.coords.longitude,
                                    };
                                    const dropPoints = filteredDropPointsForUI;
                                    const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);


                                    let stopDistance = 0;
                                    for (let i = 0; i <= thisIndex; i++) {
                                      const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                      const curr = dropPoints[i];
                                      stopDistance += getDistance(
                                        { latitude: prev.latitude, longitude: prev.longitude },
                                        { latitude: curr.latitude, longitude: curr.longitude }
                                      );
                                    }


                                    const driverDistance = getDistance(
                                      { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                      driverPos
                                    );

                                    busHasPassed = driverDistance > stopDistance;
                                  }
                                  return busHasPassed ? '#52B922' : 'rgba(0,0,0,0.2)';
                                })()
                              }}></div>
                            )}
                          </div>
                        ))

                    }

                  </div>
                )

                  :
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    overflow: 'hidden',
                    overflowY: 'auto',
                    maxHeight: 'calc(70vh - 220px)',
                    paddingRight: 8,
                  }}>
                    {
                      reached === false
                        ? (filteredDropPointsForUI ? filteredDropPointsForUI.slice().reverse() : []).map((dropPoint: DropPoint, index: number) => {
                          // Calculate ETA for each stop based on cumulative distance and speed
                          // let eta = '--:--';
                          if (closest?.driver?.coords?.timestamp && startPoint) {
                            const dropPoints = filteredDropPointsForUI ? filteredDropPointsForUI.slice().reverse() : [];
                            const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);
                            let cumulativeDistance = 0;
                            for (let i = 0; i <= thisIndex; i++) {
                              const prev = i === 0 ? startPoint : dropPoints[i - 1];
                              const curr = dropPoints[i];
                              cumulativeDistance += getDistance(
                                { latitude: prev.latitude, longitude: prev.longitude },
                                { latitude: curr.latitude, longitude: curr.longitude }
                              );
                            }
                          }
                          return (
                            <div key={dropPoint.name}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  gap: 8,
                                  paddingRight: 8,
                                  alignItems: 'center'
                                }}>

                                  {(() => {
                                    // Calculate distance from driver to this dropPoint
                                    let iconColor = "white";
                                    let iconBg = "#52B922";

                                    let busHasPassed = false;
                                    if (closest?.driver?.coords && dropPoint && filteredDropPointsForUI && startPoint) {
                                      const driverPos = {
                                        latitude: closest.driver.coords.latitude,
                                        longitude: closest.driver.coords.longitude,
                                      };
                                      const dropPoints = filteredDropPointsForUI;
                                      const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);

                                      // Calculate cumulative distance from start to this stop
                                      let stopDistance = 0;
                                      for (let i = 0; i <= thisIndex; i++) {
                                        const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                        const curr = dropPoints[i];
                                        stopDistance += getDistance(
                                          { latitude: prev.latitude, longitude: prev.longitude },
                                          { latitude: curr.latitude, longitude: curr.longitude }
                                        );
                                      }

                                      // Calculate distance from start to driver
                                      const driverDistance = getDistance(
                                        { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                        driverPos
                                      );

                                      // If driverDistance > stopDistance, bus has passed this stop
                                      busHasPassed = driverDistance > stopDistance;

                                      // If bus is within 100m of this stop, keep green
                                      const dropPos = {
                                        latitude: dropPoint.latitude,
                                        longitude: dropPoint.longitude,
                                      };
                                      const dist = getDistance(driverPos, dropPos);
                                      if (dist <= 100) {
                                        iconColor = "white";
                                        iconBg = "#52B922";
                                      } else if (busHasPassed) {
                                        iconColor = "rgba(0,0,0,.5)";
                                        iconBg = "#fafafa";
                                      } else {
                                        iconColor = "rgba(0,0,0,.5)";
                                        iconBg = "#fafafa";
                                      }
                                    }

                                    // Use the 'reached' condition to highlight the current stop
                                    if (!reached && dropPoint.latitude === startPoint?.latitude && dropPoint.longitude === startPoint?.longitude) {
                                      iconColor = "#fff";
                                      iconBg = "#4285F4";
                                    }

                                    return (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          padding: 4,
                                          backgroundColor: iconBg,
                                          borderRadius: 40,
                                          transition: "background 0.3s",
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 25"
                                          fill="none"
                                        >
                                          <path
                                            d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z"
                                            fill={iconColor}
                                            fillOpacity="1"
                                          />
                                        </svg>
                                      </div>
                                    );
                                  })()}
                                  <p style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color:
                                      dropPoint.latitude === closest?.driver?.coords?.latitude &&
                                        dropPoint.longitude === closest?.driver?.coords?.longitude
                                        ? 'rgba(0,0,0,1)'
                                        : 'rgba(0,0,0,0.6)',
                                  }}>{dropPoint.name}</p>
                                </div>

                              </div>
                              {index < (filteredDropPointsForUI ?? []).length - 1 && (
                                <div style={{
                                  height: 16,
                                  width: 2,
                                  backgroundColor: (() => {
                                    // If the bus has not made it to the previous bus stop, use 'rgba(0,0,0,0.2)'
                                    // If it has made the previous bus stop, use '#52B922'
                                    let hasMadePrevious = false;
                                    if (
                                      closest?.driver?.coords &&
                                      filteredDropPointsForUI &&
                                      startPoint
                                    ) {
                                      const driverPos = {
                                        latitude: closest.driver.coords.latitude,
                                        longitude: closest.driver.coords.longitude,
                                      };
                                      const dropPoints = filteredDropPointsForUI;
                                      // Previous stop index
                                      const prevIndex = index;
                                      // If prevIndex < 0, treat as not made
                                      if (prevIndex >= 0) {
                                        // Calculate cumulative distance from start to previous stop
                                        let prevStopDistance = 0;
                                        for (let i = 0; i <= prevIndex; i++) {
                                          const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                          const curr = dropPoints[i];
                                          prevStopDistance += getDistance(
                                            { latitude: prev.latitude, longitude: prev.longitude },
                                            { latitude: curr.latitude, longitude: curr.longitude }
                                          );
                                        }
                                        // Calculate distance from start to driver
                                        const driverDistance = getDistance(
                                          { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                          driverPos
                                        );
                                        hasMadePrevious = driverDistance > prevStopDistance;
                                      }
                                    }
                                    return hasMadePrevious ? '#52B922' : '#fafafa';
                                  })(),
                                  marginLeft: '4.5%',
                                  marginTop: '2%'
                                }}></div>
                              )}
                            </div>
                          );
                        })
                        : filteredDropPointsForUI?.map((dropPoint: DropPoint, index: number) => {
                          // Calculate ETA for each stop based on cumulative distance and speed
                          let eta = '--:--';
                          if (closest?.driver?.coords?.timestamp && startPoint) {
                            const dropPoints = filteredDropPointsForUI || [];
                            const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);
                            let cumulativeDistance = 0;
                            for (let i = 0; i <= thisIndex; i++) {
                              const prev = i === 0 ? startPoint : dropPoints[i - 1];
                              const curr = dropPoints[i];
                              cumulativeDistance += getDistance(
                                { latitude: prev.latitude, longitude: prev.longitude },
                                { latitude: curr.latitude, longitude: curr.longitude }
                              );
                            }
                            const speed = closest.driver.coords.speed || 20; // km/h
                            const speedMps = (speed * 1000) / 3600;
                            const seconds = speedMps > 0 ? cumulativeDistance / speedMps : 0;
                            const startTime = new Date(closest.driver.coords.timestamp);
                            eta = new Date(startTime.getTime() + seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          }
                          return (
                            <div key={dropPoint.name}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  gap: 8,
                                  paddingRight: 8,
                                  alignItems: 'center',
                                }}>
                                  {(() => {
                                    // Calculate distance from driver to this dropPoint
                                    let iconColor = "white";
                                    let iconBg = "#52B922";

                                    let busHasPassed = false;
                                    if (closest?.driver?.coords && dropPoint && filteredDropPointsForUI && startPoint) {
                                      const driverPos = {
                                        latitude: closest.driver.coords.latitude,
                                        longitude: closest.driver.coords.longitude,
                                      };
                                      const dropPoints = filteredDropPointsForUI;
                                      const thisIndex = dropPoints.findIndex(dp => dp.name === dropPoint.name);

                                      // Calculate cumulative distance from start to this stop
                                      let stopDistance = 0;
                                      for (let i = 0; i <= thisIndex; i++) {
                                        const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                        const curr = dropPoints[i];
                                        stopDistance += getDistance(
                                          { latitude: prev.latitude, longitude: prev.longitude },
                                          { latitude: curr.latitude, longitude: curr.longitude }
                                        );
                                      }

                                      // Calculate distance from start to driver
                                      const driverDistance = getDistance(
                                        { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                        driverPos
                                      );

                                      // If driverDistance > stopDistance, bus has passed this stop
                                      busHasPassed = driverDistance > stopDistance;

                                      // If bus is within 100m of this stop, keep green
                                      const dropPos = {
                                        latitude: dropPoint.latitude,
                                        longitude: dropPoint.longitude,
                                      };
                                      const dist = getDistance(driverPos, dropPos);
                                      if (dist <= 100) {
                                        iconColor = "white";
                                        iconBg = "#52B922";
                                      } else if (busHasPassed) {
                                        iconColor = "rgba(0,0,0,.5)";
                                        iconBg = "#fafafa";
                                      } else {
                                        iconColor = "rgba(0,0,0,.5)";
                                        iconBg = "#fafafa";
                                      }
                                    }

                                    // Use the 'reached' condition to highlight the current stop
                                    if (!reached && dropPoint.latitude === startPoint?.latitude && dropPoint.longitude === startPoint?.longitude) {
                                      iconColor = "#fff";
                                      iconBg = "#4285F4";
                                    }

                                    return (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          padding: 4,
                                          backgroundColor: iconBg,
                                          borderRadius: 40,
                                          transition: "background 0.3s",
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 25"
                                          fill="none"
                                        >
                                          <path
                                            d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z"
                                            fill={iconColor}
                                            fillOpacity="1"
                                          />
                                        </svg>
                                      </div>
                                    );
                                  })()}
                                  <p style={{
                                    margin: 0,
                                    fontSize: 14,
                                    color:
                                      dropPoint.latitude === closest?.driver?.coords?.latitude &&
                                        dropPoint.longitude === closest?.driver?.coords?.longitude
                                        ? 'rgba(0,0,0,1)'
                                        : 'rgba(0,0,0,0.6)',
                                  }}>{dropPoint.name}</p>
                                </div>
                                <p style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color:
                                    dropPoint.latitude === closest?.driver?.coords?.latitude &&
                                      dropPoint.longitude === closest?.driver?.coords?.longitude
                                      ? 'rgba(0,0,0,1)'
                                      : 'rgba(0,0,0,0.6)',
                                }}>
                                  {eta}
                                </p>
                              </div>
                              {index < filteredDropPointsForUI.length - 1 && (
                                <div style={{
                                  height: 16,
                                  width: 2,
                                  backgroundColor: (() => {
                                    // If the bus has not made it to the previous bus stop, use 'rgba(0,0,0,0.2)'
                                    // If it has made the previous bus stop, use '#52B922'
                                    let hasMadePrevious = false;
                                    if (
                                      closest?.driver?.coords &&
                                      filteredDropPointsForUI &&
                                      startPoint
                                    ) {
                                      const driverPos = {
                                        latitude: closest.driver.coords.latitude,
                                        longitude: closest.driver.coords.longitude,
                                      };
                                      const dropPoints = filteredDropPointsForUI;
                                      // Previous stop index
                                      const prevIndex = index;
                                      // If prevIndex < 0, treat as not made
                                      if (prevIndex >= 0) {
                                        // Calculate cumulative distance from start to previous stop
                                        let prevStopDistance = 0;
                                        for (let i = 0; i <= prevIndex; i++) {
                                          const prev = i === 0 ? startPoint : dropPoints[i - 1];
                                          const curr = dropPoints[i];
                                          prevStopDistance += getDistance(
                                            { latitude: prev.latitude, longitude: prev.longitude },
                                            { latitude: curr.latitude, longitude: curr.longitude }
                                          );
                                        }
                                        // Calculate distance from start to driver
                                        const driverDistance = getDistance(
                                          { latitude: startPoint.latitude, longitude: startPoint.longitude },
                                          driverPos
                                        );
                                        hasMadePrevious = driverDistance > prevStopDistance;
                                      }
                                    }
                                    return hasMadePrevious ? '#52B922' : 'rgba(0,0,0,0.2)';
                                  })(),
                                  marginLeft: '4.5%',
                                  marginTop: '2%'
                                }}></div>
                              )}
                            </div>
                          );
                        })
                    }
                  </div>
                }
              </section>

              <section style={{
                display: 'flex',
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.1)',
                paddingInline: 16,
                paddingBlock: 12,
                flexDirection: 'column',
                gap: 16,

              }}>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: '700'
                }}>Passengers</p>

                <section className="flex flex-col gap-2 w-full">
                  {filteredBusStops.map((stop: { id: Key | null | undefined; name: string; color: string; dotColor: string; waiting: string; }) => (
                    <BusStopCard
                      key={stop.id}
                      name={stop.name}
                      color={stop.color}
                      dotColor={stop.dotColor}
                      waiting={stop.waiting}
                    />
                  ))}
                </section>


              </section>

            </main>
          )}


          {activeTab === 'Buses' && (
            <main className='flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-none'>
              <section className='flex flex-col gap-2 items-start w-full'>
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2 items-center">
                    <div className={`w-5 p-1.5 bg-green-600/30rounded-[50px] inline-flex justify-start items-center gap-2.5`}>
                      <div className={`w-2.5 h-2 relative bg-green-600  rounded-3xl`} />
                    </div>
                    <p className="text-black text-sm font-normal">{pickUp.name}</p>
                  </div>

                  <div className="flex gap-2 items-center p-1 bg-neutral-50 rounded-xl">
                    <div className="flex">
                      <img src="../src/assets/memoji.png" alt="at" />
                      <img src="../src/assets/memoji2.png" alt="at" />
                      <img src="../src/assets/memoji3.png" alt="at" />
                    </div>
                    <p className="text-black/50 text-xs font-normal">5 waiting</p>
                  </div>
                </div>

                <p className="text-black text-xs "> 2 Buses <span className="text-black/50 text-xs ">are approaching</span><span className="text-black text-xs font-normal"> {pickUp.name}</span></p>
              </section>

              <section className='flex flex-col gap-2 w-full'>
                {drivers
                  .filter(driver => driver.active) // Only show active drivers
                  .map((driver, index) => {
                    const busRoute = driver.busRoute?.[0];
                    const stops = busRoute?.stops || [];
                    const startStop = stops[0] || 'Unknown';
                    const endStop = stops[stops.length - 4] || 'Unknown';

                    // Generate crowd density status (you can replace this with real data later)
                    const crowdDensity = Math.random() > 0.5 ? '🚫 Full' : '🟢 Available';
                    const crowdColor = crowdDensity === '🚫 Full' ? 'bg-red-50 text-red-900 border border-red-50' : 'bg-green-50 text-green-900 border border-green-50';

                    return (
                      <div key={driver.busID || driver.driverID || index}>
                        <div className='flex justify-between items-center w-full'>

                          <p className='text-black text-xs'>{startStop}</p>


                          <div className="w-9 h-0.5 relative bg-green-600 rounded-3xl" />

                          <div className='flex gap-1 flex-col items-start mb-5'>
                            <p className={`text-[8px] pl-1.5 pr-2 py-px ${crowdColor} rounded-2xl border`}>
                              {crowdDensity}
                            </p>
                            <div className="flex items-center gap-1">
                              <BusIcon />

                            </div>
                          </div>

                          <div className="w-8 h-1 relative bg-gray-300 rounded-3xl" />

                          <div className='flex flex-col'>
                            <p className='text-black text-xs'>{endStop}</p>

                          </div>
                        </div>





                      </div>
                    );
                  })}

                {/* Show message if no active buses */}
                {drivers.filter(driver => driver.active).length === 0 && (
                  <div className="text-center py-8 text-black/50">
                    <p className="text-sm">No active buses at the moment</p>
                    <p className="text-xs mt-1">Check back later for updates</p>
                  </div>
                )}
              </section>

            </main>


          )}





        </div>

        <MapGl
          selectedLocation={
            selectedLocation
              ? {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }
              : null
          }
          dropPoints={selectedLocation?.dropPoints || []}
          pickUpLocation={pickUp}
          dropOffLocation={dropOff}
          isHomepage={false}

        />

      </div>

      {!closeToastModal && availableBus && (reached || arriveInTwo || final) && (
        <div style={{
          backgroundColor: 'white',
          position: 'absolute',
          top: reached === true || arriveInTwo === true ? (isMobile ? '4vw' : '2vw') : '-28%',
          left: isMobile ? '2.5%' : '40vw',
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 12,
          width: isMobile ? '95vw' : '380px',
          maxWidth: 420,
          minWidth: isMobile ? 'auto' : 320,
          transition: '0.5s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z" fill="#4DB448" />
                <path d="M14.8299 20.01C14.4099 21.17 13.2999 22 11.9999 22C11.2099 22 10.4299 21.68 9.87993 21.11C9.55993 20.81 9.31993 20.41 9.17993 20C9.30993 20.02 9.43993 20.03 9.57993 20.05C9.80993 20.08 10.0499 20.11 10.2899 20.13C10.8599 20.18 11.4399 20.21 12.0199 20.21C12.5899 20.21 13.1599 20.18 13.7199 20.13C13.9299 20.11 14.1399 20.1 14.3399 20.07C14.4999 20.05 14.6599 20.03 14.8299 20.01Z" fill="#4DB448" />
              </svg>
              <p className='text-[16px] font-bold m-0'>
                KNUST
                <span className='text-[16px] text-[#34A853] font-bold'> Shuttle<span style={{ fontWeight: '400', color: '#FFCE31' }}>App</span></span>
              </p>
            </div>
            <svg onClick={closeModal} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4.26659 12.6667L3.33325 11.7334L7.06659 8.00004L3.33325 4.26671L4.26659 3.33337L7.99992 7.06671L11.7333 3.33337L12.6666 4.26671L8.93325 8.00004L12.6666 11.7334L11.7333 12.6667L7.99992 8.93337L4.26659 12.6667Z" fill="#1D1B20" />
            </svg>
          </div>
          <div style={{
            display: 'flex',
            padding: 12,
            borderRadius: 12,
            backgroundColor: '#fafafa',
            zIndex: 1000
          }}>
            {reached === true ? (
              <p style={{ color: 'rgba(0,0,0,0.6)' }}>
                Your shuttle has arrived at <span style={{ fontWeight: 'bold', color: '#000' }}>
                  {startPoint?.name || "your pickup point"}
                </span>! <br /> Please proceed to board
              </p>
            ) : final ? (
              <p style={{ color: 'rgba(0,0,0,0.6)' }}>
                🏁 The shuttle is arriving at your drop-off point: <span style={{ fontWeight: 'bold', color: '#000' }}>
                  {dropOff?.name || "your destination"}
                </span>. Please prepare to alight.
              </p>
            ) : (
              <p style={{ color: 'rgba(0,0,0,0.6)' }}>
                👋 Hey there! The shuttle will arrive at <span style={{ fontWeight: 'bold', color: '#000' }}>
                  {startPoint?.name || "your pickup point"}
                </span> in less than 2 minutes!
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default BusStopDetails;


