import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapPicker = ({ location, onChange }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Default to a central location (e.g., somewhere central if no geolocation)
  const defaultCenter = { lat: 0, lng: 0 }; 
  const defaultZoom = 2; // global view as default

  const initMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
        setError("Google Maps API is not loaded.");
        return;
    }

    const initialCenter = location || defaultCenter;
    const initialZoom = location ? 15 : defaultZoom;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(mapInstance);

    let markerInstance = null;
    if (location) {
        markerInstance = new window.google.maps.Marker({
            position: location,
            map: mapInstance,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
        });
        setMarker(markerInstance);
    }

    // Add click listener to place/move marker
    mapInstance.addListener('click', (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        };

        if (markerInstance) {
            markerInstance.setPosition(newPos);
        } else {
            markerInstance = new window.google.maps.Marker({
                position: newPos,
                map: mapInstance,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
            });
            setMarker(markerInstance);
        }
        
        // Listen for drag end
        window.google.maps.event.clearListeners(markerInstance, 'dragend');
        markerInstance.addListener('dragend', () => {
            const dragPos = markerInstance.getPosition();
            onChange({
                lat: dragPos.lat(),
                lng: dragPos.lng()
            });
        });

        onChange(newPos);
    });

    // If marker is already there, make sure drag works
    if (markerInstance) {
       markerInstance.addListener('dragend', () => {
            const dragPos = markerInstance.getPosition();
            onChange({
                lat: dragPos.lat(),
                lng: dragPos.lng()
            });
        });
    }

    // Auto-center to user's location if no initial location is provided
    if (!location && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                mapInstance.setCenter(pos);
                mapInstance.setZoom(15);
            },
            (err) => {
                console.log("Geolocation permission denied or timeout, defaulting to world view.", err);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }

  }, [location, onChange]);

  useEffect(() => {
      // Dynamic script loading for Google Maps API if it doesn't exist
      // In a real production app, ideally you'd load this once in index.html
      // Note: Needs a valid API key to work. Assuming the environment might not have one hardcoded everywhere,
      // using a placeholder approach or assuming the script is already loaded by the platform if available.
      // For this implementation, we will try to load it if missing, but it might fail without key.
      
      const loadGoogleMapsScript = () => {
         if (window.google && window.google.maps) {
             initMap();
             return;
         }

         const existingScript = document.getElementById('google-maps-script');
         if (existingScript) {
             // Already loading, just wait
             existingScript.addEventListener('load', initMap);
             return;
         }

         setIsLoading(true);
         const script = document.createElement('script');
         script.id = 'google-maps-script';
         // WARNING: In real usage, you MUST provide a valid API key here.
         // Using a dummy param to avoid raw component failure, but map will show "development purposes only".
         script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBwOafCIS90-1CBH27AOUV2XIhuhxUEx7E&libraries=places`; 
         script.async = true;
         script.defer = true;
         
         script.onload = () => {
             setIsLoading(false);
             initMap();
         };
         
         script.onerror = () => {
             setIsLoading(false);
             setError("Failed to load Google Maps script. Please check your connection or API key.");
         };

         document.head.appendChild(script);
      };

      loadGoogleMapsScript();

      // Cleanup listeners if component unmounts
      return () => {
         if (marker) {
             window.google.maps.event.clearInstanceListeners(marker);
         }
         if (map) {
             window.google.maps.event.clearInstanceListeners(map);
         }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleGetCurrentLocation = () => {
      setIsLoading(true);
      setError(null);
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                  };
                  
                  if (map) {
                      map.setCenter(pos);
                      map.setZoom(15);
                      
                      if (marker) {
                          marker.setPosition(pos);
                      } else {
                          const newMarker = new window.google.maps.Marker({
                              position: pos,
                              map: map,
                              draggable: true,
                              animation: window.google.maps.Animation.DROP,
                          });
                          
                          newMarker.addListener('dragend', () => {
                              const dragPos = newMarker.getPosition();
                              onChange({
                                  lat: dragPos.lat(),
                                  lng: dragPos.lng()
                              });
                          });
                          setMarker(newMarker);
                      }
                  }
                  
                  onChange(pos);
                  setIsLoading(false);
              },
              (err) => {
                  console.error("Error getting location: ", err);
                  setError("Unable to retrieve your location.");
                  setIsLoading(false);
              },
              { enableHighAccuracy: true, timeout: 5000 }
          );
      } else {
          setError("Geolocation is not supported by your browser.");
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center">
         <span className="text-sm font-medium text-muted-foreground">Select Location on Map</span>
         <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className="flex items-center gap-1"
         >
             {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
             Use Current Location
         </Button>
      </div>
      
      {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
          </div>
      )}
      
      <div className="w-full h-64 rounded-md border border-input bg-muted overflow-hidden relative">
          <div ref={mapRef} className="w-full h-full" />
          {!map && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
          )}
      </div>
      
      {location && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded grid grid-cols-2 gap-2 text-center">
              <div><strong>Lat:</strong> {location.lat.toFixed(6)}</div>
              <div><strong>Lng:</strong> {location.lng.toFixed(6)}</div>
          </div>
      )}
    </div>
  );
};

export default MapPicker;
