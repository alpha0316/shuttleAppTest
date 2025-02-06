import { useState } from 'react';
import MapGl from '../components/MapGL';
// import { FlyToInterpolator } from 'react-map-gl';
import useMediaQuery from '../components/useMediaQuery';


function Home() {

  const isMobile = useMediaQuery('(max-width: 768px)');

  interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
  }

  const locations: Location[] = [
    { id: '1', name: 'Main Library', description: 'On Campus', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
    { id: '2', name: 'Gaza', description: 'Off Campus', latitude: 6.687618867462474, longitude: -1.5570359730017378 },
    { id: '3', name: 'Medical Village', description: 'Hub for student activities', latitude: 6.6800787890749245, longitude: -1.549747261104641 },
    { id: '4', name: 'Pharmacy Busstop', description: 'On Campus', latitude: 6.67480379472123, longitude: -1.5663873751176354 },
    { id: '5', name: 'Pentecost Busstop', description: 'On Campus', latitude: 6.674545299373284, longitude: -1.5675650457295751 },
    { id: '6', name: 'SRC Busstop', description: 'On Campus', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
    { id: '7', name: 'KSB', description: 'Hub for student activities', latitude: 6.669314250173885, longitude: -1.567181795001016 },
    { id: '8', name: 'Brunei', description: 'Hub for student activities', latitude: 6.670465091472612, longitude: -1.5741574445526254 },
    { id: '9', name: 'Hall 7', description: 'Hub for student activities', latitude: 6.679295619563862, longitude: -1.572807677030472 },
    { id: '10', name: 'Conti Busstop', description: 'Hub for student activities', latitude: 6.679644223364716, longitude: -1.572967657880401 },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query === '') {
      setFilteredLocations(locations);
    } else {
      const filterData = locations.filter((location) =>
        location.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filterData);
    }
  };

  const LocationList: React.FC<{ searchQuery: string; selectedLocation: Location | null }> = ({ searchQuery, selectedLocation }) => {
    return (
      <div style={{
        borderRadius: 8,
        display: 'flex',
        padding: 12,
        alignItems: 'flex-start',
        gap: 12,
        borderWidth: 1,
        flexDirection : 'column',
        overflowY : 'auto',
        maxHeight : isMobile ? 300 : 'calc(100vh - 220px)',
        width : '330',
        justifyContent : 'flex-start' ,
        
      }}>
        {filteredLocations.length === 0 ? (
          <p>No Bus stop found</p>
        ) : (
          filteredLocations.map((location) => (
            <div
            key={location.id}
            style={{
              borderRadius: 16,
              border: selectedLocation?.id === location.id ? '1px solid rgba(0,0,0,0.5)' : '1px solid rgba(0,0,0,0.1)', // Highlight selected location
              display: 'flex',
              padding: 12,
              alignItems: 'center',
              gap: 16,
              width: '90%',
              justifyContent: 'flex-start',
              cursor: 'pointer',
              backgroundColor: selectedLocation?.id === location.id ? '#F0F8FF' : '#f4f4f4f', // Optional: Add background color
            }}
            onClick={() => handleLocationClick(location)} // Pass the location to the handler
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 36 36" fill="none">
                <g clipPath="url(#clip0_629_5804)">
                  <path d="M31 8H23V10H31V31H23V33H33V10C33 9.46957 32.7893 8.96086 32.4142 8.58579C32.0391 8.21071 31.5304 8 31 8Z" fill="black" fillOpacity="0.6" />
                  <path d="M19.88 3H6.12C5.55774 3 5.01851 3.22336 4.62093 3.62093C4.22336 4.01851 4 4.55774 4 5.12V33H22V5.12C22 4.55774 21.7766 4.01851 21.3791 3.62093C20.9815 3.22336 20.4423 3 19.88 3ZM20 31H17V28H9V31H6V5.12C6 5.10424 6.0031 5.08864 6.00913 5.07408C6.01516 5.05952 6.024 5.04629 6.03515 5.03515C6.04629 5.024 6.05952 5.01516 6.07408 5.00913C6.08864 5.0031 6.10424 5 6.12 5H19.88C19.8958 5 19.9114 5.0031 19.9259 5.00913C19.9405 5.01516 19.9537 5.024 19.9649 5.03515C19.976 5.04629 19.9848 5.05952 19.9909 5.07408C19.9969 5.08864 20 5.10424 20 5.12V31Z" fill="black" fillOpacity="0.6" />
                  <path d="M8 8H10V10H8V8Z" fill="black" fillOpacity="0.6" />
                  <path d="M12 8H14V10H12V8Z" fill="black" fillOpacity="0.6" />
                  <path d="M16 8H18V10H16V8Z" fill="black" fillOpacity="0.6" />
                  <path d="M8 13H10V15H8V13Z" fill="black" fillOpacity="0.6" />
                  <path d="M12 13H14V15H12V13Z" fill="black" fillOpacity="0.6" />
                  <path d="M16 13H18V15H16V13Z" fill="black" fillOpacity="0.6" />
                  <path d="M8 18H10V20H8V18Z" fill="black" fillOpacity="0.6" />
                  <path d="M12 18H14V20H12V18Z" fill="black" fillOpacity="0.6" />
                  <path d="M16 18H18V20H16V18Z" fill="black" fillOpacity="0.6" />
                  <path d="M8 23H10V25H8V23Z" fill="black" fillOpacity="0.6" />
                  <path d="M12 23H14V25H12V23Z" fill="black" fillOpacity="0.6" />
                  <path d="M16 23H18V25H16V23Z" fill="black" fillOpacity="0.6" />
                  <path d="M23 13H25V15H23V13Z" fill="black" fillOpacity="0.6" />
                  <path d="M27 13H29V15H27V13Z" fill="black" fillOpacity="0.6" />
                  <path d="M23 18H25V20H23V18Z" fill="black" fillOpacity="0.6" />
                  <path d="M27 18H29V20H27V18Z" fill="black" fillOpacity="0.6" />
                  <path d="M23 23H25V25H23V23Z" fill="black" fillOpacity="0.6" />
                  <path d="M27 23H29V25H27V23Z" fill="black" fillOpacity="0.6" />
                </g>
                <defs>
                  <clipPath id="clip0_629_5804">
                    <rect width="36" height="36" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <p style={{ fontSize: 14, margin: 0 }}>{location.name}</p>
                <p style={{ fontSize: 12, margin: 0, color : 'rgba(0,0,0,0.6)' }}>{location.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{
      flexDirection: "column",
      // backgroundColor: 'red',
      margin: 0,
      top: 0
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
          // marginLeft: 16,
          borderRadius: 24,
          gap: 16,
          flexDirection: 'column',
          width: isMobile ? '90%' : 340,
          minHeight: isMobile ? 300 : 'auto',
          height: isMobile ? 300 : 'auto',
          zIndex: 11111,
          marginTop: 12,
          border: '1px solid rgba(0,0,0,0.1)',
          margin: isMobile ? '16px auto' : '16px 16px 16px 0',
          position : 'fixed',
          bottom : isMobile ? 10 : ''

        }}>
          <p style={{ fontSize: 20, fontWeight: '700', margin: 0 }}>
            Welcome to KNUST <br />
            <span style={{ fontSize: 20, color: '#34A853', fontWeight: '400' }}>Shuttle<span style={{ fontWeight: '400', color: '#FFCE31' }}>App</span></span>
          </p>

          <div style={{
            display: 'flex',
            paddingInline: 16,
            paddingBlock: 12,
            gap: 8,
            backgroundColor: '#F6F6F6',
            borderRadius: 24,
            alignItems: 'center',
            border: '1px solid rgba(0,0,0,0.1)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20.031 20.79C20.491 21.25 21.201 20.54 20.741 20.09L16.991 16.33C18.3064 14.8745 19.0336 12.9818 19.031 11.02C19.031 6.63 15.461 3.06 11.071 3.06C6.681 3.06 3.111 6.63 3.111 11.02C3.111 15.41 6.681 18.98 11.071 18.98C13.051 18.98 14.881 18.25 16.281 17.04L20.031 20.79ZM4.11 11.02C4.11 7.18 7.24 4.06 11.07 4.06C14.91 4.06 18.03 7.18 18.03 11.02C18.03 14.86 14.91 17.98 11.07 17.98C7.24 17.98 4.11 14.86 4.11 11.02Z" fill="black" fillOpacity="0.6" />
            </svg>
            <input
              type="text"
              placeholder="Where is your next lecture?"
              value={searchQuery}
              onChange={handleSearch}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: 14,
                color: 'rgba(0,0,0,0.6)',
                outline: 'none',
                padding: 0
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <LocationList searchQuery={searchQuery}  selectedLocation={selectedLocation}  />
          </div>
        </div>
        <MapGl selectedLocation={selectedLocation}/>
      </div>
    </div>
  );
}

export default Home;