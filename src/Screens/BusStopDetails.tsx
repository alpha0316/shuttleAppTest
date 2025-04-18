import { useState, useEffect } from 'react';
import MapGl from '../components/MapGL';

// import { FlyToInterpolator } from 'react-map-gl';
import useMediaQuery from '../components/useMediaQuery';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';


function BusStopDetails() {

  const isMobile = useMediaQuery('(max-width: 768px)');
  const { id  } = useParams(); 
  const { state } = useLocation();
  const { pickUp, dropOff } = state || {};

  const [busStop, setBusStop] = useState<Location | null>(null);
  const [startPoint, setStartPoint] = useState<Location | null>(null);

  // const [filteredDropPoints, setFilteredDropPoints] = useState<DropPoint[]>([]); // Filtered drop points
  // const [unfilteredDropPoints, setUnfilteredDropPoints] = useState<DropPoint[]>([]); 
  


  const navigate = useNavigate(); 
  
  // console.log('Bus Stop ID:', id);

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

  const locations: Location[]  = [
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
        { name: 'SRC Busstop', latitude: 6.675223889340042, longitude: -1.5678831412482812 },
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
        { name: 'Commerical Area', latitude: 6.682751297721754, longitude: -1.5769726260262382, },
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
        { name: 'Brunei', latitude: 6.670465091472612, longitude: -1.5741574445526254 },
        { name: 'KSB', latitude: 6.669314250173885, longitude: -1.567181795001016 },
        { name: 'Main Library', latitude: 6.675033566213408, longitude: -1.5723546778455368 },
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
        { name: 'Hall 7', latitude: 6.679295619563862, longitude: -1.572807677030472 },
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

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  
  useEffect(() => {
    const selectedBusStop = locations.find((location) => location.id === id);
  
    if (selectedBusStop) {
      let updatedBusStop = { ...selectedBusStop };
  
      if (pickUp.name === 'Main Library' && dropOff.name === 'Brunei') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'KSB' && dropPoint.name !== 'SRC Busstop' && dropPoint.name !== 'Pentecost Busstop' 
        );
      } 
      if (pickUp.name === 'Main Library' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'SRC Busstop'
        );
      } 
      if (pickUp.name === 'Main Library' && dropOff.name === 'Pentecost Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'KSB'
        );
      } 

      if (pickUp.name === 'Hall 7' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Commercial Area' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Main Library' && dropPoint.name !== 'SRC Busstop'
        );
      } 

      
      if (pickUp.name === 'Hall 7' && dropOff.name === 'Pentecost Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Commercial Area' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Main Library' && dropPoint.name !== 'SRC Busstop' && dropPoint.name !== 'KSB'
        );
      } 


      if (pickUp.name === 'Pentecost Busstop' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Main Library'  && dropPoint.name !== 'SRC Busstop'  && dropPoint.name !== '' && dropPoint.name !== 'Hall 7'  && dropPoint.name !== 'Commercial Area' && dropPoint.name !== 'Paa Joe Round About'
        );
      } 

      if (pickUp.name === 'Brunei' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== '' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Commercial Area'  && dropPoint.name !== 'SRC Busstop'  && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'Brunei' && dropOff.name === 'Pentecost Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'KSB' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Commercial Area'  && dropPoint.name !== 'SRC Busstop'  && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'SRC Busstop' && dropOff.name === 'Main Library') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'KSB'  && dropPoint.name !== 'Pentecost Busstop'
        );
      } 

      if (pickUp.name === 'Main Library' && dropOff.name === 'SRC Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'KSB'  && dropPoint.name !== 'Pentecost Busstop'
        );
      } 

      if (pickUp.name === 'SRC Busstop' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Main Library'  && dropPoint.name !== 'Pentecost Busstop' && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'Brunei' && dropOff.name === 'Main Library') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Pentecost Busstop' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'KSB' && dropPoint.name !== 'Commercial Area'  && dropPoint.name !== 'SRC Busstop'  && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'SRC Busstop' && dropOff.name === 'Brunei') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== '' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'KSB'  && dropPoint.name !== 'Pentecost Busstop'
        );
      } 

      if (pickUp.name === 'Commercial Area' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Brunei' && dropPoint.name !== 'Main Library' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'SRC Busstop' 
        );
      } 

      if (pickUp.name === 'Commercial Area' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Main Library' && dropPoint.name !== 'Main Library' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Brunei'  && dropPoint.name !== 'Conti Busstop'
        );
      } 

      if (pickUp.name === 'Commercial Area' && dropOff.name === 'Pentecost Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Main Library' && dropPoint.name !== 'Main Library' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Brunei'  && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'KSB'
        );
      } 
      if (pickUp.name === 'Commercial Area' && dropOff.name === 'Hall 7') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Main Library' && dropPoint.name !== 'Pentecost Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Brunei'  && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'KSB' && dropPoint.name !== 'Paa Joe Round About'
        );
      } 


      if (pickUp.name === 'Conti Busstop' && dropOff.name === 'Commercial Area') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'KSB' && dropPoint.name !== 'Pentecost Busstop' && dropPoint.name !== 'SRC Busstop' && dropPoint.name !== ''  && dropPoint.name !== 'KSB'  && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'SRC Busstop' && dropOff.name === 'Conti Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Commerical Area' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== '' && dropPoint.name !== 'Pentecost Busstop'  && dropPoint.name !== ''  && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'SRC Busstop' && dropOff.name === 'Commercial Area') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== '' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== '' && dropPoint.name !== 'Pentecost Busstop'  && dropPoint.name !== ''  && dropPoint.name !== 'Hall 7'
        );
      } 

      if (pickUp.name === 'Brunei' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== '' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Commercial Area'  && dropPoint.name !== 'SRC Busstop'  && dropPoint.name !== 'Hall 7'
        );
      } 

      
      if (pickUp.name === 'SRC Busstop' && dropOff.name === 'Commercial Area') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Pentecost Busstop' && dropPoint.name !== 'KSB' && dropPoint.name !== 'Commercial Area'
        );
      } 
  
      
      if (pickUp.name === 'KSB' && dropOff.name === 'Commercial Area') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Main Library' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== ''  && dropPoint.name !== ''
        );
      } 

      if (pickUp.name === 'Commercial Area' && dropOff.name === 'KSB') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Main Library' && dropPoint.name !== 'Bomso Busstop' && dropPoint.name !== 'Conti Busstop' && dropPoint.name !== 'Brunei'  && dropPoint.name !== 'Brunei'
        );
      } 


      if (pickUp.name === 'Gaza' && dropOff.name === 'Pharmacy Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Medical Village' 
        );
      } 

      if (pickUp.name === 'Gaza' && dropOff.name === 'Medical Village') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Pharmacy Busstop' 
        );
      } 

      if (pickUp.name === 'Pharmacy Busstop' && dropOff.name === 'Medical Village') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Gaza' 
        );
      } 

      if (pickUp.name === 'Pharmacy Busstop' && dropOff.name === 'Gaza') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Medical Village' 
        );
      } 

      if (pickUp.name === 'Medical Village' && dropOff.name === 'Pharmacy Busstop') {
        updatedBusStop.dropPoints = updatedBusStop.dropPoints.filter(
          (dropPoint) => dropPoint.name !== 'Gaza' 
        );
      } 
      
      // console.log('yes',startPoint)
      setStartPoint(state.pickUp)
      setBusStop(updatedBusStop);
      setSelectedLocation(updatedBusStop);
      // console.log(updatedBusStop);
    } else {
      console.error('Bus stop not found');
      navigate('/');
    }
  }, [id, navigate, pickUp, dropOff]);
  
  
  const filteredDropPointsForUI = selectedLocation?.dropPoints?.filter(
    (dropPoint: DropPoint) => dropPoint.name !== 'Paa Joe Round About'
  );


  return (
    <div style={{
      flexDirection: "column",
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
          width: isMobile ? '100%' : 340,
          minHeight: isMobile ? 310 : 'auto',
          height: isMobile ? 300 : 'auto',
          zIndex: 11111,
          marginTop: 12,
          border: '1px solid rgba(0,0,0,0.1)',
          margin: isMobile ? '16px auto' : '16px 16px 16px 0',
          position : 'fixed',
          bottom : isMobile ? -10 : '',
          overflow : 'hidden'

        }}>
         
            <div style={{
              display : 'flex',
              alignItems : 'center',
              justifyContent : 'space-between',
              // gap : '16%',
              width: '100%', 
              boxSizing: 'border-box',
            }}>
              

              <div style={{
                display : 'flex',
                backgroundColor : '#F6F6F6',
                borderRadius : 36,
                padding : 8,
                alignItems : 'center'
              }} 
              onClick={() => navigate(-1)} 
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 13L5 8L10 3" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
              </div>
              
              <div style={{
                display : 'flex',
                gap : 12,
                alignItems : 'center',
                justifyContent: 'center',
                flex: 1,
                flexWrap: 'nowrap',
                overflowX: 'auto',
              }}>

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20.6201 8.45C19.5701 3.83 15.5401 1.75 12.0001 1.75C12.0001 1.75 12.0001 1.75 11.9901 1.75C8.4601 1.75 4.4201 3.82 3.3701 8.44C2.2001 13.6 5.3601 17.97 8.2201 20.72C9.2801 21.74 10.6401 22.25 12.0001 22.25C13.3601 22.25 14.7201 21.74 15.7701 20.72C18.6301 17.97 21.7901 13.61 20.6201 8.45ZM12.0001 13.46C10.2601 13.46 8.8501 12.05 8.8501 10.31C8.8501 8.57 10.2601 7.16 12.0001 7.16C13.7401 7.16 15.1501 8.57 15.1501 10.31C15.1501 12.05 13.7401 13.46 12.0001 13.46Z" fill="black" fill-opacity="0.6"/>
                  </svg> 

              {busStop ? (
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color : 'rgba(0,0,0,0.6)'
                  }}>{startPoint ? startPoint.name : 'Loading...'}</p>
                ) : (
                  <p>Loading...</p>
                )}

                  {/* <div style={{
                    width : 10,
                    height : 1,
                    border : '1px dashed',
                    color : 'rgba(0,0,0,0.6)'
                  }}></div> */}

                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M14.4299 5.92993L20.4999 11.9999L14.4299 18.0699" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.5 12H20.33" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20.6202 8.7C19.5802 4.07 15.5402 2 12.0002 2C12.0002 2 12.0002 2 11.9902 2C8.46024 2 4.43024 4.07 3.38024 8.69C2.20024 13.85 5.36024 18.22 8.22024 20.98C9.28024 22 10.6402 22.51 12.0002 22.51C13.3602 22.51 14.7202 22 15.7702 20.98C18.6302 18.22 21.7902 13.86 20.6202 8.7ZM15.2802 9.53L11.2802 13.53C11.1302 13.68 10.9402 13.75 10.7502 13.75C10.5602 13.75 10.3702 13.68 10.2202 13.53L8.72024 12.03C8.43024 11.74 8.43024 11.26 8.72024 10.97C9.01024 10.68 9.49024 10.68 9.78024 10.97L10.7502 11.94L14.2202 8.47C14.5102 8.18 14.9902 8.18 15.2802 8.47C15.5702 8.76 15.5702 9.24 15.2802 9.53Z" fill="black" fill-opacity="1"/>
                    </svg>

                  {busStop ? (
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '700'
                  }}>{busStop.name}</p>
                ) : (
                  <p>Loading...</p>
                )}

              </div>

          
             

            </div>
      
            <div style={{
              display : 'flex',
              borderRadius : 16,
              border: '1px solid rgba(0,0,0,0.1)',
              paddingInline : 16,
              paddingBlock : 12,
              flexDirection : 'column',
              gap : 16,
              
            }}>
              

                <div style={{
                  display : 'flex',
                  gap : 8,
                  alignItems : 'center'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 5.33333V7.99999L9.66667 9.66666" stroke="black" stroke-opacity="0.6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2.892 4.58067L2.392 4.58267C2.39253 4.71447 2.44507 4.84073 2.53821 4.93399C2.63134 5.02725 2.75753 5.07997 2.88933 5.08067L2.892 4.58067ZM4.58667 5.08867C4.65233 5.08897 4.71741 5.07634 4.77819 5.0515C4.83897 5.02666 4.89426 4.99008 4.9409 4.94387C4.98755 4.89766 5.02464 4.84271 5.05005 4.78216C5.07546 4.72162 5.08869 4.65666 5.089 4.591C5.08931 4.52534 5.07668 4.46026 5.05183 4.39948C5.02699 4.3387 4.99042 4.28341 4.9442 4.23676C4.89799 4.19012 4.84304 4.15303 4.7825 4.12762C4.72195 4.10221 4.65699 4.08897 4.59133 4.08867L4.58667 5.08867ZM3.38333 2.88067C3.38263 2.74806 3.32927 2.62116 3.235 2.52789C3.14073 2.43463 3.01328 2.38263 2.88067 2.38333C2.74806 2.38404 2.62116 2.4374 2.52789 2.53167C2.43463 2.62593 2.38263 2.75339 2.38333 2.886L3.38333 2.88067ZM2.5 8C2.5 7.86739 2.44732 7.74022 2.35355 7.64645C2.25979 7.55268 2.13261 7.5 2 7.5C1.86739 7.5 1.74021 7.55268 1.64645 7.64645C1.55268 7.74022 1.5 7.86739 1.5 8H2.5ZM11.25 13.63C11.3092 13.5985 11.3615 13.5553 11.4037 13.5031C11.4459 13.4509 11.4772 13.3908 11.4957 13.3263C11.5142 13.2617 11.5194 13.1941 11.5112 13.1275C11.503 13.0609 11.4815 12.9966 11.4479 12.9385C11.4143 12.8804 11.3694 12.8297 11.3158 12.7893C11.2622 12.7489 11.201 12.7197 11.1358 12.7035C11.0707 12.6873 11.003 12.6843 10.9367 12.6948C10.8704 12.7053 10.8069 12.7291 10.75 12.7647L11.25 13.63ZM12.7647 10.75C12.7291 10.8069 12.7053 10.8704 12.6948 10.9367C12.6843 11.003 12.6873 11.0707 12.7035 11.1358C12.7197 11.201 12.7489 11.2622 12.7893 11.3158C12.8297 11.3694 12.8804 11.4143 12.9385 11.4479C12.9966 11.4815 13.0609 11.503 13.1275 11.5112C13.1941 11.5194 13.2617 11.5142 13.3263 11.4957C13.3908 11.4772 13.4509 11.4459 13.5031 11.4037C13.5553 11.3615 13.5985 11.3092 13.63 11.25L12.7647 10.75ZM3.42667 3.38C3.33243 3.47336 3.27913 3.60033 3.27851 3.73298C3.27788 3.86563 3.32998 3.99309 3.42333 4.08733C3.51669 4.18157 3.64366 4.23487 3.77631 4.23549C3.90896 4.23612 4.03643 4.18402 4.13067 4.09067L3.42667 3.38ZM12.5747 3.42467C10.028 0.878 5.91267 0.852667 3.38267 3.38267L4.08933 4.08867C6.22267 1.956 9.70467 1.96867 11.868 4.132L12.5747 3.42467ZM3.38267 3.38267L2.53867 4.22667L3.24533 4.93333L4.09 4.09L3.38267 3.38267ZM2.88933 5.08067L4.58667 5.08867L4.59133 4.08867L2.89467 4.08067L2.88933 5.08067ZM3.392 4.578L3.38333 2.88067L2.38333 2.886L2.392 4.58267L3.392 4.578ZM8 2.5C9.45869 2.5 10.8576 3.07946 11.8891 4.11091C12.9205 5.14236 13.5 6.54131 13.5 8H14.5C14.5 6.27609 13.8152 4.62279 12.5962 3.40381C11.3772 2.18482 9.72391 1.5 8 1.5V2.5ZM8 13.5C6.54131 13.5 5.14236 12.9205 4.11091 11.8891C3.07946 10.8576 2.5 9.45869 2.5 8H1.5C1.5 9.72391 2.18482 11.3772 3.40381 12.5962C4.62279 13.8152 6.27609 14.5 8 14.5V13.5ZM10.75 12.7647C9.91425 13.2481 8.96548 13.5018 8 13.5V14.5C9.18333 14.5 10.2933 14.1833 11.25 13.63L10.75 12.7647ZM13.5 8C13.5018 8.96548 13.2481 9.91425 12.7647 10.75L13.63 11.25C14.2014 10.2623 14.5016 9.14109 14.5 8H13.5ZM4.13067 4.09067C5.15927 3.06943 6.55054 2.49792 8 2.5V1.5C6.28691 1.49779 4.64263 2.1733 3.42667 3.38L4.13067 4.09067Z" fill="black" fill-opacity="0.6"/>
                  </svg>

                  <p style={{
                    margin : 0,
                    fontSize : 14,
                    color : 'rgba(0,0,0,0.5)'
                  }}>Arriving in <span style={{
                    fontWeight : '800'
                  }}>5</span> minutes </p>
                </div>

                <div style={{
                  height : 7,
                  width : '100%',
                  backgroundColor : '#D0D3DA',
                  borderRadius : 40,
                }}>
                  <div style={{
                    height : 7,
                    width : "60%",
                    backgroundColor : '#52B922',
                    borderRadius : 40,
                  }}></div>
                </div>

                <div style={{
                  display : 'flex',
                  alignItems : 'center',
                  justifyContent : 'space-between'
                }}>
                  <p style={{
                    margin : 0,
                    fontSize : 12,
                    color : 'rgba(0,0,0,0.5)'
                  }}>Heading towards Main Library</p>
                
                </div>

            </div>

            <div style={{
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

              { isMobile ? (
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                overflow: 'hidden',
                overflowX: 'auto',
                maxWidth: 600,
                flexDirection: 'row',
              }}>

          {filteredDropPointsForUI?.map((dropPoint: DropPoint, index: number) => (
                <div key={dropPoint.name}
                  style={{
                    display : 'flex',
                    alignItems : 'center',
                    // gap : 4
                  }}
                >
                  <div style={{
                  display : 'flex',
                  alignItems : 'center',
                  gap : 4,
                  flexDirection : 'column',
                  minWidth: 60,
                  // backgroundColor : 'red',
                  justifyContent : 'center',

                }}>

                  <div style={{
                    display : 'flex',
                    alignItems : 'center',
                    padding : 4,
                    backgroundColor : '#52B922',
                    borderRadius : 40,
                  
                  }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 25" fill="none">
                    <path d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z" fill="white" fill-opacity="1"/>
                  </svg>
                  </div>

                  <p style={{
                    margin : 0,
                    fontSize : 12,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}>{dropPoint.name}</p>

                </div>
               

                  {index < filteredDropPointsForUI.length - 1 && (
                     <div style={{
                      width : 30,
                      height : 4,
                      borderRadius : 24,
                      backgroundColor : '#52B922'
                    }}></div>
                  )}
                </div>
              ))}


              </div>
              )
             
              :
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                overflow : 'hidden',
                overflowY : 'auto',
                maxHeight : 'calc(70vh - 220px)',
                paddingRight: 8,
              }}>
              {filteredDropPointsForUI?.map((dropPoint: DropPoint, index: number) => (
                <div key={dropPoint.name}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                      <div style={{
                            display: 'flex',
                            // flexDirection: 'column',
                            gap: 8,
                            
                            paddingRight: 8,
                            // backgroundColor : 'red'
                          }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="#4285F4CC" />
                      </svg>
                      <p style={{
                        margin: 0,
                        fontSize: 12,
                        color: 'rgba(0,0,0,0.6)'
                      }}>{dropPoint.name}</p>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: 12,
                      color: 'rgba(0,0,0,0.6)'
                    }}>7:32</p> {/* Replace with dynamic time if available */}
                </div>

                  {index < filteredDropPointsForUI.length - 1 && (
                    <div style={{
                      height: 16,
                      width: 2,
                      backgroundColor: '#689DF6',
                      marginLeft: '2%',
                      marginTop: '2%'
                    }}></div>
                  )}
                </div>
              ))}
            </div> 
              }

            


            
          </div>
        </div>

        <MapGl      
          selectedLocation={selectedLocation}
          dropPoints={selectedLocation?.dropPoints || []}
          pickUpLocation={pickUp}
          dropOffLocation={dropOff}
          isHomepage={false} 
          />
            
      </div>
    </div>
  );
}

