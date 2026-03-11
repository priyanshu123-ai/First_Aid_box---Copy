import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Important

const MapRefresher = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
};

const LiveMap = ({ location }) => {
  if (!location) return null;

  const position = [location.lat, location.lng];

  // ✅ Green location marker
  const markerIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // you can swap with a green marker PNG
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    className: "leaflet-green-marker", // custom class if you want to style further
  });

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={position}
        zoom={18}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={position} icon={markerIcon}>
          <Popup>You are here</Popup>
        </Marker>
        <MapRefresher />
      </MapContainer>
    </div>
  );
};

export default LiveMap;
