import { useState, useEffect } from 'react';
import MapGl from '../components/MapGL';
import useMediaQuery from '../components/useMediaQuery';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

interface DropPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface BusStop {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  dropPoints: DropPoint[];
}

function BusStopDetails() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { id } = useParams();
  const { state } = useLocation();
  const { pickUp, dropOff } = state || {};

  const [busStop, setBusStop] = useState<BusStop | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<BusStop | null>(null);

  const navigate = useNavigate();

  const locations: BusStop[] = [
    // Your locations data here
  ];

  useEffect(() => {
    const selectedBusStop = locations.find((location) => location.id === id);

    if (selectedBusStop) {
      let updatedBusStop = { ...selectedBusStop };

      // Your filtering logic here

      setBusStop(updatedBusStop);
      setSelectedLocation(updatedBusStop);
    } else {
      console.error('Bus stop not found');
      navigate('/');
    }
  }, [id, navigate, pickUp, dropOff]);

  const filteredDropPointsForUI = selectedLocation?.dropPoints?.filter(
    (dropPoint) => dropPoint.name !== 'Paa Joe Round About'
  );

  return (
    <div style={{ flexDirection: 'column', margin: 0, top: 0 }}>
      <div style={{ display: 'flex', width: '100%', borderRadius: 24, height: 'auto', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Your UI code here */}

        <MapGl
          selectedLocation={selectedLocation}
          dropPoints={selectedLocation?.dropPoints || []}
          pickUp={pickUp}
          dropOff={dropOff}
          isHomepage={false}
        />
      </div>
    </div>
  );
}

export default BusStopDetails;