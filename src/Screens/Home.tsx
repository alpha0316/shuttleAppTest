import { useState, useEffect } from 'react';
import MapGl from '../components/MapGL';
// import { FlyToInterpolator } from 'react-map-gl';
import useMediaQuery from '../components/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../../hooks/useGeolocation'


function Home() {

  const BASE_CUSTOMER_URL = "http://shuttle-backend-0.onrender.com/api/v1";

  const { loaded, coordinates, error } = useGeolocation();

  // console.log('so', coordinates)
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${BASE_CUSTOMER_URL}/drivers`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
    
        console.log(data)
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    }

    fetchDrivers();
    
  }, []);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    dropPoints: dropPoints[];
  }
  interface Coordinates {
    latitude: number;
    longitude: number;
  }

  const locations = [
    { id: '1', name: 'Main Library', description: 'On Campus', latitude: 6.675033566213408, longitude: -1.5723546778455368,
      dropPoints: [ 
        { name: 'Brunei', latitude: 6.670465091472612, longitude: -1.5741574445526254 },
        { name: 'Pentecost Busstop', latitude: 6.674545299373284, longitude: -1.5675650457295751 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
        { name: 'Main Library', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
      ]
    },
    { id: '2', name: 'Brunei', description: 'Hub for student activities', latitude: 6.670465091472612, longitude: -1.5741574445526254, 
      dropPoints: [ 
        // { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
        { name: 'Main Library', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        { name: 'Pentecost Busstop', latitude: 6.674545299373284, longitude: -1.567565045729575 },
        { name: 'Brunei', latitude: 6.670465091472612, longitude: -1.5741574445526254 }
      ] 
    },
    { id: '3', name: 'Commercial Area', description: 'On Campus', latitude: 6.682751297721754, longitude: -1.5769726260262382,
      dropPoints: [ 
        { name: 'Pentecost Busstop', latitude: 6.674545299373284, longitude: -1.5675650457295751 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
        { name: 'Conti Busstop', latitude: 6.679644223364716, longitude: -1.572967657880401 },
        { name: 'Commerical Area', latitude: 6.682751297721754, longitude: -1.5769726260262382, },
      ]
    },
    { id: '4', name: 'Hall 7', description: 'Hub for student activities', latitude: 6.679295619563862, longitude: -1.572807677030472,
      dropPoints: [ 
        { name: 'Pentecost Busstop', latitude: 6.674545299373284, longitude: -1.567565045729575 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        { name: 'Paa Joe Round About', latitude: 6.678596454119355, longitude: -1.5709606375024159 },
        { name: 'Hall 7', latitude: 6.679295619563862, longitude: -1.572807677030472 }
      ]
    },
    { id: '5', name: 'Gaza', description: 'Off Campus', latitude: 6.687618867462474, longitude: -1.5570359730017378, 
      dropPoints: [ 
        { name: 'Pharmacy Busstop', latitude: 6.67480379472123, longitude: -1.5663873751176354 },
        { name: 'Medical Village', latitude: 6.6800787890749245, longitude: -1.549747261104641 },
        { name: 'Gaza', latitude: 6.687618867462474, longitude: -1.5570359730017378 }
      ]
    },
    { id: '6', name: 'Medical Village', description: 'Hub for student activities', latitude: 6.6800787890749245, longitude: -1.549747261104641,   
      dropPoints: [ 
        { name: 'Pharmacy Busstop', latitude: 6.67480379472123, longitude: -1.5663873751176354 },
        { name: 'Gaza', latitude: 6.687618867462474, longitude: -1.5570359730017378 },
        { name: 'Medical Village', latitude: 6.6800787890749245, longitude: -1.549747261104641 }
      ] 
    },
    { id: '7', name: 'Pharmacy Busstop', description: 'On Campus', latitude: 6.67480379472123, longitude: -1.5663873751176354,
      dropPoints: [ 
        { name: 'Medical Village', latitude: 6.6800787890749245, longitude: -1.549747261104641 },
        { name: 'Gaza', latitude: 6.687618867462474, longitude: -1.5570359730017378 },
        { name: 'Pharmacy Busstop', latitude: 6.67480379472123, longitude: -1.5663873751176354 }
      ] 
    },
    { id: '8', name: 'Pentecost Busstop', description: 'On Campus', latitude: 6.674545299373284, longitude: -1.5675650457295751,
      dropPoints: [ 
        // { name: 'Paa Joe Round About', latitude: 6.675187511866504, longitude: -1.570775090040308 },
        // { name: 'Hall 7', latitude: 6.679295619563862, longitude: -1.572807677030472 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        // { name: 'Main Library', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
        { name: 'Pentecost Busstop', latitude: 6.674545299373284, longitude: -1.567565045729575 }
      ] 
    },
    { id: '9', name: 'SRC Busstop', description: 'On Campus', latitude: 6.675223889340042, longitude: -1.5678831412482812, 
      dropPoints: [ 
        { name: 'Brunei', latitude: 6.670465091472612, longitude: -1.5741574445526254 },
        { name: 'Main Library', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
        { name: 'Conti Busstop', latitude: 6.679644223364716, longitude: -1.572967657880401 },
        { name: 'Commercial Area', latitude: 6.682756553904525, longitude: -1.576990347851461 },
        { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 }
      ] 
    },
    { id: '10', name: 'KSB', description: 'Hub for student activities', latitude: 6.669314250173885, longitude: -1.567181795001016,
      dropPoints: [ 
        { name: 'Brunei', latitude: 6.670465091472612, longitude: -1.5741574445526254 },
        { name: 'Main Library', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
        { name: 'Conti Busstop', latitude: 6.679644223364716, longitude: -1.572967657880401 },
        { name: 'Commercial Area', latitude: 6.682756553904525, longitude: -1.576990347851461 },
        { name: 'Pentecost Busstop', latitude: 6.674545299373284, longitude: -1.567565045729575 },
        { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
        { name: 'Conti Busstop', latitude: 6.679644223364716, longitude: -1.572967657880401 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        { name: 'Paa Joe Round About', latitude: 6.675187511866504, longitude: -1.570775090040308 }
      ] 
    },
    { id: '11', name: 'Conti Busstop', description: 'Hub for student activities', latitude: 6.679644223364716, longitude: -1.572967657880401, 
      dropPoints: [ 
        // { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
        { name: 'Commercial Area', latitude: 6.682756553904525, longitude: -1.576990347851461 },
        { name: 'Conti Busstop', latitude: 6.679644223364716, longitude: -1.572967657880401 }
      ]
    },
  ];
  
  // Sort the locations array alphabetically by the `name` property
  locations.sort((a, b) => a.name.localeCompare(b.name));
  
  // console.log(locations);


  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [pickUp, setpickUp] =  useState("")
  const [dropOff, setDropOff] =  useState<Location | null>(null)
  const [isSelectingDropOff, setIsSelectingDropOff] = useState(false)
  const [pickUpDetails, setpickUpDetail] =  useState<Location | null>(null)
  const [dropOffDetail, setDropOffDetail] =  useState<Location | null>(null)
  const [inputFocused, setInputFocused] = useState(false);
  const [pickUpCoordinates, setPickUpCoordinates] = useState([]);


  const drawerHeaderHeight = -300
  const [drawerPosition, setDrawerPosition] = useState(drawerHeaderHeight)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false);
 




const handleStartPointClick = (location: Location) => {
  setSelectedLocation(location);
  setpickUpDetail(location);
  setpickUp(location.name);
  setIsSelectingDropOff(true);
  console.log(pickUp)

  const validDropOffPoints = locations.filter((loc) =>
    location.dropPoints.some((dp) => dp.name === loc.name)
  );
  setFilteredLocations(validDropOffPoints);
  setDropOff(null);
  setSearchQuery('');

  setPickUpCoordinates({
    latitude: location.latitude,
    longitude: location.longitude,
  });
  console.log(pickUpCoordinates)  
};

  const handleDropOffPointClick = (location: Location) => {
    setSelectedLocation(location);
    setDropOff(location.name);
    setIsSelectingDropOff(false);
    
    
    setFilteredLocations(locations);
    // console.log('sooo', location)
    setSearchQuery('');
    navigate(`/BusStopDetails/${location.id}`, {
      state: {
        pickUp: pickUpDetails, // Pass the pickup location
        dropOff: location,     // Pass the drop-off location
      },
    });
    
  }

  const handleClearPickUp = () => {
    setpickUp(null);
    setpickUpDetail(null);
    setFilteredLocations(locations);
    setSearchQuery('');
    setIsSelectingDropOff(false);
    setSelectedLocation(null);
    setPickUpCoordinates(null);
  }

  const handleClearDropOff = () => {
    setpickUp("null")
    setpickUpDetail(null)
    setFilteredLocations(locations)
    searchQuery('')
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query === '') {
      setFilteredLocations(locations);
    }  
    
    if (isSelectingDropOff && pickUp) {
      // If pickup is selected, filter drop-off points
      const validDropOffPoints  = locations.filter((location) => 
        location.name.toLowerCase().includes(query.toLowerCase()) &&
        pickUp.dropPoints.some(dp => dp.name === location.name)
      );
      setFilteredLocations(validDropOffPoints);
    }  else {
      setFilteredLocations(locations);
    }
    // return
  };

  const handleInputFocus = () => {   
    // setInputFocused(true);
    if (!pickUp && !dropOff) {
      setInputFocused(true);
    }
  };

  const handleInputBlur = () => {
    if (pickUp && dropOff) {
      setInputFocused(false);
    }
  };


//   if (isSelectingDropOff && pickUp) {
//     // When selecting drop-off point, filter from valid drop-off points
//     const startLocation = locations.find(loc => loc.name === pickUp);
//     const filteredDropOffs = locations.filter((location) => 
//       location.name.toLowerCase().includes(query.toLowerCase()) &&
//       startLocation?.dropPoints.some(dp => dp.name === location.name)
//     );
//     setFilteredLocations(filteredDropOffs);
//   } else {
//     // When selecting start point, filter from all locations
//     const filterData = locations.filter((location) =>
//       location.name.toLowerCase().includes(query.toLowerCase())
//     );
//     setFilteredLocations(filterData);
//   }
// };

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
        maxHeight : isMobile ? 400 : 'calc(70vh - 220px)',
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
              backgroundColor: selectedLocation?.id === location.id ? '#F0F8FF' : '#f4f4f4f', 
              transition: 'bottom 0.3s ease-in-out',
            }}
            onClick={() => 
              isSelectingDropOff 
                ? handleDropOffPointClick(location) 
                : handleStartPointClick(location)
            }
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
      display: 'flex',
      // flexDirection: isMobile ? 'column' : 'row',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden', 
      
    }}>
     
      <div style={{
        display: 'flex',
        // width: '100%',
        borderRadius: 24,
        height: 'auto',
        overflow: 'hidden',
        // flexDirection: isMobile ? 'column' : 'row',
        backgroundColor : 'red',
        margin : 0
      }}>
        <div
          // onTouchStart={handleTouchStart}
          // onTouchMove={handleTouchMove}
          // onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          paddingInline: 16,
          paddingBlock: 16,
          backgroundColor: 'white',
          marginLeft: 12,
          borderRadius: 24,
          gap: 16,
          flexDirection: 'column',
          width: isMobile ? '90%' : 340,
          minHeight: isMobile ? 'auto' : 'auto',
          height: isMobile ? 'auto' : 'auto',
          zIndex: 11111,
          marginTop: 4,
          border: '1px solid rgba(0,0,0,0.1)',
          margin: isMobile ? '16px auto' : '16px 16px 16px 0',
          position : 'fixed',
          bottom: isMobile ? (inputFocused ? '0%' : '-40%') : '',
          transition: 'bottom 0.3s ease-in-out',
          // transition: isDragging ? 'none' : 'bottom 0.3s ease-in-out',
          // bottom: isMobile ? `${drawerPosition}px` : '' 
        }}>

         {/* <div style={{ textAlign: 'center', marginBottom: '8px', display : isMobile ? 'block' : 'none' }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: '#ccc', borderRadius: '2px', margin: '0 auto' }}></div>
         </div> */}
          <p style={{ fontSize: 20, fontWeight: '700', margin: 0 }}>
            Welcome to KNUST <br />
            
            
            <span style={{ fontSize: 20, color: '#34A853', fontWeight: '400' }}>Shuttle<span style={{ fontWeight: '400', color: '#FFCE31' }}>App</span></span>
          </p>

          <div style={{
            display : 'flex',
            flexDirection : 'column',
            gap : 12,
            padding : 16,
            borderRadius : 24,
            backgroundColor : '#fafafa'
          }}>
                <div style={{
            display : 'flex',
            flexDirection : 'column',
            gap : 8,
            
          }}>
            <p style={{
              margin : 0,
              fontSize : 14,
              color : 'rgba(0,0,0,0.5)'
            }} >Starting Point</p>

            <div style={{
              display : 'flex',
              alignItems : 'center',
              gap : 8,
              // justifyContent : 'space-between'
            }}>

              <div style={{
                width : 40,
                height : 40,
                display : 'flex',
                alignItems : 'center',
                borderRadius : 80,
                border : '1px dashed rgba(0,0,0,0.1)',
                justifyContent : 'center',
                backgroundColor: pickUp? '#000' : '#ffff',
              }}>

                { pickUp?  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20.6201 8.45C19.5701 3.83 15.5401 1.75 12.0001 1.75C12.0001 1.75 12.0001 1.75 11.9901 1.75C8.4601 1.75 4.4201 3.82 3.3701 8.44C2.2001 13.6 5.3601 17.97 8.2201 20.72C9.2801 21.74 10.6401 22.25 12.0001 22.25C13.3601 22.25 14.7201 21.74 15.7701 20.72C18.6301 17.97 21.7901 13.61 20.6201 8.45ZM12.0001 13.46C10.2601 13.46 8.8501 12.05 8.8501 10.31C8.8501 8.57 10.2601 7.16 12.0001 7.16C13.7401 7.16 15.1501 8.57 15.1501 10.31C15.1501 12.05 13.7401 13.46 12.0001 13.46Z" fill="white" fill-opacity="1"/>
                  </svg>  :
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20.6201 8.45C19.5701 3.83 15.5401 1.75 12.0001 1.75C12.0001 1.75 12.0001 1.75 11.9901 1.75C8.4601 1.75 4.4201 3.82 3.3701 8.44C2.2001 13.6 5.3601 17.97 8.2201 20.72C9.2801 21.74 10.6401 22.25 12.0001 22.25C13.3601 22.25 14.7201 21.74 15.7701 20.72C18.6301 17.97 21.7901 13.61 20.6201 8.45ZM12.0001 13.46C10.2601 13.46 8.8501 12.05 8.8501 10.31C8.8501 8.57 10.2601 7.16 12.0001 7.16C13.7401 7.16 15.1501 8.57 15.1501 10.31C15.1501 12.05 13.7401 13.46 12.0001 13.46Z" fill="black" fill-opacity="0.6"/>
                  </svg>
                }
              </div>

              <div style={{
                display: 'flex',
                paddingInline: 16,
                paddingBlock: 12,
                gap: 8,
                backgroundColor: '#ffff',
                borderRadius: 16,
                alignItems: 'center',
                border: pickUp ? '1px solid rgba(0,0,0,0.6)' : '1px solid rgba(0,0,0,0.1)',
                width : '75%'
              }}>

                

                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.031 20.79C20.491 21.25 21.201 20.54 20.741 20.09L16.991 16.33C18.3064 14.8745 19.0336 12.9818 19.031 11.02C19.031 6.63 15.461 3.06 11.071 3.06C6.681 3.06 3.111 6.63 3.111 11.02C3.111 15.41 6.681 18.98 11.071 18.98C13.051 18.98 14.881 18.25 16.281 17.04L20.031 20.79ZM4.11 11.02C4.11 7.18 7.24 4.06 11.07 4.06C14.91 4.06 18.03 7.18 18.03 11.02C18.03 14.86 14.91 17.98 11.07 17.98C7.24 17.98 4.11 14.86 4.11 11.02Z" fill= "black" fillOpacity="0.6" />
                </svg>
                <input
                  type="text"
                  placeholder="Select Pickup Point"
                  value={pickUp}
                  onChange={handleSearch}
                   onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 14,
                    color:  pickUp ? "#000" : 'rgba(0,0,0,0.6)',
                    outline: 'none',
                    padding: 0,
                    transition: 'bottom 0.3s ease-in-out',
                  }}
                />

                  { pickUp ? 
                        <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="#1D1B20"/>
                        </svg>
                  : 
                  <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="rgba(0,0,0,0.4)"/>
                  </svg>
                  }

                </div>  

            </div>
          </div>

          <div style={{
            width : 0.1,
            height : 20,
            border : pickUp? '1px dashed rgba(0,0,0,1)' : '1px dashed rgba(0,0,0,0.2)',
            position : 'relative',
            left : '6%',
            
          }}></div>

          <div style={{
            display : 'flex',
            flexDirection : 'column',
            gap : 8
          }}>
            <p style={{
              margin : 0,
              fontSize : 14,
              color : 'rgba(0,0,0,0.5)'
            }} >Drop Off Point</p>

            <div style={{
              display : 'flex',
              alignItems : 'center',
              gap : 8,
              // justifyContent : 'space-between'
            }}>

              <div style={{
                width : 40,
                height : 40,
                display : 'flex',
                alignItems : 'center',
                borderRadius : 50,
                border : '1px dashed rgba(0,0,0,0.1)',
                justifyContent : 'center',
                backgroundColor: '#ffff',
              }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20.6202 8.7C19.5802 4.07 15.5402 2 12.0002 2C12.0002 2 12.0002 2 11.9902 2C8.46024 2 4.43024 4.07 3.38024 8.69C2.20024 13.85 5.36024 18.22 8.22024 20.98C9.28024 22 10.6402 22.51 12.0002 22.51C13.3602 22.51 14.7202 22 15.7702 20.98C18.6302 18.22 21.7902 13.86 20.6202 8.7ZM15.2802 9.53L11.2802 13.53C11.1302 13.68 10.9402 13.75 10.7502 13.75C10.5602 13.75 10.3702 13.68 10.2202 13.53L8.72024 12.03C8.43024 11.74 8.43024 11.26 8.72024 10.97C9.01024 10.68 9.49024 10.68 9.78024 10.97L10.7502 11.94L14.2202 8.47C14.5102 8.18 14.9902 8.18 15.2802 8.47C15.5702 8.76 15.5702 9.24 15.2802 9.53Z" fill="black" fill-opacity="0.6"/>
                </svg>
              </div>

              <div style={{
                display: 'flex',
                paddingInline: 16,
                paddingBlock: 12,
                gap: 8,
                backgroundColor: '#fff',
                borderRadius: 16,
                alignItems: 'center',
                border: '1px solid rgba(0,0,0,0.1)',
                width : '75%'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.031 20.79C20.491 21.25 21.201 20.54 20.741 20.09L16.991 16.33C18.3064 14.8745 19.0336 12.9818 19.031 11.02C19.031 6.63 15.461 3.06 11.071 3.06C6.681 3.06 3.111 6.63 3.111 11.02C3.111 15.41 6.681 18.98 11.071 18.98C13.051 18.98 14.881 18.25 16.281 17.04L20.031 20.79ZM4.11 11.02C4.11 7.18 7.24 4.06 11.07 4.06C14.91 4.06 18.03 7.18 18.03 11.02C18.03 14.86 14.91 17.98 11.07 17.98C7.24 17.98 4.11 14.86 4.11 11.02Z" fill="black" fillOpacity="0.6" />
                </svg>
                <input
                  type="text"
                  placeholder="Select Drop Off Point"
                  value={dropOff}
                  onChange={handleSearch}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 14,
                    color: dropOff? 'black'  : 'rgba(0,0,0,0.6)',
                    outline: 'none',
                    padding: 0
                  }}
                />
                  { dropOff ? 
                  <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="#1D1B20"/>
                  </svg>
                  : 
                  <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="rgba(0,0,0,0.4)"/>
                  </svg>
                  }
                </div>  

            </div>
          </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <LocationList searchQuery={searchQuery}
              selectedLocation={selectedLocation}
              locations={locations}
              isSelectingDropOff={isSelectingDropOff}
              handleDropOffPointClick={handleDropOffPointClick}
              handleStartPointClick={handleStartPointClick}
              isMobile={isMobile}  />
          </div>
        </div>

        <MapGl isHomepage={true} selectedLocation={selectedLocation} dropPoints={selectedLocation?.dropPoints || []} /> 
        {/* <MapGL
  selectedLocation={selectedLocation}
  dropPoints={[]} // No drop points needed on the homepage
  isHomepage={true} // Enable homepage behavior
/>   */} 
     </div>
    </div>
  );
}

export default Home;

