import { useState } from 'react';
import MapGl from '../components/MapGL';
import useMediaQuery from '../components/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';

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

function TrackOrder() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  // State declarations
  const [selectedLocation] = useState<Location | null>(null);
  const [pickUpDetails] = useState<Location | null>(null);
  const [dropOff] = useState<Location | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [dropDown] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className='flex h-100vh w-100vw m-0 p-0 overflow-hidden '>
      <div
        className={`
            flex
            mt-3
            px-5 py-5
            bg-white
            ${isMobile ? 'ml-0' : 'ml-3'}
            rounded-3xl
            gap-3
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
              (pickUpDetails ? 'bottom-0' : 'bottom-0')
            : ''}
            transition-[bottom,max-height] duration-300 ease-in-out
            ${isMobile ? 'mx-0.5' : 'mx-3.5'}
          `}
      >
        <nav 
          onClick={() => navigate(-1)} 
          className='cursor-pointer w-6 h-6 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </nav>

        <section className='w-[240px] flex flex-col gap-2'>
          <p className="self-stretch justify-start text-black text-2xl font-semibold">
            Let's Help You Track Your Order
          </p>
          <p className="self-stretch justify-start text-black/50 text-sm font-normal">
            Kindly enter your phone number to track your order
          </p>
        </section>

        <section className='flex flex-col gap-2 p-3 items-start rounded-2xl bg-neutral-50'>
          <p className="text-center justify-center text-black text-sm font-normal">
            Your Phone Number
          </p>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
            placeholder="Enter your phone number"
          />
        </section>

        <main className='w-full flex justify-center gap-2 flex-col'>
          <p className="text-black text-base">Your Order</p>

          <section className='flex items-start w-full justify-between'>
            <div className='flex gap-2'>
              <p className="text-center justify-center text-black/50 text-xs">#011</p>
              <div className='flex flex-col gap-1'>
                <p className="justify-center text-black text-xs">Nana Ama Amankwah</p>
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-black/60 text-[10px]">055 414 4611</div>
                  <div className="w-0.5 h-3 bg-neutral-300"></div>
                  <div className="justify-start text-black/50 text-[10px] font-normal">Victory Towers</div>
                </div>
              </div>
            </div>
          </section>
        </main>
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

export default TrackOrder;