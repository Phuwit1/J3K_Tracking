// app/track/[trackingCode]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

export default function TrackingMap() {
  const params = useParams();
  const router = useRouter();
  const trackingCode = params.trackingCode;
  
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parcelData, setParcelData] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  
  const PARCEL_SERVICE_URL = process.env.NEXT_PUBLIC_PARCEL_SERVICE_URL || 'http://localhost:3001';
  
  // ฟังก์ชันสำหรับดึงข้อมูลพัสดุ
  const fetchParcelData = async (trackingCode) => {
    try {
      const response = await fetch(`${PARCEL_SERVICE_URL}/parcel?trackingCode=${trackingCode}`);
      if (!response.ok) {
        throw new Error('ไม่พบข้อมูลพัสดุ');
      }
      const data = await response.json();
      setParcelData(data);
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };
  
  // ฟังก์ชันสำหรับแปลงที่อยู่เป็นพิกัด
  const geocodeAddress = async (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        } else {
          reject(new Error('ไม่สามารถแปลงที่อยู่เป็นพิกัดได้'));
        }
      });
    });
  };
  
  // ฟังก์ชันจำลองการรับตำแหน่งของ rider (ในระบบจริงควรใช้ API หรือ WebSocket)
  const fetchRiderLocation = async () => {
    // สมมติว่ามีการเรียก API เพื่อรับตำแหน่งปัจจุบันของ rider
    // ในตัวอย่างนี้เราจะสุ่มตำแหน่งใกล้ๆ กับปลายทาง
    try {
      if (parcelData && parcelData.recipientCoordinates) {
        const { lat, lng } = parcelData.recipientCoordinates;
        // สุ่มตำแหน่งห่างจากปลายทางไม่เกิน 2 กิโลเมตร
        const offset = 0.02; // ประมาณ 2 กิโลเมตร
        const riderLat = lat + (Math.random() - 0.5) * offset;
        const riderLng = lng + (Math.random() - 0.5) * offset;
        return { lat: riderLat, lng: riderLng };
      }
      return null;
    } catch (error) {
      console.error('Error fetching rider location:', error);
      return null;
    }
  };
  
  // ฟังก์ชันสำหรับรับตำแหน่งปัจจุบันของผู้ใช้ (อาจใช้เพื่อดูว่าอยู่ใกล้ rider หรือไม่)
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };
  
  // ฟังก์ชันสำหรับเริ่มต้น Google Map
  const initializeMap = async () => {
    try {
      if (!trackingCode) return;
      
      setLoading(true);
      const data = await fetchParcelData(trackingCode);
      
      if (!data) {
        setLoading(false);
        return;
      }
      if (!data.recipientCoordinates || !data.recipientCoordinates.lat || !data.recipientCoordinates.lng) {
        setError('พิกัดปลายทางไม่ถูกต้อง');
        return;
      }

      // ถ้า API ไม่ได้ส่งพิกัดมาโดยตรง จะต้องแปลงที่อยู่เป็นพิกัด
      if (!data.recipientCoordinates && data.recipientAddress) {
        try {
          const coordinates = await geocodeAddress(data.recipientAddress);
          data.recipientCoordinates = coordinates;
          setParcelData({ ...data, recipientCoordinates: coordinates });
        } catch (error) {
          setError('ไม่สามารถแปลงที่อยู่ปลายทางเป็นพิกัดได้');
          setLoading(false);
          return;
        }
      }
      
      // รับตำแหน่งปัจจุบันของ rider
      const riderPos = await fetchRiderLocation();
      setRiderLocation(riderPos);
      
      // สร้าง Google Map
      const destination = data.recipientCoordinates;
      const mapInstance = new google.maps.Map(document.getElementById('map'), {
        center: { lat: data.recipientCoordinates.lat, lng: data.recipientCoordinates.lng },
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      
      // เพิ่ม marker สำหรับปลายทาง
      const destinationMarker = new google.maps.Marker({
        position: destination,
        map: mapInstance,
        title: 'ปลายทาง',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });
      
      // เพิ่ม marker สำหรับตำแหน่ง rider
      if (riderPos) {
        const riderMarker = new google.maps.Marker({
          position: riderPos,
          map: mapInstance,
          title: 'ตำแหน่ง Rider',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });
        
        // วาดเส้นทางระหว่าง rider กับปลายทาง
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#0088FF',
            strokeWeight: 4,
          },
        });
        
        directionsService.route(
          {
            origin: riderPos,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
              
              // คำนวณเวลาโดยประมาณ
              const route = response.routes[0];
              if (route && route.legs[0]) {
                const duration = route.legs[0].duration.text;
                const distance = route.legs[0].distance.text;
                
                // แสดงข้อมูลเวลาและระยะทาง
                const infoDiv = document.getElementById('route-info');
                if (infoDiv) {
                  infoDiv.innerHTML = `
                    <p><strong>ระยะทาง:</strong> ${distance}</p>
                    <p><strong>เวลาโดยประมาณ:</strong> ${duration}</p>
                  `;
                }
              }
            } else {
              console.error('Directions request failed due to ' + status);
            }
          }
        );
      }
      
      // จำกัดบริเวณแผนที่ให้เห็นทั้ง rider และปลายทาง
      if (riderPos) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
        bounds.extend(new google.maps.LatLng(riderPos.lat, riderPos.lng));
        mapInstance.fitBounds(bounds);
      }
      
      setMap(mapInstance);
      setLoading(false);
      
      // อัพเดตตำแหน่ง rider ทุก 30 วินาที
      const interval = setInterval(async () => {
        const newRiderPos = await fetchRiderLocation();
        if (newRiderPos) {
          setRiderLocation(newRiderPos);
          
          // อัพเดต marker และเส้นทาง
          // (ในระบบจริงควรปรับปรุงให้มีประสิทธิภาพมากขึ้น)
          initializeMap();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('เกิดข้อผิดพลาดในการแสดงแผนที่');
      setLoading(false);
    }
  };
  
  // โหลด Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      const googleMapScript = document.createElement('script');
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      googleMapScript.async = true;
      googleMapScript.defer = true;
      googleMapScript.addEventListener('load', initializeMap);
      document.body.appendChild(googleMapScript);
      
      return () => {
        document.body.removeChild(googleMapScript);
      };
    };
    
    if (trackingCode) {
      loadGoogleMaps();
    }
  }, [trackingCode]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">กำลังโหลด...</h2>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-red-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.push('/')}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">ติดตามพัสดุ: {trackingCode}</h1>
        {parcelData && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>ที่อยู่ปลายทาง:</strong> {parcelData.recipientAddress}</p>
            <p><strong>ผู้รับ:</strong> {parcelData.recipientName}</p>
            <p><strong>สถานะ:</strong> <span className="text-green-600 font-semibold">กำลังจัดส่ง</span></p>
          </div>
        )}
      </div>
      
      <div id="route-info" className="mb-4 p-4 bg-blue-50 rounded-lg"></div>
      
      <div 
        id="map" 
        className="w-full h-96 rounded-lg shadow-lg mb-6"
        style={{ minHeight: '400px' }}
      ></div>
      
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span>ตำแหน่ง Rider</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>ปลายทาง</span>
        </div>
      </div>
    </div>
  );
}