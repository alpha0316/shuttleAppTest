import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const GpsTracker = () => {
  const [gpsData, setGpsData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    // --- INPUT YOUR DETAILS HERE ---
    const brokerUrl = '15.188.83.126:8080'; // Note: ws:// not mqtt://
    const options = {
      username: 'admin',
      password: 'lEUmas@12',
      clean: true,
      reconnectPeriod: 1000, // Try to reconnect every second if lost
    };

    // 1. Connect to the Broker
    console.log('Connecting to MQTT...');
    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Connected to Mosquitto!');
      
      // 2. Subscribe to the Topic (The Endpoint)
      // This MUST match the 'forward.topic' in traccar.xml
      client.subscribe('traccar/positions', (err) => {
        if (!err) {
          console.log('Subscribed to traccar/positions');
        }
      });
    });

    // 3. Receive Message
    client.on('message', (topic, message) => {
      // The message comes as a Buffer, convert to string then JSON
      const payload = message.toString();
      console.log('Received data:', payload);
      
      try {
        const data = JSON.parse(payload);
        setGpsData(data);
      } catch (error) {
        console.error("Error parsing JSON", error);
      }
    });

    return () => {
      if (client) client.end(); // Cleanup on unmount
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Live GPS Tracker</h2>
      <p>Status: <strong>{connectionStatus}</strong></p>

      {gpsData ? (
        <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <h3>Device ID: {gpsData.deviceId}</h3>
          <p><strong>Latitude:</strong> {gpsData.latitude}</p>
          <p><strong>Longitude:</strong> {gpsData.longitude}</p>
          <p><strong>Speed:</strong> {gpsData.speed} knots</p>
        </div>
      ) : (
        <p>Waiting for GPS data...</p>
      )}
    </div>
  );
};

export default GpsTracker;