export default BusStopDetails;

      
{/* <div style={{
  display : 'flex',
  alignItems : 'center',
  gap : 4,
  flexDirection : 'column',
  // width : '100%'
}}>

  <div style={{
    display : 'flex',
    alignItems : 'center',
    padding : 4,
    backgroundColor : '#52B922',
    borderRadius : 40
  }}>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 25" fill="none">
    <path d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z" fill="white" fill-opacity="1"/>
  </svg>
  </div>

  <p style={{
    margin : 0,
    fontSize : 12
  }}>Brunei</p>

</div>

<div style={{
  width : 30,
  height : 4,
  borderRadius : 24,
  backgroundColor : '#52B922'
}}></div>

<div style={{
  display : 'flex',
  alignItems : 'center',
  gap : 4,
  flexDirection : 'column',
  // width : '100%'
}}>

  <div style={{
    display : 'flex',
    alignItems : 'center',
    padding : 4,
    // backgroundColor : '#52B922',
    borderRadius : 40
  }}>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 25" fill="none">
    <path d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z" fill="black" fill-opacity="0.6"/>
  </svg>
  </div>

  <p style={{
    margin : 0,
    fontSize : 12,
    color : 'rgba(0,0,0,0.5)'
  }}>Main Library</p>

</div>

<div style={{
  width : 30,
  height : 4,
  borderRadius : 24,
  backgroundColor : '#D0D3DA'
}}></div>

<div style={{
  display : 'flex',
  alignItems : 'center',
  gap : 4,
  flexDirection : 'column',
  // width : '100%'
}}>

  <div style={{
    display : 'flex',
    alignItems : 'center',
    padding : 4,
    // backgroundColor : '#52B922',
    borderRadius : 40
  }}>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 25" fill="none">
    <path d="M22 7.5V16.5C22 17.21 21.62 17.86 21 18.22V19.75C21 20.16 20.66 20.5 20.25 20.5H19.75C19.34 20.5 19 20.16 19 19.75V18.5H12V19.75C12 20.16 11.66 20.5 11.25 20.5H10.75C10.34 20.5 10 20.16 10 19.75V18.22C9.39 17.86 9 17.21 9 16.5V7.5C9 4.5 12 4.5 15.5 4.5C19 4.5 22 4.5 22 7.5ZM13 15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5C11 16.05 11.45 16.5 12 16.5C12.55 16.5 13 16.05 13 15.5ZM20 15.5C20 14.95 19.55 14.5 19 14.5C18.45 14.5 18 14.95 18 15.5C18 16.05 18.45 16.5 19 16.5C19.55 16.5 20 16.05 20 15.5ZM20 7.5H11V11.5H20V7.5ZM7 10C6.97 8.62 5.83 7.5 4.45 7.55C3.787 7.56339 3.15647 7.83954 2.69703 8.31773C2.23759 8.79592 1.98687 9.437 2 10.1C2.01306 10.6672 2.2179 11.2132 2.5811 11.6491C2.94431 12.0849 3.44446 12.3849 4 12.5V20.5H5V12.5C6.18 12.26 7 11.21 7 10Z" fill="black" fill-opacity="0.6"/>
  </svg>
  </div>

  <p style={{
    margin : 0,
    fontSize : 12,
    color : 'rgba(0,0,0,0.5)'
  }}>Pentecost stop</p>

</div> */}