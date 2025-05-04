import { useState, useEffect,  } from 'react';
import MapGl from '../components/MapGL';

// import { FlyToInterpolator } from 'react-map-gl';
import useMediaQuery from '../components/useMediaQuery';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';
import { useClosestStop  } from "./../Screens/ClosestStopContext";

function BusStopDetails() {

  const isMobile = useMediaQuery('(max-width: 768px)');
  const { id  } = useParams(); 
  const { state } = useLocation();
  const { pickUp, dropOff } = state || {};
  const { closestStopName } = useClosestStop();


  const [startPoint, setStartPoint] = useState<Location | null>(null);
  // const [closestStopName, setClosestStopName] = useState< string | null> (null)

  // const handleClosestStopChange = useCallback((name: string) => {
  //   setClosestStopName(name);
  // }, []);

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
      // setBusStop(updatedBusStop);
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
          width: isMobile ? '100%' : 370,
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
              // justifyContent : 'space-between',
              gap : '16',
              // width: '100%', 
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
                // justifyContent: 'center',
                // flex: 1,
                // flexWrap: 'nowrap',
                // overflowX: 'auto',
              }}>

              
                <div style={{
                  display : 'flex',
                  gap : 8,
                  alignItems : 'center'
                }}>
               

                  <p style={{
                    margin : 0,
                    fontSize : 14,
                    color : 'rgba(0,0,0,0.5)'
                  }}>Bus will arrive in <span style={{
                    fontWeight : '800',
                    color : 'black'
                  }}>5</span> minutes </p>
                </div>

              </div>

          
             

            </div>
      
            {/* <div style={{
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

            </div> */}
            <div style={{
                display : 'flex',
                paddingInline: 12,
                paddingBlock: 12,
                borderRadius: 16,
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor : 'white',
                justifyContent : 'space-between'
            }}>
              <div style={{
                    display : 'flex',
                    flexDirection : 'column',
                    alignItems : "center"
                }} >
                <div style={{
                    display : 'flex',
                    flexDirection : 'column',
                    alignItems : "center",
                }}>
                <p style={{ fontWeight: '500', fontSize: 13, textAlign : 'center' }}>
                    {startPoint ? startPoint.name : 'No location'}
                  </p>
                  <p style={{
                    fontSize : 11,
                    color : 'rgba(0,0,0,0.5)',
                    padding : 2,
                    borderRadius : 4,
                    backgroundColor : '#fafafa',
                  }}>Start</p>
                </div>
                <div style={{
                    display : 'flex',
                    alignItems : "center",
                    gap : 4,
                    // padding : 4,
                    borderRadius : 6,
                    // backgroundColor : '#fafafa'
                }}>
                  {/* <p style={{
                    fontSize : 12,
                    color : 'rgba(0,0,0,0.5)'
                  }}>Start</p> */}
                  <p style={{
                    fontSize : 12,
                    //  color : 'rgba(0,0,0,0.5)'
                  }}>8:31 AM</p>
                </div>
              </div>

              <div style={{
                display :  'flex',
                alignItems : 'center'
              }}>

                <div style={{
                  height : 2,
                  width : 30,
                  borderRadius : 8,
                  backgroundColor : '#34A853'
                }}></div>

                  <svg xmlns="http://www.w3.org/2000/svg" width="57" height="36" viewBox="0 0 57 36" fill="none">
                        <path d="M31.0068 10.9014H30.0068C26.1408 10.9014 23.0068 14.0354 23.0068 17.9014C23.0068 21.7674 26.1408 24.9014 30.0068 24.9014H31.0068C34.8728 24.9014 38.0068 21.7674 38.0068 17.9014C38.0068 14.0354 34.8728 10.9014 31.0068 10.9014Z" fill="#699635" fill-opacity="0.8"/>
                        <path d="M42.0068 17.4014C42.0068 11.0501 36.8581 5.90137 30.5068 5.90137C24.1556 5.90137 19.0068 11.0501 19.0068 17.4014C19.0068 23.7526 24.1556 28.9014 30.5068 28.9014C36.8581 28.9014 42.0068 23.7526 42.0068 17.4014Z" fill="#699635" fill-opacity="0.4"/>
                        <path d="M45.0068 17.4014C45.0068 9.39324 38.515 2.90137 30.5068 2.90137C22.4987 2.90137 16.0068 9.39324 16.0068 17.4014C16.0068 25.4095 22.4987 31.9014 30.5068 31.9014C38.515 31.9014 45.0068 25.4095 45.0068 17.4014Z" fill="#699635" fill-opacity="0.1"/>
                        <g mask="url(#mask0_945_306)">
                          <path d="M39.1878 12.4398C39.1413 12.5359 39.0949 12.6319 39.0471 12.7308C33.6596 12.7789 28.2721 12.8269 22.7213 12.8763C22.7213 16.0934 22.7213 19.3105 22.7213 22.6251C23.0422 22.7909 23.2291 22.792 23.5858 22.7981C23.7061 22.8006 23.8263 22.803 23.9502 22.8055C24.0802 22.8075 24.2102 22.8095 24.3442 22.8115C24.4775 22.8142 24.6107 22.8169 24.748 22.8196C25.1749 22.8282 25.6018 22.8359 26.0287 22.8433C26.5902 22.8532 27.1517 22.8639 27.7132 22.8752C27.8432 22.8771 27.9732 22.8791 28.1072 22.8811C28.2275 22.8836 28.3477 22.886 28.4716 22.8885C28.5776 22.8903 28.6836 22.8922 28.7929 22.894C29.0546 22.9161 29.0546 22.9161 29.3361 23.0616C29.3361 23.1576 29.3361 23.2537 29.3361 23.3526C20.9762 23.3526 12.6163 23.3526 4.00304 23.3526C3.9566 23.1605 3.91016 22.9685 3.8623 22.7706C4.04808 22.7706 4.23386 22.7706 4.42526 22.7706C4.42526 19.7936 4.42526 16.8166 4.42526 13.7494C5.77213 13.7494 7.119 13.7494 8.50669 13.7494C8.50669 13.3172 8.50669 12.8851 8.50669 12.4398C12.4447 12.4174 16.3826 12.3959 20.3206 12.3754C22.149 12.3658 23.9774 12.356 25.8057 12.3455C27.3989 12.3364 28.992 12.3278 30.5852 12.3198C31.4292 12.3155 32.2731 12.311 33.1171 12.3059C33.9108 12.3011 34.7045 12.2969 35.4982 12.2933C35.7901 12.2919 36.082 12.2902 36.3739 12.2882C36.7713 12.2856 37.1687 12.2839 37.5661 12.2824C37.6826 12.2814 37.7991 12.2804 37.9191 12.2794C38.3795 12.2784 38.7477 12.2882 39.1878 12.4398Z" fill="#34A853"/>
                          <path d="M48.8909 12.3752C51.362 11.4939 51.2916 19.3104 51.2916 22.6249C51.6125 22.7908 50.5127 22.8878 50.8694 22.8939C50.9897 22.8963 50.6583 23.0615 52.5205 22.8054C50.6793 23.0586 50.4645 23.1938 52.5821 22.8639C51.982 22.9576 51.3855 23.0442 50.8694 23.1171C50.877 23.1172 50.8659 23.1187 50.8393 23.1213C50.5146 23.1671 50.2228 23.2073 49.9834 23.2403C50.1187 23.2371 50.2496 23.2338 50.3681 23.2305C50.394 23.2277 50.4203 23.2249 50.4472 23.222C50.4926 23.2172 50.5395 23.2121 50.5879 23.207C51.0148 23.2155 50.4425 23.1995 50.8694 23.207C50.9722 23.2088 50.8559 23.215 50.6303 23.2225C51.2938 23.2265 51.208 23.2532 51.0805 23.2815C50.9251 23.3159 50.7077 23.3525 51.7139 23.3525H49.2645C48.8532 23.3639 48.6624 23.3624 48.6219 23.3525H32.5734L32.4326 22.7704H32.9956V13.7492H37.077V12.4397C41.015 12.4173 44.8176 12.0759 48.8909 12.3752Z" fill="#34A853"/>
                          <path d="M23.5481 13.2951C23.7223 13.2953 23.7223 13.2953 23.9 13.2955C24.0328 13.2953 24.1656 13.2951 24.3025 13.2949C24.4493 13.2954 24.5962 13.296 24.7476 13.2965C24.9013 13.2965 25.0551 13.2965 25.2135 13.2964C25.7245 13.2965 26.2355 13.2977 26.7465 13.2988C27.0997 13.2991 27.4529 13.2993 27.8061 13.2994C28.6425 13.2999 29.4788 13.3011 30.3152 13.3025C31.5274 13.3046 32.7396 13.3054 33.9517 13.3063C35.6503 13.3077 37.3488 13.3105 39.0474 13.313C39.0474 16.338 39.0474 19.3631 39.0474 22.4798C33.7992 22.4798 28.5511 22.4798 23.1439 22.4798C23.141 20.9943 23.1381 19.5087 23.1351 17.9782C23.1338 17.5086 23.1325 17.0389 23.1312 16.5551C23.1308 16.1854 23.1304 15.8158 23.1301 15.4461C23.1298 15.3495 23.1294 15.2528 23.129 15.1533C23.128 14.8699 23.1279 14.5865 23.1279 14.3032C23.1276 14.1432 23.1273 13.9833 23.127 13.8185C23.1503 13.3222 23.1503 13.3222 23.5481 13.2951Z" fill="#34A853"/>
                          <path d="M54.8102 11.2757C54.8162 11.5181 54.8159 11.7608 54.8102 12.0032C54.5653 12.2563 54.22 12.2028 53.8866 12.2305C53.6729 12.2488 53.6729 12.2488 53.455 12.2675C53.3449 12.2763 53.2348 12.2851 53.1213 12.2942C53.1416 12.4118 53.1619 12.5294 53.1829 12.6506C53.209 12.8061 53.2351 12.9615 53.262 13.1217C53.2882 13.2754 53.3143 13.429 53.3412 13.5872C53.3958 13.9892 53.4144 14.3629 53.4028 14.7678C53.5421 14.8158 53.6814 14.8638 53.825 14.9133C53.982 15.6845 54.0144 16.4558 53.9657 17.2413C53.9193 17.2893 53.8728 17.3373 53.825 17.3868C53.8015 17.8961 53.8015 17.8961 53.825 18.4053C53.8714 18.4534 53.9179 18.5014 53.9657 18.5508C54.0271 19.4176 54.0225 20.2158 53.6843 21.0244C53.5914 21.0244 53.4985 21.0244 53.4028 21.0244C53.4086 21.1715 53.4144 21.3185 53.4204 21.47C53.402 22.0692 53.2997 22.4967 53.1213 23.0615C53.3535 23.1095 53.5857 23.1575 53.825 23.207C53.825 23.303 53.825 23.399 53.825 23.498C53.9614 23.495 54.0979 23.492 54.2384 23.4889C54.6694 23.498 54.6694 23.498 54.8102 23.6435C54.8159 23.9344 54.8162 24.2256 54.8102 24.5165C54.1768 24.4961 53.5435 24.4746 52.9102 24.4528C52.7317 24.4471 52.5532 24.4414 52.3692 24.4355C52.1951 24.4294 52.0209 24.4233 51.8415 24.417C51.6823 24.4117 51.5231 24.4064 51.359 24.4009C50.8695 24.371 50.8695 24.371 50.3923 24.2975C49.5578 24.1881 48.7216 24.2056 47.8818 24.2074C47.6932 24.2072 47.5047 24.207 47.3161 24.2067C46.9076 24.2063 46.4991 24.2063 46.0905 24.2067C45.4258 24.2073 44.761 24.2069 44.0962 24.2063C43.2561 24.2057 42.416 24.2054 41.576 24.2054C39.9261 24.2054 38.2762 24.2036 36.6263 24.2011C36.3664 24.2007 36.1065 24.2003 35.8466 24.2C35.4528 24.1994 35.059 24.1988 34.6652 24.1982C33.1818 24.1961 31.6985 24.1941 30.2151 24.1923C30.0795 24.1921 29.944 24.192 29.8043 24.1918C27.6052 24.1893 25.406 24.1888 23.2069 24.1891C20.9487 24.1893 18.6905 24.1867 16.4323 24.1817C15.0394 24.1787 13.6466 24.1779 12.2538 24.18C11.3 24.1812 10.3463 24.1798 9.39262 24.1763C8.8421 24.1743 8.29164 24.1736 7.74113 24.176C7.23734 24.1782 6.73367 24.177 6.2299 24.1732C5.96099 24.1721 5.69208 24.1745 5.42319 24.177C4.12158 24.1618 4.12158 24.1618 3.68479 23.7415C3.36266 23.2286 3.35204 22.8896 3.35161 22.2797C3.3501 22.1216 3.3501 22.1216 3.34856 21.9603C3.34619 21.6134 3.34891 21.2668 3.35192 20.9198C3.3518 20.6779 3.35145 20.4361 3.35089 20.1942C3.35048 19.6878 3.35255 19.1815 3.35642 18.6751C3.36122 18.0268 3.36037 17.3786 3.35773 16.7303C3.35624 16.231 3.35751 15.7317 3.35962 15.2324C3.36035 14.9934 3.36028 14.7544 3.3594 14.5154C3.35863 14.181 3.3615 13.8469 3.36535 13.5125C3.36622 13.3224 3.36709 13.1324 3.36799 12.9366C3.45942 12.3094 3.53029 12.1234 4.00338 11.7122C4.60101 11.5986 5.19578 11.6144 5.80187 11.6201C5.99043 11.6193 6.17898 11.6182 6.36753 11.6168C6.88617 11.6138 7.40472 11.6153 7.92336 11.6176C8.48249 11.6192 9.04162 11.6167 9.60075 11.6146C10.5698 11.6116 11.5389 11.6113 12.508 11.6128C13.9101 11.6148 15.3121 11.6128 16.7142 11.6096C18.99 11.6047 21.2659 11.6029 23.5418 11.6031C25.7507 11.6034 27.9596 11.6025 30.1685 11.5999C30.3725 11.5996 30.3725 11.5996 30.5806 11.5994C32.0652 11.5976 33.5499 11.5955 35.0345 11.5934C35.4283 11.5928 35.8221 11.5922 36.2159 11.5916C36.4755 11.5913 36.7351 11.5909 36.9947 11.5905C38.6469 11.5881 40.299 11.5868 41.9512 11.5868C42.7848 11.5867 43.6184 11.5862 44.4521 11.5856C45.1114 11.5851 45.7707 11.5852 46.43 11.5858C46.8301 11.586 47.2301 11.5856 47.6302 11.585C47.9001 11.5848 48.1701 11.5853 48.44 11.5859C48.6007 11.5855 48.7614 11.5852 48.9269 11.5848C49.0652 11.5848 49.2035 11.5848 49.346 11.5848C49.7694 11.5655 50.1711 11.4979 50.588 11.4212C50.7932 11.4185 50.9986 11.4215 51.2037 11.4303C51.9705 11.4424 52.7118 11.3384 53.4684 11.2209C53.9509 11.15 54.3465 11.0999 54.8102 11.2757ZM36.9366 12.3014C32.794 12.3177 28.6513 12.3376 24.5086 12.359C22.7576 12.368 21.0066 12.3767 19.2556 12.3854C15.6727 12.4032 12.0899 12.4213 8.50703 12.4397C8.50703 12.8718 8.50703 13.304 8.50703 13.7492C7.16016 13.7492 5.81329 13.7492 4.4256 13.7492C4.4256 16.7262 4.4256 19.7032 4.4256 22.7705C4.19338 22.7705 3.96116 22.7705 3.72191 22.7705C3.76835 23.0105 3.81479 23.2506 3.86265 23.498C18.9569 23.498 34.0512 23.498 49.6028 23.498C49.6028 23.4019 49.6028 23.3059 49.6028 23.207C49.6895 23.1933 49.7763 23.1796 49.8656 23.1655C50.1754 23.0893 50.1754 23.0893 50.334 22.8438C51.03 21.3412 51.0622 19.8176 51.0542 18.178C51.054 18.0751 51.0539 17.9723 51.0537 17.8663C51.1204 15.0888 51.1204 15.0888 50.1658 12.5852C49.706 12.2792 49.3354 12.2584 48.795 12.26C48.5451 12.2597 48.5451 12.2597 48.2902 12.2594C48.0144 12.2613 48.0144 12.2613 47.733 12.2632C47.5346 12.2636 47.3363 12.2638 47.138 12.2639C46.588 12.2645 46.0382 12.267 45.4882 12.2698C44.8902 12.2726 44.2921 12.2737 43.6941 12.275C42.3451 12.2784 40.9961 12.2842 39.6472 12.2903C38.7437 12.2944 37.8402 12.2979 36.9366 12.3014Z" fill="#C4C4C3"/>
                          <path d="M25.2539 15.4951C29.0623 15.4951 32.8707 15.4951 36.7945 15.4951C36.7945 17.0797 36.7945 18.6642 36.7945 20.2967C32.9861 20.2967 29.1777 20.2967 25.2539 20.2967C25.2539 18.7122 25.2539 17.1277 25.2539 15.4951Z" fill="#34A853"/>
                          <path d="M51.9337 12.1306C52.0319 12.1301 52.1302 12.1295 52.2314 12.1289C52.9626 12.1304 52.9626 12.1304 53.1212 12.2943C53.1776 12.5719 53.2262 12.8512 53.2707 13.131C53.2956 13.2833 53.3204 13.4356 53.346 13.5925C53.3965 13.9915 53.4135 14.3664 53.4027 14.7679C53.542 14.8159 53.6813 14.8639 53.8249 14.9134C53.9819 15.6846 54.0143 16.4559 53.9656 17.2415C53.9192 17.2895 53.8727 17.3375 53.8249 17.387C53.8014 17.8962 53.8014 17.8962 53.8249 18.4055C53.8946 18.4775 53.8946 18.4775 53.9656 18.551C54.027 19.4177 54.0224 20.216 53.6841 21.0246C53.5913 21.0246 53.4984 21.0246 53.4027 21.0246C53.4085 21.1716 53.4143 21.3187 53.4203 21.4702C53.4019 22.0694 53.2996 22.4968 53.1212 23.0616C53.307 23.1096 53.4927 23.1576 53.6841 23.2071C53.6841 23.3031 53.6841 23.3992 53.6841 23.4981C53.1099 23.6392 52.5672 23.6677 51.9777 23.6709C51.7203 23.674 51.7203 23.674 51.4576 23.6772C51.0101 23.6436 51.0101 23.6436 50.5879 23.3526C50.6311 23.2344 50.6742 23.1163 50.7187 22.9945C51.6341 19.8653 51.5868 15.3926 50.5879 12.2943C51.0171 12.0725 51.4635 12.1279 51.9337 12.1306Z" fill="#282828"/>
                          <path d="M22.7208 12.8765C24.9204 12.8731 27.12 12.8705 29.3196 12.869C30.3408 12.8682 31.362 12.8672 32.3833 12.8655C33.2731 12.8641 34.1629 12.8631 35.0527 12.8628C35.5241 12.8626 35.9955 12.8622 36.4669 12.8611C36.9924 12.8601 37.5178 12.8599 38.0432 12.86C38.2006 12.8595 38.358 12.8589 38.5202 12.8584C38.6625 12.8586 38.8048 12.8588 38.9514 12.859C39.1381 12.8588 39.1381 12.8588 39.3284 12.8586C39.6095 12.8765 39.6095 12.8765 39.7503 13.022C39.7635 13.3256 39.7668 13.6296 39.7662 13.9334C39.7663 14.0285 39.7663 14.1236 39.7663 14.2216C39.7662 14.5373 39.7651 14.853 39.764 15.1688C39.7637 15.3871 39.7635 15.6055 39.7634 15.8238C39.7629 16.3996 39.7615 16.9754 39.7599 17.5511C39.7585 18.1383 39.7578 18.7254 39.7571 19.3125C39.7556 20.4652 39.7532 21.618 39.7503 22.7707C37.5323 22.7741 35.3144 22.7767 33.0965 22.7783C32.0667 22.779 31.037 22.7801 30.0072 22.7817C29.11 22.7832 28.2128 22.7841 27.3156 22.7844C26.8402 22.7846 26.3649 22.7851 25.8895 22.7861C25.3597 22.7872 24.8299 22.7873 24.3001 22.7873C24.1413 22.7878 23.9826 22.7883 23.8191 22.7888C23.6038 22.7885 23.6038 22.7885 23.3843 22.7882C23.2588 22.7884 23.1334 22.7885 23.0041 22.7886C22.7208 22.7707 22.7208 22.7707 22.5801 22.6252C22.5661 22.3322 22.5621 22.0386 22.5619 21.7452C22.5614 21.5568 22.561 21.3684 22.5605 21.1742C22.5608 20.967 22.5611 20.7597 22.5614 20.5524C22.5613 20.3412 22.5612 20.1301 22.561 19.919C22.5608 19.4758 22.5611 19.0326 22.5618 18.5895C22.5626 18.0207 22.5621 17.452 22.5613 16.8833C22.5607 16.447 22.5609 16.0108 22.5613 15.5745C22.5614 15.3648 22.5612 15.1551 22.5609 14.9454C22.5606 14.6524 22.5612 14.3594 22.5619 14.0664C22.562 13.8995 22.5621 13.7326 22.5622 13.5606C22.5801 13.1675 22.5801 13.1675 22.7208 12.8765ZM23.1431 13.4585C23.1298 13.7398 23.1265 14.0216 23.1271 14.3032C23.1271 14.4863 23.1271 14.6694 23.1271 14.8581C23.1278 15.0541 23.1286 15.2501 23.1293 15.4461C23.1295 15.6233 23.1296 15.8005 23.1297 15.9831C23.1305 16.6481 23.1324 17.3132 23.1343 17.9782C23.1372 19.4637 23.1401 20.9492 23.1431 22.4797C28.3912 22.4797 33.6394 22.4797 39.0466 22.4797C39.0466 19.4547 39.0466 16.4297 39.0466 13.313C36.2484 13.3088 36.2484 13.3088 33.4503 13.3059C32.3098 13.305 31.1694 13.304 30.029 13.302C29.1101 13.3004 28.1912 13.2996 27.2722 13.2992C26.9208 13.2989 26.5693 13.2984 26.2179 13.2976C25.7275 13.2966 25.2371 13.2964 24.7467 13.2965C24.5999 13.296 24.453 13.2954 24.3016 13.2949C24.1688 13.2951 24.036 13.2953 23.8991 13.2955C23.783 13.2954 23.6669 13.2952 23.5473 13.2951C23.2818 13.2831 23.2818 13.2831 23.1431 13.4585Z" fill="#34A853" fill-opacity="0.6"/>
                          <path d="M4.7458 11.6182C4.84383 11.6203 4.94185 11.6224 5.04285 11.6246C5.14793 11.624 5.25301 11.6233 5.36127 11.6227C5.71359 11.6215 6.06567 11.6255 6.41796 11.6295C6.6704 11.6297 6.92284 11.6296 7.17528 11.6292C7.86093 11.629 8.54649 11.6332 9.23212 11.6383C9.94851 11.6429 10.6649 11.6433 11.3813 11.6441C12.7381 11.6464 14.0948 11.6524 15.4515 11.6597C16.9961 11.6678 18.5406 11.6718 20.0851 11.6755C23.2625 11.6831 26.4399 11.6959 29.6172 11.7121C29.6172 11.8561 29.6172 12.0002 29.6172 12.1486C29.4879 12.1482 29.3586 12.1478 29.2254 12.1474C26.081 12.1377 22.9367 12.1305 19.7924 12.126C18.2718 12.1237 16.7513 12.1206 15.2307 12.1157C13.9056 12.1113 12.5806 12.1085 11.2555 12.1075C10.5536 12.1069 9.8518 12.1056 9.14997 12.1024C8.48968 12.0995 7.82941 12.0986 7.16911 12.0992C6.92651 12.0991 6.68391 12.0982 6.44131 12.0965C6.11052 12.0944 5.77983 12.0949 5.44904 12.0961C5.26378 12.0957 5.07852 12.0953 4.88765 12.0949C4.3976 12.1518 4.20121 12.2219 3.86199 12.5851C3.81554 12.7291 3.7691 12.8732 3.72125 13.0216C3.95347 13.0216 4.18568 13.0216 4.42494 13.0216C4.47139 12.8295 4.51783 12.6375 4.56568 12.4396C4.56568 12.8237 4.56568 13.2079 4.56568 13.6036C5.77322 13.6036 6.98076 13.6036 8.22489 13.6036C8.22489 13.2195 8.22489 12.8354 8.22489 12.4396C8.27134 12.4396 8.31778 12.4396 8.36563 12.4396C8.36563 12.8717 8.36563 13.3039 8.36563 13.7491C7.0652 13.7491 5.76478 13.7491 4.42494 13.7491C4.42494 16.6781 4.42494 19.6071 4.42494 22.6248C4.09983 22.6248 3.77473 22.6248 3.43977 22.6248C3.42672 21.3094 3.41672 19.994 3.4106 18.6786C3.40766 18.0677 3.40368 17.4569 3.3973 16.8461C3.39118 16.2564 3.38781 15.6668 3.38636 15.0772C3.38532 14.8524 3.38329 14.6276 3.38025 14.4028C3.37615 14.0875 3.3756 13.7724 3.37586 13.4572C3.37461 13.2778 3.37336 13.0985 3.37207 12.9138C3.49683 12.0399 3.87843 11.6321 4.7458 11.6182Z" fill="#BABABA"/>
                          <path d="M5.42617 11.95C5.57761 11.9493 5.57761 11.9493 5.7321 11.9485C6.07042 11.9475 6.40866 11.9495 6.74697 11.9516C6.98947 11.9515 7.23198 11.9512 7.47448 11.9507C8.13307 11.9499 8.79163 11.9519 9.45022 11.9544C10.1386 11.9566 10.8269 11.9564 11.5153 11.9565C12.6708 11.9571 13.8264 11.9592 14.9819 11.9625C16.4671 11.9667 17.9523 11.9682 19.4375 11.9689C20.7124 11.9695 21.9873 11.9713 23.2622 11.9733C23.6731 11.9739 24.0839 11.9743 24.4948 11.9747C25.139 11.9754 25.7833 11.9769 26.4275 11.979C26.6646 11.9797 26.9017 11.9801 27.1388 11.9802C27.4611 11.9805 27.7833 11.9816 28.1056 11.983C28.2863 11.9834 28.4671 11.9839 28.6533 11.9843C29.0537 12.0034 29.0537 12.0034 29.1945 12.1489C29.4923 12.167 29.7907 12.1748 30.089 12.1788C30.1823 12.1803 30.2757 12.1817 30.3719 12.1832C30.6818 12.1878 30.9917 12.1914 31.3017 12.195C31.5161 12.198 31.7304 12.201 31.9448 12.2041C32.51 12.2122 33.0753 12.2194 33.6405 12.2264C34.2169 12.2337 34.7933 12.2418 35.3697 12.2498C36.5013 12.2655 37.633 12.2803 38.7647 12.2944C38.7647 12.3425 38.7647 12.3905 38.7647 12.44C28.7793 12.44 18.7938 12.44 8.50583 12.44C8.50583 12.8721 8.50583 13.3042 8.50583 13.7495C8.41294 13.7015 8.32005 13.6535 8.22435 13.604C7.94859 13.5916 7.67242 13.5884 7.39641 13.5898C7.15013 13.5905 7.15013 13.5905 6.89888 13.5912C6.72671 13.5924 6.55454 13.5936 6.37715 13.5949C6.20389 13.5955 6.03064 13.5962 5.85213 13.5969C5.42312 13.5986 4.99413 13.601 4.56514 13.604C4.51869 13.4119 4.47225 13.2199 4.4244 13.022C4.19218 13.022 3.95996 13.022 3.7207 13.022C3.77011 12.6517 3.82934 12.4734 4.08691 12.2051C4.54929 11.9288 4.89314 11.9493 5.42617 11.95Z" fill="#CFCFCF"/>
                          <path d="M3.72168 22.77C3.86101 22.842 3.86101 22.842 4.00316 22.9155C4.00316 23.0596 4.00316 23.2036 4.00316 23.352C12.3631 23.352 20.723 23.352 29.3362 23.352C29.3362 23.256 29.3362 23.16 29.3362 23.061C27.2462 23.013 25.1562 22.965 23.0029 22.9155C23.0029 22.8675 23.0029 22.8195 23.0029 22.77C28.4833 22.77 33.9637 22.77 39.6101 22.77C39.4708 22.9141 39.3315 23.0581 39.1879 23.2065C44.3432 23.2786 44.3432 23.2786 49.6026 23.352C49.6026 23.4001 49.6026 23.4481 49.6026 23.4975C34.5083 23.4975 19.4141 23.4975 3.86242 23.4975C3.81597 23.2575 3.76953 23.0174 3.72168 22.77Z" fill="#34A853"/>
                          <path d="M3.43945 13.1675C3.76456 13.1675 4.08967 13.1675 4.42463 13.1675C4.42463 16.2885 4.42463 19.4096 4.42463 22.6252C4.09952 22.6252 3.77441 22.6252 3.43945 22.6252C3.43945 19.5042 3.43945 16.3831 3.43945 13.1675Z" fill="#4B4B4B"/>
                          <path d="M51.889 12.1294C52.0168 12.1298 52.1445 12.1301 52.2761 12.1305C52.4677 12.13 52.4677 12.13 52.6631 12.1294C52.9798 12.1487 52.9798 12.1487 53.1205 12.2942C53.1769 12.5718 53.2255 12.851 53.27 13.1309C53.2949 13.2832 53.3198 13.4355 53.3454 13.5924C53.3958 13.9914 53.4128 14.3662 53.402 14.7678C53.5413 14.8158 53.6806 14.8638 53.8242 14.9133C54.0292 15.92 54.1335 16.8928 53.6835 17.8234C53.1726 17.8234 52.6617 17.8234 52.1353 17.8234C52.1122 17.499 52.1122 17.499 52.0886 17.168C51.9736 15.6429 51.8349 14.1598 51.5004 12.6682C51.4777 12.5448 51.455 12.4214 51.4316 12.2942C51.5724 12.1487 51.5724 12.1487 51.889 12.1294Z" fill="#3E3E3E"/>
                          <path d="M25.2539 15.4951C29.0623 15.4951 32.8707 15.4951 36.7945 15.4951C36.7945 17.0797 36.7945 18.6642 36.7945 20.2967C32.9861 20.2967 29.1777 20.2967 25.2539 20.2967C25.2539 18.7122 25.2539 17.1277 25.2539 15.4951ZM25.5354 15.7861C25.5354 17.1786 25.5354 18.5711 25.5354 20.0057C29.158 20.0057 32.7806 20.0057 36.513 20.0057C36.513 18.6133 36.513 17.2208 36.513 15.7861C32.8904 15.7861 29.2678 15.7861 25.5354 15.7861Z" fill="#D4D4D4"/>
                          <path d="M54.8084 11.2762C54.8145 11.5186 54.8142 11.7612 54.8084 12.0037C54.5546 12.2662 54.1658 12.1837 53.8228 12.1952C53.6518 12.2013 53.4807 12.2074 53.3046 12.2137C53.1245 12.2194 52.9444 12.2251 52.7589 12.231C52.5783 12.2373 52.3978 12.2436 52.2117 12.2501C51.7638 12.2656 51.3157 12.2804 50.8677 12.2947C50.8677 12.7303 50.9386 13.1199 51.0179 13.5461C51.3763 15.5465 51.3312 17.5426 51.2901 19.5699C51.2436 19.5699 51.1972 19.5699 51.1493 19.5699C51.1458 19.4569 51.1422 19.344 51.1385 19.2277C51.1221 18.7112 51.1049 18.1948 51.0877 17.6783C51.0821 17.5007 51.0766 17.3231 51.0709 17.1401C50.998 14.7335 50.998 14.7335 50.0233 12.5857C49.6398 12.4535 49.3728 12.4135 48.9749 12.3941C48.8556 12.3881 48.7363 12.382 48.6134 12.3757C48.4894 12.37 48.3655 12.3642 48.2378 12.3583C48.1122 12.3521 47.9864 12.3458 47.857 12.3393C47.547 12.3239 47.2372 12.309 46.9272 12.2947C46.9272 12.1987 46.9272 12.1026 46.9272 12.0037C44.4192 12.0037 41.9111 12.0037 39.3271 12.0037C39.3271 11.9557 39.3271 11.9076 39.3271 11.8582C39.4244 11.8567 39.5217 11.8552 39.6219 11.8536C40.5491 11.8392 41.4762 11.8243 42.4035 11.8088C42.8799 11.8008 43.3562 11.7931 43.8326 11.7858C47.2221 11.7833 47.2221 11.7833 50.5863 11.4217C50.7915 11.419 50.9969 11.422 51.202 11.4308C51.9688 11.4428 52.7102 11.3389 53.4668 11.2213C53.9492 11.1505 54.3448 11.1004 54.8084 11.2762Z" fill="#BAB0A5"/>
                          <path d="M29.6354 16.2217C29.8049 16.245 29.8049 16.245 29.9779 16.2689C30.148 16.2905 30.148 16.2905 30.3215 16.3126C30.6024 16.3689 30.6024 16.3689 30.7431 16.5144C30.7573 16.9221 30.7627 17.3254 30.7607 17.733C30.7616 17.9035 30.7616 17.9035 30.7624 18.0774C30.7616 18.5626 30.7518 18.9612 30.6024 19.4245C30.3796 19.4324 30.1568 19.438 29.9339 19.4427C29.8098 19.446 29.6857 19.4494 29.5579 19.4529C29.1769 19.423 28.9662 19.3122 28.6321 19.1335C28.5392 19.1815 28.4463 19.2295 28.3506 19.279C28.3506 18.4627 28.3506 17.6464 28.3506 16.8054C28.5828 16.7094 28.815 16.6133 29.0543 16.5144C29.3358 16.2234 29.3358 16.2234 29.6354 16.2217Z" fill="#E5E7E6"/>
                          <path d="M53.6831 17.9692C54.0814 18.6654 54.0217 19.3655 53.9646 20.1518C53.8239 20.6883 53.8239 20.6883 53.6831 21.0248C53.5902 21.0248 53.4973 21.0248 53.4016 21.0248C53.4104 21.2454 53.4104 21.2454 53.4192 21.4704C53.4008 22.0696 53.2986 22.4971 53.1202 23.0619C53.3059 23.1099 53.4917 23.1579 53.6831 23.2074C53.6831 23.3034 53.6831 23.3994 53.6831 23.4984C53.0626 23.6588 52.4891 23.655 51.8535 23.6439C51.9928 23.5719 51.9928 23.5719 52.135 23.4984C52.1321 23.3333 52.1292 23.1683 52.1262 22.9982C52.135 22.4798 52.135 22.4798 52.2757 22.3343C52.6303 20.9624 52.6409 19.525 52.6979 18.1147C53.1202 17.9692 53.1202 17.9692 53.6831 17.9692Z" fill="#595959"/>
                          <path d="M51.5721 12.1487C51.9368 14.056 52.2335 15.8747 52.135 17.8233C52.6459 17.8233 53.1568 17.8233 53.6832 17.8233C53.6832 17.8713 53.6832 17.9193 53.6832 17.9688C52.9401 17.9688 52.197 17.9688 51.4313 17.9688C51.394 17.6567 51.3566 17.3446 51.3181 17.023C51.281 16.7172 51.2437 16.4114 51.2063 16.1056C51.1807 15.8948 51.1553 15.684 51.1301 15.4731C50.9403 13.8679 50.9403 13.8679 50.5869 12.2942C50.9335 12.115 51.1892 12.1382 51.5721 12.1487Z" fill="#212121"/>
                          <path d="M34.1208 16.3687C34.353 16.4167 34.5852 16.4647 34.8245 16.5142C34.8709 16.7062 34.9174 16.8983 34.9652 17.0962C35.151 17.0962 35.3368 17.0962 35.5282 17.0962C35.5282 17.2882 35.5282 17.4803 35.5282 17.6782C35.0529 17.6 34.5857 17.5166 34.1208 17.3872C34.1469 17.4742 34.1731 17.5612 34.2 17.6509C34.2615 17.9692 34.2615 17.9692 34.1208 18.4057C34.353 18.4057 34.5852 18.4057 34.8245 18.4057C34.8245 18.3097 34.8245 18.2136 34.8245 18.1147C35.0567 18.0667 35.2889 18.0187 35.5282 17.9692C35.5282 18.2093 35.5282 18.4494 35.5282 18.6967C35.3424 18.6967 35.1566 18.6967 34.9652 18.6967C34.9188 18.8888 34.8723 19.0808 34.8245 19.2787C34.5923 19.3267 34.3601 19.3748 34.1208 19.4242C34.086 19.3342 34.0511 19.2442 34.0152 19.1514C33.8379 18.7755 33.8379 18.7755 33.2764 18.5512C33.2764 18.023 33.2764 17.4948 33.2764 16.9507C33.5086 16.9027 33.7408 16.8546 33.9801 16.8052C34.0265 16.6611 34.0729 16.5171 34.1208 16.3687Z" fill="#CCCCCC"/>
                          <path d="M4.70617 12.5854C5.86727 12.5854 7.02836 12.5854 8.22464 12.5854C8.22464 12.9216 8.22464 13.2577 8.22464 13.604C7.0171 13.604 5.80956 13.604 4.56543 13.604C4.61187 13.2679 4.65832 12.9317 4.70617 12.5854Z" fill="#D7D7D7"/>
                          <path d="M52.416 12.1489C52.7643 12.221 52.7643 12.221 53.1197 12.2944C53.1673 12.5701 53.2141 12.846 53.2604 13.122C53.2866 13.2756 53.3127 13.4292 53.3396 13.5875C53.3942 13.9894 53.4128 14.3631 53.4012 14.768C53.5405 14.816 53.6799 14.864 53.8234 14.9135C53.979 15.6776 54.0406 16.4633 53.9641 17.2416C53.8713 17.3856 53.7784 17.5296 53.6827 17.6781C53.4969 17.6781 53.3111 17.6781 53.1197 17.6781C53.1119 17.5562 53.1041 17.4343 53.0961 17.3087C53.0669 16.8569 53.0372 16.4051 53.0072 15.9534C52.9943 15.7578 52.9816 15.5622 52.9691 15.3666C52.9512 15.0855 52.9324 14.8046 52.9135 14.5236C52.9025 14.3544 52.8914 14.1853 52.88 14.011C52.8622 13.6111 52.8622 13.6111 52.6975 13.313C52.7004 13.1689 52.7033 13.0249 52.7063 12.8764C52.7459 12.4228 52.7459 12.4228 52.416 12.1489Z" fill="#717171"/>
                          <path d="M54.8093 11.276C54.8153 11.5185 54.815 11.7611 54.8093 12.0035C54.6686 12.149 54.6686 12.149 54.2521 12.1656C54.07 12.1648 53.888 12.164 53.7004 12.1633C53.5555 12.1629 53.5555 12.1629 53.4076 12.1626C53.0978 12.1618 52.7881 12.16 52.4783 12.1581C52.2688 12.1574 52.0592 12.1567 51.8497 12.1562C51.335 12.1545 50.8203 12.152 50.3057 12.149C50.3057 11.909 50.3057 11.6689 50.3057 11.4215C50.4015 11.4249 50.4972 11.4283 50.5959 11.4318C51.577 11.4506 52.5137 11.3733 53.4816 11.2212C53.9603 11.1498 54.3491 11.1025 54.8093 11.276Z" fill="#C0C0C0"/>
                          <path d="M52.707 17.9595C52.9116 17.964 52.9116 17.964 53.1204 17.9686C52.9811 18.0166 52.8417 18.0646 52.6982 18.1141C52.7014 18.2846 52.7047 18.4551 52.7081 18.6307C52.725 19.9008 52.7012 21.0907 52.4167 22.3337C52.3933 22.4588 52.3699 22.5839 52.3458 22.7128C52.276 23.0612 52.276 23.0612 52.1352 23.4977C51.8449 23.5977 51.8449 23.5977 51.5723 23.6432C51.6453 22.9884 51.7368 22.3451 51.8537 21.6971C52.0057 20.7904 52.0522 19.8876 52.0871 18.9695C52.1279 17.9717 52.1279 17.9717 52.707 17.9595Z" fill="#444444"/>
                          <path d="M5.40297 11.9605C5.54235 11.9615 5.54235 11.9615 5.68455 11.9624C5.97998 11.9648 6.27528 11.9703 6.57067 11.9759C6.77151 11.9781 6.97236 11.9801 7.17321 11.9818C7.66437 11.9866 8.15546 11.9942 8.64657 12.0032C8.60012 12.5794 8.55368 13.1555 8.50583 13.7492C8.45938 13.7492 8.41294 13.7492 8.36509 13.7492C8.29542 13.173 8.29542 13.173 8.22435 12.5852C7.06325 12.5852 5.90216 12.5852 4.70588 12.5852C4.65943 12.6812 4.61299 12.7772 4.56514 12.8762C4.4244 13.0217 4.4244 13.0217 4.06375 13.0308C3.89394 13.0263 3.89394 13.0263 3.7207 13.0217C3.77026 12.6502 3.82949 12.4728 4.08836 12.2042C4.54428 11.9314 4.8782 11.9536 5.40297 11.9605Z" fill="#C5C5C5"/>
                          <path d="M53.2614 18.1143C53.4008 18.1143 53.5401 18.1143 53.6836 18.1143C54.1022 18.7633 54.0197 19.3898 53.9651 20.1513C53.8244 20.6879 53.8244 20.6879 53.6836 21.0243C53.5908 21.0243 53.4979 21.0243 53.4022 21.0243C53.4109 21.2449 53.4109 21.2449 53.4198 21.4699C53.4014 22.0692 53.2991 22.4966 53.1207 23.0614C53.3065 23.1094 53.4922 23.1574 53.6836 23.2069C53.6836 23.3029 53.6836 23.3989 53.6836 23.4979C53.0567 23.5699 53.0567 23.5699 52.417 23.6434C52.5099 23.4993 52.6028 23.3553 52.6985 23.2069C52.7546 22.9237 52.8005 22.6383 52.8392 22.352C52.9515 21.525 52.9515 21.525 53.1284 21.1261C53.3251 20.5453 53.2911 19.9885 53.279 19.3783C53.2777 19.2567 53.2765 19.1351 53.2752 19.0097C53.2719 18.7112 53.2668 18.4127 53.2614 18.1143Z" fill="#848484"/>
                          <path d="M53.6845 23.207C53.7309 23.3031 53.7774 23.3991 53.8252 23.498C53.9617 23.495 54.0981 23.492 54.2386 23.4889C54.6697 23.498 54.6697 23.498 54.8104 23.6435C54.8161 23.9345 54.8164 24.2256 54.8104 24.5166C54.1682 24.4963 53.5261 24.4747 52.884 24.4529C52.702 24.4472 52.5199 24.4415 52.3324 24.4356C52.1568 24.4295 51.9813 24.4234 51.8005 24.4171C51.639 24.4118 51.4776 24.4064 51.3113 24.4009C50.9162 24.3742 50.5513 24.3172 50.166 24.2256C50.2589 24.0335 50.3518 23.8414 50.4475 23.6435C50.4939 23.7396 50.5404 23.8356 50.5882 23.9345C51.61 23.8865 52.6318 23.8385 53.6845 23.789C53.638 23.693 53.5916 23.597 53.5438 23.498C53.5902 23.402 53.6366 23.306 53.6845 23.207Z" fill="#CECCCB"/>
                          <path d="M52.1357 12.1489C52.4841 12.221 52.4841 12.221 52.8394 12.2944C52.8365 12.4565 52.8336 12.6185 52.8306 12.7855C52.8023 13.2885 52.8023 13.2885 52.9802 13.604C53.0136 13.9897 53.0398 14.3724 53.0593 14.7589C53.0653 14.8696 53.0713 14.9804 53.0774 15.0945C53.1212 15.9561 53.1371 16.8153 53.1209 17.6781C53.3067 17.7261 53.4925 17.7741 53.6839 17.8236C53.4517 17.8236 53.2194 17.8236 52.9802 17.8236C52.7525 17.4061 52.6612 17.0937 52.6454 16.6158C52.6406 16.4975 52.6358 16.3793 52.6308 16.2574C52.6271 16.135 52.6234 16.0126 52.6195 15.8865C52.5906 15.0665 52.5452 14.2689 52.4172 13.4585C52.3708 13.4585 52.3243 13.4585 52.2765 13.4585C52.23 13.0263 52.1836 12.5942 52.1357 12.1489Z" fill="#5C5C5C"/>
                          <path d="M38.7646 23.498C38.9039 23.498 39.0432 23.498 39.1868 23.498C39.1868 23.5941 39.1868 23.6901 39.1868 23.7891C39.9299 23.7891 40.673 23.7891 41.4386 23.7891C41.4386 23.8371 41.4386 23.8851 41.4386 23.9346C39.0083 24.1361 36.5793 24.0689 34.1446 24.0226C33.585 24.0122 33.0253 24.0028 32.4657 23.9934C31.3752 23.9748 30.2848 23.9551 29.1943 23.9346C29.1943 23.8385 29.1943 23.7425 29.1943 23.6436C29.3122 23.6439 29.43 23.6442 29.5514 23.6445C30.6594 23.6474 31.7674 23.6497 32.8754 23.6511C33.4451 23.6519 34.0148 23.6529 34.5845 23.6545C35.1339 23.6561 35.6832 23.657 36.2325 23.6574C36.4426 23.6576 36.6526 23.6582 36.8627 23.6589C37.1559 23.66 37.4491 23.6601 37.7423 23.6601C37.9931 23.6606 37.9931 23.6606 38.2489 23.661C38.6128 23.6877 38.6128 23.6877 38.7646 23.498Z" fill="#A8A8A8"/>
                          <path d="M29.3352 16.2231C29.6211 16.2356 29.6211 16.2356 29.9685 16.2777C30.1405 16.2974 30.1405 16.2974 30.316 16.3175C30.6018 16.3686 30.6018 16.3686 30.7426 16.5142C30.7624 16.9027 30.7486 17.2889 30.7426 17.6782C30.4985 17.7731 30.4985 17.7731 30.1796 17.8237C29.8784 17.6787 29.8784 17.6787 29.5815 17.469C29.4821 17.4002 29.3826 17.3313 29.2802 17.2604C29.2055 17.2062 29.1307 17.152 29.0537 17.0962C29.1769 16.3868 29.1769 16.3868 29.3352 16.2231Z" fill="#CBCCCC"/>
                          <path d="M28.8525 17.9595C29.0223 17.964 29.0223 17.964 29.1956 17.9686C29.1956 18.1126 29.1956 18.2567 29.1956 18.4051C29.4278 18.4531 29.66 18.5011 29.8993 18.5506C29.9872 18.8234 29.9872 18.8234 30.04 19.1326C29.9471 19.2286 29.8542 19.3247 29.7585 19.4236C29.4243 19.369 29.4243 19.369 29.0548 19.2781C28.869 19.2781 28.6833 19.2781 28.4919 19.2781C28.4454 19.2781 28.399 19.2781 28.3511 19.2781C28.3374 18.3829 28.3374 18.3829 28.3511 18.1141C28.4919 17.9686 28.4919 17.9686 28.8525 17.9595Z" fill="#C8C9C9"/>
                          <path d="M47.4912 23.4983C47.8548 23.4944 48.2183 23.4915 48.5819 23.4892C48.6846 23.488 48.7873 23.4868 48.8931 23.4855C49.3893 23.4832 49.8289 23.5051 50.306 23.6438C50.2595 23.8359 50.2131 24.0279 50.1653 24.2258C49.2828 24.1778 48.4004 24.1298 47.4912 24.0803C47.4912 23.8882 47.4912 23.6962 47.4912 23.4983Z" fill="#B8A898"/>
                          <path d="M53.6827 18.1142C53.5433 18.1142 53.404 18.1142 53.2604 18.1142C53.2739 18.2948 53.2873 18.4755 53.3011 18.6616C53.317 18.9005 53.3327 19.1394 53.3484 19.3783C53.3575 19.4971 53.3666 19.6159 53.3759 19.7384C53.4173 20.3987 53.4088 20.8542 53.1197 21.4608C53.066 21.7992 53.0177 22.1387 52.979 22.4793C52.9325 22.4793 52.8861 22.4793 52.8382 22.4793C52.8382 21.0388 52.8382 19.5984 52.8382 18.1142C53.1888 17.933 53.3183 18.0012 53.6827 18.1142ZM52.6975 22.4793C52.7439 22.4793 52.7904 22.4793 52.8382 22.4793C52.8382 22.8154 52.8382 23.1516 52.8382 23.4979C52.6989 23.4979 52.5596 23.4979 52.416 23.4979C52.5392 22.8067 52.5392 22.8067 52.6975 22.4793Z" fill="#6C6C6C"/>
                          <path d="M29.6173 11.7124C29.6173 11.8565 29.6173 12.0005 29.6173 12.1489C26.7842 12.1489 23.9512 12.1489 21.0322 12.1489C21.0322 12.0529 21.0322 11.9568 21.0322 11.8579C22.0892 11.8389 23.1463 11.8199 24.2033 11.801C24.6941 11.7922 25.1849 11.7834 25.6757 11.7746C26.2399 11.7644 26.804 11.7543 27.3682 11.7442C27.5446 11.741 27.721 11.7379 27.9027 11.7346C28.1478 11.7302 28.1478 11.7302 28.3978 11.7258C28.5419 11.7232 28.686 11.7206 28.8344 11.7179C29.0954 11.7139 29.3563 11.7124 29.6173 11.7124Z" fill="#ABABAB"/>
                          <path d="M39.3281 11.8579C42.0219 11.8579 44.7156 11.8579 47.491 11.8579C47.491 12.002 47.491 12.146 47.491 12.2944C47.3052 12.2944 47.1194 12.2944 46.928 12.2944C46.928 12.1984 46.928 12.1024 46.928 12.0034C44.4201 12.0034 41.9121 12.0034 39.3281 12.0034C39.3281 11.9554 39.3281 11.9074 39.3281 11.8579Z" fill="#B5B5B5"/>
                          <path d="M33.2764 16.2231C34.0195 16.2231 34.7626 16.2231 35.5282 16.2231C35.5746 16.7033 35.6211 17.1835 35.6689 17.6782C35.4832 17.5821 35.2974 17.4861 35.106 17.3872C35.2453 17.3872 35.3846 17.3872 35.5282 17.3872C35.5282 17.2911 35.5282 17.1951 35.5282 17.0962C35.3424 17.0962 35.1566 17.0962 34.9652 17.0962C34.8723 16.9041 34.7795 16.712 34.6838 16.5142C34.138 16.451 34.138 16.451 33.8745 16.7324C33.8165 16.8044 33.7584 16.8765 33.6986 16.9507C33.5593 16.9026 33.4199 16.8546 33.2764 16.8052C33.2764 16.6131 33.2764 16.421 33.2764 16.2231Z" fill="#DDDEDE"/>
                          <path d="M33.2765 18.5513C33.7214 18.7506 33.8384 18.8407 34.1209 19.2788C34.3531 19.2308 34.5854 19.1828 34.8246 19.1333C34.8711 18.9892 34.9175 18.8452 34.9653 18.6968C35.1976 18.7448 35.4298 18.7928 35.669 18.8423C35.6226 19.0824 35.5762 19.3224 35.5283 19.5698C34.8316 19.5698 34.135 19.5698 33.4172 19.5698C33.3243 19.3297 33.2314 19.0896 33.1357 18.8423C33.1822 18.7462 33.2286 18.6502 33.2765 18.5513Z" fill="#E0E0E0"/>
                          <path d="M35.5291 17.9688C35.5291 18.2087 35.5291 18.4489 35.5291 18.6963C35.3433 18.6963 35.1575 18.6963 34.9661 18.6963C34.9197 18.8883 34.8732 19.0803 34.8254 19.2782C34.5932 19.3262 34.3609 19.3742 34.1217 19.4237C33.9633 18.7325 33.9633 18.7326 34.1217 18.4053C34.3539 18.4053 34.5861 18.4053 34.8254 18.4053C34.8254 18.3092 34.8254 18.2132 34.8254 18.1143C35.1069 17.9688 35.1069 17.9688 35.5291 17.9688Z" fill="#9E9E9E"/>
                          <path d="M12.4479 23.4976C12.4479 23.5936 12.4479 23.6896 12.4479 23.7886C14.3521 23.7886 16.2563 23.7886 18.2182 23.7886C18.2182 23.8366 18.2182 23.8846 18.2182 23.9341C16.0354 23.9821 13.8525 24.0301 11.6035 24.0796C11.6035 23.9355 11.6035 23.7915 11.6035 23.6431C12.0257 23.4976 12.0257 23.4976 12.4479 23.4976Z" fill="#B5B5B5"/>
                          <path d="M4.98828 12.7305C5.91716 12.7305 6.84604 12.7305 7.80306 12.7305C7.80306 12.8745 7.80306 13.0186 7.80306 13.167C6.87418 13.167 5.94531 13.167 4.98828 13.167C4.98828 13.0229 4.98828 12.8789 4.98828 12.7305Z" fill="#34A853"/>
                          <path d="M30.744 18.1145C30.6975 18.5466 30.6511 18.9788 30.6032 19.424C30.3246 19.424 30.0459 19.424 29.7588 19.424C29.782 19.316 29.8052 19.208 29.8292 19.0966C29.9163 18.6689 29.9163 18.6689 29.8995 18.1145C30.181 17.969 30.181 17.969 30.744 18.1145Z" fill="#DEDEDE"/>
                          <path d="M50.7277 13.3135C50.8205 13.3615 50.9134 13.4095 51.0091 13.459C51.5509 15.3849 51.3165 17.5911 51.2906 19.5701C51.2442 19.5701 51.1977 19.5701 51.1499 19.5701C51.1446 19.4008 51.1446 19.4008 51.1392 19.228C51.1228 18.7115 51.1055 18.195 51.0883 17.6786C51.0828 17.501 51.0772 17.3233 51.0715 17.1403C51.0372 15.5402 51.0372 15.5402 50.7101 13.9864C50.6694 13.8604 50.6288 13.7343 50.5869 13.6045C50.6334 13.5085 50.6798 13.4124 50.7277 13.3135Z" fill="#B0B0B0"/>
                          <path d="M53.1211 23.3525C53.3997 23.4486 53.6784 23.5446 53.9655 23.6435C53.684 23.9346 53.684 23.9346 53.3808 23.9676C53.2584 23.9661 53.1361 23.9645 53.01 23.963C52.8776 23.962 52.7452 23.9611 52.6087 23.9601C52.4701 23.9577 52.3315 23.9553 52.1887 23.9527C52.049 23.9514 51.9093 23.9501 51.7654 23.9488C51.4197 23.9453 51.0741 23.9405 50.7285 23.9346C50.7285 23.7905 50.7285 23.6465 50.7285 23.498C50.8894 23.4997 51.0504 23.5014 51.2162 23.5032C51.426 23.5045 51.6358 23.5058 51.8456 23.5071C51.9519 23.5084 52.0581 23.5096 52.1675 23.5108C52.4385 23.5121 52.7095 23.5056 52.9803 23.498C53.0268 23.45 53.0732 23.402 53.1211 23.3525Z" fill="#B8B8B8"/>
                          <path d="M52.417 13.3125C52.4634 13.3125 52.5099 13.3125 52.5577 13.3125C52.6893 14.2964 52.7438 15.2723 52.7837 16.2641C52.7889 16.3817 52.7942 16.4993 52.7996 16.6204C52.8039 16.7258 52.8082 16.8312 52.8125 16.9397C52.8397 17.2467 52.9001 17.5266 52.9799 17.8231C52.8406 17.7751 52.7013 17.7271 52.5577 17.6776C52.5099 17.1927 52.4633 16.7076 52.417 16.2226C52.4036 16.0866 52.3901 15.9506 52.3763 15.8105C52.3017 15.0224 52.2479 14.25 52.2763 13.458C52.3227 13.41 52.3691 13.362 52.417 13.3125Z" fill="#4D4D4D"/>
                          <path d="M50.3047 11.4219C51.28 11.4939 51.28 11.4939 52.275 11.5674C52.275 11.6154 52.275 11.6634 52.275 11.7129C52.693 11.7849 52.693 11.7849 53.1195 11.8584C53.1195 11.9064 53.1195 11.9544 53.1195 12.0039C52.1906 12.0519 51.2617 12.0999 50.3047 12.1494C50.3047 11.9093 50.3047 11.6692 50.3047 11.4219Z" fill="#CCCAC9"/>
                          <path d="M39.1871 11.7129C39.1871 11.905 39.1871 12.097 39.1871 12.2949C39.1175 12.2718 39.048 12.2488 38.9764 12.225C38.4837 12.1193 37.9929 12.115 37.4916 12.1034C37.3831 12.1003 37.2745 12.0973 37.1627 12.0942C36.8171 12.0847 36.4716 12.0761 36.126 12.0676C35.8912 12.0613 35.6565 12.0549 35.4217 12.0485C34.8473 12.033 34.2728 12.0182 33.6982 12.0039C33.6982 11.9559 33.6982 11.9079 33.6982 11.8584C34.4121 11.8376 35.1259 11.8169 35.8397 11.7962C36.0826 11.7892 36.3255 11.7821 36.5683 11.7751C36.9173 11.7649 37.2663 11.7548 37.6153 11.7447C37.7239 11.7415 37.8326 11.7384 37.9445 11.7351C38.3589 11.7232 38.7725 11.7129 39.1871 11.7129Z" fill="#A2A2A2"/>
                          <path d="M53.2611 18.1143C53.4004 18.1143 53.5398 18.1143 53.6833 18.1143C53.6833 18.9305 53.6833 19.7468 53.6833 20.5878C53.5904 20.6358 53.4975 20.6839 53.4018 20.7333C53.2321 20.2068 53.2459 19.7257 53.2523 19.1783C53.2529 19.0761 53.2536 18.974 53.2542 18.8688C53.2559 18.6173 53.2584 18.3658 53.2611 18.1143Z" fill="#959595"/>
                          <path d="M34.8248 17.2412C34.8712 17.3853 34.9177 17.5293 34.9655 17.6777C35.2491 17.7844 35.2491 17.7844 35.5285 17.8232C35.2963 17.9193 35.064 18.0153 34.8248 18.1142C34.8248 18.2103 34.8248 18.3063 34.8248 18.4052C34.5926 18.4052 34.3604 18.4052 34.1211 18.4052C34.1211 18.0691 34.1211 17.733 34.1211 17.3867C34.3533 17.3387 34.5855 17.2907 34.8248 17.2412Z" fill="#E6E6E6"/>
                          <path d="M29.6175 11.8579C30.9644 11.8579 32.3113 11.8579 33.699 11.8579C33.699 11.9059 33.699 11.9539 33.699 12.0034C33.6175 12.0071 33.5361 12.0107 33.4522 12.0145C31.3205 12.1062 31.3205 12.1062 29.1953 12.2944C29.3346 12.2464 29.474 12.1984 29.6175 12.1489C29.6175 12.0529 29.6175 11.9569 29.6175 11.8579Z" fill="#B8B8B8"/>
                          <path d="M50.8682 20.4429C50.9611 20.4429 51.054 20.4429 51.1497 20.4429C51.1336 20.7703 51.1156 21.0977 51.0969 21.425C51.0822 21.6985 51.0822 21.6985 51.0672 21.9775C51.0155 22.4232 50.9531 22.6865 50.7275 23.0619C50.5582 22.1168 50.6452 21.3727 50.8682 20.4429Z" fill="#B6B6B6"/>
                          <path d="M53.2604 14.0405C53.3069 14.0405 53.3533 14.0405 53.4012 14.0405C53.4215 14.2056 53.4418 14.3706 53.4627 14.5407C53.4873 15.0311 53.4873 15.0311 53.6826 15.2046C53.6928 15.4984 53.6944 15.7926 53.6914 16.0867C53.6902 16.2474 53.6889 16.4082 53.6876 16.5738C53.686 16.6981 53.6843 16.8225 53.6826 16.9506C53.6362 16.9506 53.5898 16.9506 53.5419 16.9506C53.5419 16.6625 53.5419 16.3744 53.5419 16.0776C53.449 16.0776 53.3561 16.0776 53.2604 16.0776C53.1319 15.3543 53.1319 14.7638 53.2604 14.0405Z" fill="#A0A0A0"/>
                          <path d="M53.5431 18.4058C53.6824 18.4538 53.8217 18.5018 53.9653 18.5513C54.0172 20.2277 54.0172 20.2277 53.6838 21.0248C53.5909 21.0248 53.498 21.0248 53.4023 21.0248C53.4488 20.8808 53.4952 20.7367 53.5431 20.5883C53.553 20.214 53.5563 19.8439 53.5519 19.4698C53.5509 19.3166 53.5509 19.3166 53.55 19.1603C53.5483 18.9088 53.5458 18.6573 53.5431 18.4058Z" fill="#5E5E5E"/>
                          <path d="M28.9135 16.6602C29.0529 16.8522 29.1922 17.0443 29.3358 17.2422C29.1598 17.4604 29.1598 17.4604 28.9135 17.6787C28.7278 17.6787 28.542 17.6787 28.3506 17.6787C28.3506 17.3906 28.3506 17.1025 28.3506 16.8057C28.5364 16.7576 28.7221 16.7096 28.9135 16.6602Z" fill="#CFD0D0"/>
                          <path d="M53.4014 14.7681C53.5407 14.8161 53.68 14.8641 53.8236 14.9136C53.9824 15.6936 53.978 16.4491 53.9643 17.2416C53.825 17.2896 53.6857 17.3377 53.5421 17.3871C53.5437 17.2346 53.5454 17.0822 53.5471 16.925C53.5484 16.7244 53.5497 16.5238 53.5509 16.3231C53.5521 16.2227 53.5533 16.1223 53.5545 16.0188C53.5566 15.5613 53.5424 15.2054 53.4014 14.7681Z" fill="#5C5C5C"/>
                          <path d="M34.1212 16.3682C34.3534 16.4162 34.5856 16.4642 34.8249 16.5137C34.7785 16.7537 34.732 16.9938 34.6842 17.2412C34.4519 17.1932 34.2197 17.1452 33.9805 17.0957C34.0269 16.8556 34.0734 16.6155 34.1212 16.3682Z" fill="#7E8080"/>
                          <path d="M54.8094 11.2762C54.8094 11.3722 54.8094 11.4683 54.8094 11.5672C54.0663 11.5672 53.3232 11.5672 52.5576 11.5672C53.2656 11.2012 54.0347 10.9758 54.8094 11.2762Z" fill="#B5B5B5"/>
                          <path d="M38.7646 23.4985C38.904 23.4985 39.0434 23.4985 39.187 23.4985C39.187 23.5946 39.187 23.6906 39.187 23.7895C39.9301 23.7895 40.6732 23.7895 41.4388 23.7895C41.4388 23.8376 41.4388 23.8856 41.4388 23.935C40.1151 24.0071 40.115 24.0071 38.7646 24.0805C38.7646 23.8885 38.7646 23.6964 38.7646 23.4985Z" fill="#959595"/>
                          <path d="M52.2766 17.9688C52.3694 17.9688 52.4623 17.9688 52.558 17.9688C52.4224 19.3378 52.4224 19.3379 52.2766 20.0058C52.2301 20.0058 52.1837 20.0058 52.1358 20.0058C52.132 19.6936 52.1293 19.3813 52.127 19.069C52.1254 18.8951 52.1238 18.7214 52.1221 18.5422C52.1358 18.1143 52.1358 18.1143 52.2766 17.9688Z" fill="#3A3A3A"/>
                          <path d="M53.2607 16.0776C53.3536 16.0776 53.4465 16.0776 53.5422 16.0776C53.5887 16.6058 53.6351 17.134 53.683 17.6782C53.5436 17.6782 53.4043 17.6782 53.2607 17.6782C53.2607 17.15 53.2607 16.6218 53.2607 16.0776Z" fill="#7A7A7A"/>
                          <path d="M29.1954 18.5513C29.2883 18.5513 29.3812 18.5513 29.4769 18.5513C29.4769 18.6953 29.4769 18.8394 29.4769 18.9878C29.6162 18.9878 29.7556 18.9878 29.8991 18.9878C29.8527 19.1318 29.8062 19.2759 29.7584 19.4243C29.5262 19.3763 29.2939 19.3283 29.0547 19.2788C29.1011 19.0387 29.1476 18.7986 29.1954 18.5513Z" fill="#6A6C6B"/>
                          <path d="M28.6319 18.9873C29.0073 19.1813 29.3826 19.3753 29.7579 19.5693C29.3399 19.5693 28.9219 19.5693 28.4912 19.5693C28.4912 19.1328 28.4912 19.1328 28.6319 18.9873Z" fill="#E1E2E2"/>
                          <path d="M30.1798 17.9688C30.4585 18.0407 30.4585 18.0408 30.7428 18.1143C30.6963 18.3063 30.6499 18.4984 30.602 18.6963C30.4162 18.6483 30.2305 18.6002 30.0391 18.5508C30.0855 18.3587 30.132 18.1665 30.1798 17.9688Z" fill="#C5C5C5"/>
                          <path d="M29.1954 16.3687C29.3348 16.3687 29.4741 16.3687 29.6176 16.3687C29.6641 16.6567 29.7105 16.9448 29.7584 17.2417C29.5262 17.1937 29.2939 17.1456 29.0547 17.0962C29.1011 16.8561 29.1476 16.616 29.1954 16.3687Z" fill="#676969"/>
                          <path d="M28.4913 16.2236C28.77 16.2236 29.0487 16.2236 29.3358 16.2236C29.1598 16.5146 29.1598 16.5146 28.9135 16.8056C28.7278 16.8056 28.542 16.8056 28.3506 16.8056C28.397 16.6136 28.4435 16.4215 28.4913 16.2236Z" fill="#E1E2E2"/>
                          <path d="M47.4902 23.4985C47.7225 23.4985 47.9547 23.4985 48.1939 23.4985C48.1939 23.6906 48.1939 23.8827 48.1939 24.0805C47.9617 24.0805 47.7295 24.0805 47.4902 24.0805C47.4902 23.8885 47.4902 23.6964 47.4902 23.4985Z" fill="#5F5F5F"/>
                          <path d="M47.4912 11.7119C47.7234 11.7119 47.9556 11.7119 48.1949 11.7119C48.1949 11.904 48.1949 12.096 48.1949 12.2939C47.9627 12.2939 47.7305 12.2939 47.4912 12.2939C47.4912 12.1019 47.4912 11.9098 47.4912 11.7119Z" fill="#5E5E5E"/>
                          <path d="M3.86167 11.8579C3.95456 12.002 4.04745 12.146 4.14315 12.2944C3.94963 12.6582 3.94963 12.6582 3.72093 13.0219C3.62804 13.0219 3.53516 13.0219 3.43945 13.0219C3.54501 12.1853 3.54501 12.1853 3.86167 11.8579Z" fill="#BEBEBE"/>
                          <path d="M53.6837 23.207C53.7302 23.3031 53.7766 23.3991 53.8244 23.498C54.1031 23.498 54.3818 23.498 54.6689 23.498C54.7153 23.6421 54.7618 23.7861 54.8096 23.9345C54.1826 23.7905 54.1826 23.7905 53.543 23.6435C53.5894 23.4995 53.6359 23.3554 53.6837 23.207Z" fill="#C9C9C9"/>
                          <path d="M12.4479 23.4976C12.3551 23.6896 12.2622 23.8817 12.1665 24.0796C11.9807 24.0796 11.7949 24.0796 11.6035 24.0796C11.6035 23.9355 11.6035 23.7915 11.6035 23.6431C12.0257 23.4976 12.0257 23.4976 12.4479 23.4976Z" fill="#7E7E7E"/>
                          <path d="M4.00316 12.2944C4.09605 12.2944 4.18893 12.2944 4.28464 12.2944C4.28464 12.5345 4.28464 12.7746 4.28464 13.022C4.09886 13.022 3.91308 13.022 3.72168 13.022C3.84483 12.4581 3.84483 12.4581 4.00316 12.2944Z" fill="#E4E4E4"/>
                        </g>
                      </svg>

                      <div style={{
                  height : 6,
                  width : 100,
                  borderRadius : 8,
                  backgroundColor : 'rgba(0,0,0,0.2)'
                }}></div>

              </div>
              <div style={{
                    display : 'flex',
                    flexDirection : 'column',
                    alignItems : "center"
                }} >
                <div style={{
                    display : 'flex',
                    flexDirection : 'column',
                    alignItems : "center",
                    // whiteSpace: 'nowrap',
                }}>
                  <p style={{
                    fontWeight : '500',
                    fontSize : 13,
                    textAlign : 'center' 
                  }}> {closestStopName  ?? 'Loading...'}</p>
                  <p style={{
                    fontSize : 11,
                    color : 'rgba(0,0,0,0.5)',
                    padding : 2,
                    borderRadius : 4,
                    backgroundColor : '#fafafa',
                  }}>Arrriving</p>
                </div>
                <div style={{
                    display : 'flex',
                    alignItems : "center",
                    gap : 4,
                    // padding : 4,
                    borderRadius : 6,
                    // backgroundColor : '#fafafa'
                }}>
                  {/* <p style={{
                    fontSize : 12,
                    color : 'rgba(0,0,0,0.5)'
                  }}>Arriv</p> */}
                  <p style={{
                    fontSize : 12,
                    //  color : 'rgba(0,0,0,0.5)'
                  }}>8:45 AM</p>
                </div>
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
                    gap : 4
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

                  <div style={{
                    display : 'flex',
                    flexDirection : 'column',
                    gap : 2,
                    alignItems : 'center',
                    width :'auto'
                  }}>
                       <p style={{
                    margin : 0,
                    fontSize : 12,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}>{dropPoint.name}</p>
                     <p style={{
                    fontSize : 11,
                    color : 'rgba(0,0,0,0.5)'
                  }}>8:31 AM</p>

                  </div>
               
                  

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
                    }}>7:32</p> 
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