// ============================================
// STEP 1: Create hooks/useMQTTBuses.ts
// ============================================
import { useState, useEffect } from 'react';

interface MQTTDevice {
  deviceId: string;
  position: {
    latitude: number;
    longitude: number;
    course: number;
    speed: number;
    valid: boolean;
    serverTime: string;
  };
}

interface MQTTDeviceMap {
  [deviceId: string]: MQTTDevice;
}

export default function useMQTTBuses() {
  const [devices, setDevices] = useState<MQTTDeviceMap>({});
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const updateDevice = (deviceData: any) => {
    // Extract device ID from various possible fields
    const deviceId = 
      deviceData.deviceId || 
      deviceData.device?.id || 
      deviceData.device?.uniqueId ||
      deviceData.uniqueId ||
      `device-${Date.now()}`;
    
    // Extract position data
    const lat = deviceData.position?.latitude;
    const lng = deviceData.position?.longitude;
    
    // Skip if coordinates are invalid
    if (!lat || !lng || lat === 0 || lng === 0) {
      console.log('⚠️ Skipping invalid coordinates for device:', deviceId);
      return;
    }
    
    console.log('✅ Updating device:', deviceId, { lat, lng });
    
    setDevices(prev => {
      const newDevices = {
        ...prev,
        [deviceId]: {
          deviceId,
          position: {
            latitude: lat,
            longitude: lng,
            course: deviceData.position?.course || 0,
            speed: deviceData.position?.speed || 0,
            valid: deviceData.position?.valid !== false,
            serverTime: deviceData.position?.serverTime || new Date().toISOString()
          }
        }
      };
      
      console.log('📊 Total devices:', Object.keys(newDevices).length, Object.keys(newDevices));
      return newDevices;
    });
  };

  // Remove stale devices after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDevices(prev => {
        const filtered: MQTTDeviceMap = {};
        Object.entries(prev).forEach(([id, device]) => {
          const lastUpdate = new Date(device.position.serverTime).getTime();
          if (now - lastUpdate < 5 * 60 * 1000) {
            filtered[id] = device;
          } else {
            console.log('🗑️ Removing stale device:', id);
          }
        });
        return filtered;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    devices,
    updateDevice,
    selectedDeviceId,
    setSelectedDeviceId
  };
}

