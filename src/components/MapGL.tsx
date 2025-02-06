import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl, Marker, FlyToInterpolator  } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
// import { SearchBox } from '@mapbox/search-js-react';



const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGhlbG9jYWxnb2RkIiwiYSI6ImNtMm9ocHFhYTBmczQya3NnczhoampiZ3gifQ.lPNutwk6XRi_kH_1R1ebiw';



function MapGL({ selectedLocation  }) {
  const [viewState, setViewState] = useState({
    longitude: -1.573568,
    latitude: 6.678045,
    zoom: 13.85,
    // transitionDuration: 3000, 
    // transitionInterpolator: new FlyToInterpolator(),
  });

  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (selectedLocation) {
      setViewState((prevState) => ({
        ... prevState,
        longitude : selectedLocation.longitude,
        latitude : selectedLocation.latitude,
      }))
      setMarkers([{longitude: selectedLocation.longitude, latitude : selectedLocation.latitude}])
      console.log(selectedLocation)
    }
  }, [selectedLocation] )

  return (

    <>

{/* 
     <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <SearchBox
          accessToken={MAPBOX_ACCESS_TOKEN}
          onSelect={(result) => {
            const { coordinates } = result.geometry;
            setMarkers([{ longitude: coordinates[0], latitude: coordinates[1] }]);
            setViewState((prevState) => ({
              ...prevState,
              longitude: coordinates[0],
              latitude: coordinates[1],
            }));
          }}
        />

    </div> */}

    <Map
      mapboxAccessToken="pk.eyJ1IjoidGhlbG9jYWxnb2RkIiwiYSI6ImNtMm9ocHFhYTBmczQya3NnczhoampiZ3gifQ.lPNutwk6XRi_kH_1R1ebiw"
      {...viewState}
      style={{ width: '100vw', height: '100vh', position: 'fixed', right: 0 }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onMove={(evt) => setViewState(evt.viewState)}
    >
     
          { markers.map ((marker, index) => (
              <Marker
              key = {index}
              longitude = {marker.longitude}
              latitude = {marker.latitude}
              >
                  <img
              src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
              alt="Marker"
              style={{ width: 24, height: 24 }}
            />
                  
              </Marker>
          ))}

    </Map>
    </>


  );
}

export default MapGL;
