import { useState, useEffect } from 'react';
import MapGl from '../components/MapGL';
// import { FlyToInterpolator } from 'react-map-gl';
import useMediaQuery from '../components/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
// import useGeolocation from '../../hooks/useGeolocation'
import { locationsss } from '../../data/locations';


interface DropPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  dropPoints: DropPoint[];
}





function Home() {

  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();


  locationsss.sort((a, b) => a.name.localeCompare(b.name));


  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locationsss);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [pickUp, setpickUp] = useState<Location | null>(null)
  const [dropOff, setDropOff] = useState<Location | null>(null)
  const [isSelectingDropOff, setIsSelectingDropOff] = useState(false)
  const [pickUpDetails, setpickUpDetail] = useState<Location | null>(null)
  const [inputFocused, setInputFocused] = useState(false);
  const [dropDown, setDropDown] = useState(true)
  const [closeTracker, setCloseTracker] = useState(false)




  const handleStartPointClick = (location: Location) => {
    console.log('Selected pickup:', location);

    setpickUp(location);
    setSelectedLocation(location);
    setpickUpDetail(location);
    setDropOff(null);
    setSearchQuery('');

    // Filter valid drop-off points based on selected pickup
    const validDropOffPoints = locationsss.filter((loc) =>
      location.dropPoints.some((dp) => dp.name === loc.name)
    );

    setFilteredLocations(validDropOffPoints);

    // Set this last to ensure all other state is updated first
    setIsSelectingDropOff(true);
  };

  const handleDropOffPointClick = (location: Location) => {
    setSelectedLocation(location);
    setDropOff(location);
    setIsSelectingDropOff(false);

    setFilteredLocations(locationsss);
    setSearchQuery('');


    navigate(`/BusStopDetails/${location.id}`, {
      state: {
        pickUp: pickUpDetails,
        dropOff: location,
      },
    });
  };

  const handleClearPickUp = () => {
    setpickUp(null);
    setpickUpDetail(null);
    setFilteredLocations(locationsss);
    setSearchQuery('');
    setIsSelectingDropOff(false);
    setSelectedLocation(null);
    // setPickUpCoordinates(null);
  }

  const handleClearDropOff = () => {
    setDropOff(null);
    // setdropOffDetail(null);
    setFilteredLocations(locationsss);
    setSearchQuery('');
    setIsSelectingDropOff(false);
    setSelectedLocation(null);
    // setPickUpCoordinates(null);
  }



  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value;
    setSearchQuery(searchQuery);

    if (searchQuery === '') {
      setFilteredLocations(locationsss);
    } else if (isSelectingDropOff && pickUp) {
      const validDropOffPoints = locationsss.filter((location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        pickUpDetails?.dropPoints.some(dp => dp.name === location.name)
      );
      setFilteredLocations(validDropOffPoints);
    } else {
      const filterData = locationsss.filter((location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filterData);
    }
  };

  const handleInputFocus = () => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (!dropDown) {
      setDropDown(true);
    }
    setInputFocused(true);
  };

  const handleInputBlur = () => {

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    setInputFocused(false);
    if (!pickUp && !dropOff) {
      setDropDown(true);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      setInputFocused(false);
      // console.log(inputFocused)
    }
  };

  const handleDropDown = () => {
    setDropDown(!dropDown)
    if (pickUp) {
      setDropDown(!dropDown)
    }
  }


  useEffect(() => {
    if (pickUp) {
      setIsSelectingDropOff(true);
    }
  }, [pickUp]);


  interface LocationListProps {
    searchQuery: string;
    selectedLocation: Location | null;
    locationsss: Location[];
    isSelectingDropOff: boolean;
    handleDropOffPointClick: (location: Location) => void;
    handleStartPointClick: (location: Location) => void;
    isMobile: boolean;
  }

  const LocationList: React.FC<LocationListProps> = ({
    // searchQuery,
    selectedLocation,
    // locations,
    isSelectingDropOff,
    handleDropOffPointClick,
    handleStartPointClick,
    // isMobile,

  }) => {
    return (
     <div className="flex flex-col py-3 pr-3 border-t-1 border-neutral-200 gap-3 overflow-y-auto max-h-[40vh] md:max-h-[calc(80vh-220px)] w-[360px]">
  {filteredLocations.length === 0 ? (
    <p>No Bus stop found. Select closest bus stop</p>
  ) : (
    isSelectingDropOff ?
      filteredLocations.map((location) => (
        <div
          key={location.id}
          style={{
            borderRadius: 16,
            border: selectedLocation?.id === location.id 
              ? '1px solid rgba(0,0,0,0.5)' 
              : '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            padding: 12,
            alignItems: 'center',
            gap: 16,
            width: '100%',
            justifyContent: 'flex-start',
            cursor: 'pointer',
            backgroundColor: selectedLocation?.id === location.id 
              ? '#F0F8FF' 
              : '#f4f4f4',
            transition: 'all 0.2s ease-in-out',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = selectedLocation?.id === location.id 
              ? '#E0F0FF' 
              : '#e8e8e8';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = selectedLocation?.id === location.id 
              ? '#F0F8FF' 
              : '#f4f4f4';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onClick={() => handleDropOffPointClick(location)}
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
            <p style={{ fontSize: 12, margin: 0, color: 'rgba(0,0,0,0.6)' }}>{location.description}</p>
          </div>
        </div>
      ))
      :
      filteredLocations.map((location) => (
        <div
          key={location.id}
          style={{
            borderRadius: 16,
            border: selectedLocation?.id === location.id 
              ? '1px solid rgba(0,0,0,0.5)' 
              : '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            padding: 12,
            alignItems: 'center',
            gap: 16,
            width: '100%',
            justifyContent: 'flex-start',
            cursor: 'pointer',
            backgroundColor: selectedLocation?.id === location.id 
              ? '#F0F8FF' 
              : '#f4f4f4',
            transition: 'all 0.2s ease-in-out',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = selectedLocation?.id === location.id 
              ? '#E0F0FF' 
              : '#e8e8e8';
            e.currentTarget.style.transform = 'translateY(-2px)';
            // e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = selectedLocation?.id === location.id 
              ? '#F0F8FF' 
              : '#f4f4f4';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            // e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onClick={() => handleStartPointClick(location)}
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
            <p style={{ fontSize: 12, margin: 0, color: 'rgba(0,0,0,0.6)' }}>{location.description}</p>
          </div>
        </div>
      ))
  )}
</div>
    );
  };





  return (
    <div className='flex h-100vh w-100vw m-0 p-0 overflow-hidden '>
      {/* flex h-100vh w-100vw m-0 p-0 overflow-hidden */}
      <div
        className={`
            flex
            mt-3
            px-4 py-4
            bg-white
            ${isMobile ? 'ml-0' : 'ml-3'}
            rounded-3xl
            gap-2
            flex-col
            ${isMobile ? 'w-full' : 'w-[380px]'}
            ${isMobile ? (dropDown || inputFocused ? 'max-h-[200vh]' : 'max-h-[25vh]') : 'max-h-auto'}
            ${isMobile ? 'h-auto' : 'h-auto'}
            z-[11111]
            mt-1 
            border border-gray-200
            ${isMobile ? 'mx-auto mt-4' : 'm-4 mr-4 ml-0'}
            fixed
            ${isMobile ?
            (inputFocused || dropDown) ? 'bottom-2' :
              (pickUp ? 'bottom-0' : 'bottom-0')
            : ''}
            transition-[bottom,max-height] duration-300 ease-in-out
            ${isMobile ? 'mx-0.5' : 'mx-3.5'}  // marginInline: isMobile ? 2 : 14
          `}

      >

        <div className='flex items-center justify-between'>

          <p className='text-[20px] font-bold m-0'>
            Welcome to KNUST
            <span className='text-[20px] text-[#34A853] font-bold'> Shuttle<span style={{ fontWeight: '400', color: '#FFCE31' }}>App</span></span>
          </p>

       

          {!pickUp && (
            dropDown ?
              <svg
                onClick={handleDropDown}
                style={{
                  display: isMobile ? 'black' : 'none'
                }}
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="none">
                <path d="M13 6L8 11L3 6" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              :
              <svg
                onClick={handleDropDown}
                style={{
                  display: isMobile ? 'black' : 'none'
                }}
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="none">
                <path d="M3 10L8 5L13 10" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
          )
          }

        </div>


        <div className="flex flex-col gap-3 p-4 rounded-3xl bg-gray-50">
          <div className="flex flex-col gap-2">
            <p className=" m-0 text-[14px] text-[rgba(0,0,0,0.5)] ">Starting Point</p>

            <div className='flex items-center gap-2'>
              <div className={`
              w-10 h-10               
              flex items-center justify-center  
              rounded-full           
              border border-dashed    
              ${pickUp ? 'border-black bg-black' : 'border-black/80 bg-white'}
            `}>

                {pickUp ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20.6201 8.45C19.5701 3.83 15.5401 1.75 12.0001 1.75C12.0001 1.75 12.0001 1.75 11.9901 1.75C8.4601 1.75 4.4201 3.82 3.3701 8.44C2.2001 13.6 5.3601 17.97 8.2201 20.72C9.2801 21.74 10.6401 22.25 12.0001 22.25C13.3601 22.25 14.7201 21.74 15.7701 20.72C18.6301 17.97 21.7901 13.61 20.6201 8.45ZM12.0001 13.46C10.2601 13.46 8.8501 12.05 8.8501 10.31C8.8501 8.57 10.2601 7.16 12.0001 7.16C13.7401 7.16 15.1501 8.57 15.1501 10.31C15.1501 12.05 13.7401 13.46 12.0001 13.46Z" fill="white" fill-opacity="1" />
                </svg> :
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20.6201 8.45C19.5701 3.83 15.5401 1.75 12.0001 1.75C12.0001 1.75 12.0001 1.75 11.9901 1.75C8.4601 1.75 4.4201 3.82 3.3701 8.44C2.2001 13.6 5.3601 17.97 8.2201 20.72C9.2801 21.74 10.6401 22.25 12.0001 22.25C13.3601 22.25 14.7201 21.74 15.7701 20.72C18.6301 17.97 21.7901 13.61 20.6201 8.45ZM12.0001 13.46C10.2601 13.46 8.8501 12.05 8.8501 10.31C8.8501 8.57 10.2601 7.16 12.0001 7.16C13.7401 7.16 15.1501 8.57 15.1501 10.31C15.1501 12.05 13.7401 13.46 12.0001 13.46Z" fill="black" fill-opacity="0.6" />
                  </svg>
                }
              </div>

              <div className={`flex px-4 py-3 gap-2 bg-white rounded-[16px] items-center border   ${pickUp ? 'border-black/80' : 'border-black/40'} w-[90%] `}>

                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.031 20.79C20.491 21.25 21.201 20.54 20.741 20.09L16.991 16.33C18.3064 14.8745 19.0336 12.9818 19.031 11.02C19.031 6.63 15.461 3.06 11.071 3.06C6.681 3.06 3.111 6.63 3.111 11.02C3.111 15.41 6.681 18.98 11.071 18.98C13.051 18.98 14.881 18.25 16.281 17.04L20.031 20.79ZM4.11 11.02C4.11 7.18 7.24 4.06 11.07 4.06C14.91 4.06 18.03 7.18 18.03 11.02C18.03 14.86 14.91 17.98 11.07 17.98C7.24 17.98 4.11 14.86 4.11 11.02Z" fill="black" fillOpacity="0.6" />
                </svg>
                <input
                  type="text"
                  placeholder="Select Pickup Bus Stop"
                  value={pickUp?.name || searchQuery}
                  onChange={handleSearch}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyPress={handleKeyPress}
                  className={` flex-1 border-none bg-transparent text-[14px] ${pickUp ? 'text-black' : 'text-black/60'} outline-none p-0 transition-all duration-300 touch-manipulation `}
                />

                {pickUp ?
                  <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="#1D1B20" />
                  </svg>
                  :
                  <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="rgba(0,0,0,0.4)" />
                  </svg>
                }

              </div>

            </div>
          </div>


          <div style={{
            width: 0.1,
            height: 20,
            border: pickUp ? '1px dashed rgba(0,0,0,1)' : '1px dashed rgba(0,0,0,0.2)',
            position: 'relative',
            left: '6%',
            display: pickUp ? 'flex' : 'none',
            // display : inputFocused? 'none' : 'block'

          }}></div>





          <div style={{
            display: pickUp ? 'flex' : 'none',
            flexDirection: 'column',
            gap: 8
          }}>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: 'rgba(0,0,0,0.5)'
            }} >Drop Off Point</p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              // justifyContent : 'space-between'
            }}>

              <div style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 50,
                border: '1px dashed rgba(0,0,0,0.1)',
                justifyContent: 'center',
                backgroundColor: '#ffff',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20.6202 8.7C19.5802 4.07 15.5402 2 12.0002 2C12.0002 2 12.0002 2 11.9902 2C8.46024 2 4.43024 4.07 3.38024 8.69C2.20024 13.85 5.36024 18.22 8.22024 20.98C9.28024 22 10.6402 22.51 12.0002 22.51C13.3602 22.51 14.7202 22 15.7702 20.98C18.6302 18.22 21.7902 13.86 20.6202 8.7ZM15.2802 9.53L11.2802 13.53C11.1302 13.68 10.9402 13.75 10.7502 13.75C10.5602 13.75 10.3702 13.68 10.2202 13.53L8.72024 12.03C8.43024 11.74 8.43024 11.26 8.72024 10.97C9.01024 10.68 9.49024 10.68 9.78024 10.97L10.7502 11.94L14.2202 8.47C14.5102 8.18 14.9902 8.18 15.2802 8.47C15.5702 8.76 15.5702 9.24 15.2802 9.53Z" fill="black" fill-opacity="0.6" />
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
                width: '90%'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.031 20.79C20.491 21.25 21.201 20.54 20.741 20.09L16.991 16.33C18.3064 14.8745 19.0336 12.9818 19.031 11.02C19.031 6.63 15.461 3.06 11.071 3.06C6.681 3.06 3.111 6.63 3.111 11.02C3.111 15.41 6.681 18.98 11.071 18.98C13.051 18.98 14.881 18.25 16.281 17.04L20.031 20.79ZM4.11 11.02C4.11 7.18 7.24 4.06 11.07 4.06C14.91 4.06 18.03 7.18 18.03 11.02C18.03 14.86 14.91 17.98 11.07 17.98C7.24 17.98 4.11 14.86 4.11 11.02Z" fill="black" fillOpacity="0.6" />
                </svg>
                <input
                  type="text"
                  placeholder="Select Drop Off Bus Stop"
                  value={dropOff?.name}
                  onChange={handleSearch || searchQuery}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 14,
                    color: dropOff ? 'black' : 'rgba(0,0,0,0.6)',
                    outline: 'none',
                    padding: 0
                  }}
                />
                {dropOff ?
                  <svg onClick={handleClearDropOff} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="#1D1B20" />
                  </svg>
                  :
                  <svg onClick={handleClearPickUp} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.26671 12.6666L3.33337 11.7333L7.06671 7.99992L3.33337 4.26659L4.26671 3.33325L8.00004 7.06659L11.7334 3.33325L12.6667 4.26659L8.93337 7.99992L12.6667 11.7333L11.7334 12.6666L8.00004 8.93325L4.26671 12.6666Z" fill="rgba(0,0,0,0.4)" />
                  </svg>
                }
              </div>

            </div>
          </div>


        </div>

        {!closeTracker && !pickUp && (
          <section
            onClick={() => navigate('/Tracker')}
            className='flex items-start w-full gap-2 border-1 border-neutral-200 p-3 rounded-[16px] bg-neutral-50 mt-2 hover:bg-neutral-200 cursor-pointer hover:border-neutral-400'>
            <p>📦</p>
            <main className='flex flex-col gap-1'>
              <p className='m-0 text-[14px] font-medium'>Track Your Orders</p>
              <p className='m-0 text-[12px] font-medium text-neutral-500'>Kindly enter your phone number to track your order</p>
            </main>
            <svg
              onClick={(e) => {
                e.stopPropagation();
                setCloseTracker(true);
              }}
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <g opacity="0.5">
                <path d="M4.26634 12.6667L3.33301 11.7334L7.06634 8.00004L3.33301 4.26671L4.26634 3.33337L7.99967 7.06671L11.733 3.33337L12.6663 4.26671L8.93301 8.00004L12.6663 11.7334L11.733 12.6667L7.99967 8.93337L4.26634 12.6667Z" fill="#1D1B20" />
              </g>
            </svg>
          </section>
        )}

        <div className='flex flex-col gap-3'>
          <LocationList searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            locationsss={locationsss}
            isSelectingDropOff={isSelectingDropOff}
            handleDropOffPointClick={handleDropOffPointClick}
            handleStartPointClick={handleStartPointClick}
            isMobile={isMobile} />
        </div>
      </div>



      <ErrorBoundary fallback={<div className="map-error">Map loading failed. Please refresh.</div>}>
        <MapGl
          isHomepage={true}
          selectedLocation={
            selectedLocation
              ? {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                speed: 0,
                timestamp: Date.now(),
              }
              : null
          }
          dropPoints={selectedLocation?.dropPoints || []}
          pickUpLocation={
            pickUpDetails
              ? {
                latitude: pickUpDetails.latitude,
                longitude: pickUpDetails.longitude,
                speed: 0,
                timestamp: Date.now(),
              }
              : null
          }
          dropOffLocation={
            dropOff
              ? {
                latitude: dropOff.latitude,
                longitude: dropOff.longitude,
                speed: 0,
                timestamp: Date.now(),
              }
              : null
          }
        />
      </ErrorBoundary>




    </div>
  );
}

export default Home;

