import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase";

// --- Fix default Leaflet icons ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- Icon cache and color palette ---
const dayIconCache = new Map();
const dayColors = [
  "#fb923c", "#22c55e", "#3b82f6",
  "#ef4444", "#8b5cf6", "#facc15", "#06b6d4"
];

function getDayColor(label) {
  const match = label.match(/\d+/);
  const dayNumber = match ? parseInt(match[0], 10) : 0;
  return dayColors[dayNumber % dayColors.length];
}

function createDayIcon(label) {
  if (dayIconCache.has(label)) return dayIconCache.get(label);

  const bgColor = getDayColor(label);
  const html = `
    <div aria-label="${label}" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: system-ui,Roboto,Arial,sans-serif;
    ">
      <div style="
        background: ${bgColor};
        color: white;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        white-space: nowrap;
        margin-bottom: 4px;
      ">
        ${label}
      </div>
      <div style="
        width: 10px;
        height: 10px;
        background: ${bgColor};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 2px rgba(0,0,0,0.4);
      "></div>
    </div>
  `;

  const icon = new L.DivIcon({ html, className: "", iconAnchor: [10, 15], popupAnchor: [0, -40] });
  dayIconCache.set(label, icon);
  return icon;
}

// --- Subcomponents ---
function TabBar({ active, setActive, onHome, onTrip }) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div aria-hidden="true" className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
            <span className="font-semibold text-gray-800">MAP</span>
          </div>
          <div className="flex gap-6">
            {["mytrip","map","download"].map(key => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`relative pb-2 text-sm font-medium ${active===key ? "text-gray-900":"text-gray-500"}`}
                aria-current={active===key ? "page":undefined}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {active===key && <span className="absolute left-0 right-0 bottom-0 h-1 bg-orange-500 rounded-t-md" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center mt-2 sm:mt-0">
          <button onClick={onHome} className="text-sm text-orange-600 hover:underline">Home</button>
          <button onClick={onTrip} className="text-sm text-orange-600 hover:underline">Trip</button>
        </div>
      </div>
    </div>
  );
}

function DayMarker({ position, label, description }) {
  const icon = useMemo(() => createDayIcon(label), [label]);
  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="space-y-1">
          <div className="font-semibold">{label}</div>
          {description && <div className="text-xs text-gray-600">{description}</div>}
        </div>
      </Popup>
    </Marker>
  );
}

// --- Fit map to markers ---
function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
}

// --- Route Layer ---
function RouteLayer({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (!routes || routes.length === 0) return;
    const layers = routes.map(route =>
      L.Routing.control({
        waypoints: route,
        lineOptions: { styles: [{ color: "#3b82f6", weight: 4 }] },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
      }).addTo(map)
    );
    return () => layers.forEach(layer => map.removeControl(layer));
  }, [routes, map]);
  return null;
}

// --- Main MapPage Component ---
export default function MapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const tripsSnap = await getDocs(collection(db, "trips"));
        if (tripsSnap.empty) return;

        const allMarkers = [];
        const allRoutes = [];

        for (const tripDoc of tripsSnap.docs) {
          const tripId = tripDoc.id;
          const daysSnap = await getDocs(collection(db, `trips/${tripId}/days`));

          for (const dayDoc of daysSnap.docs) {
            const dayData = dayDoc.data();
            const dayLabel = dayData.dayNumber ? `Day ${dayData.dayNumber}` : dayData.date || "Day";
            if (!dayData.activities || dayData.activities.length === 0) continue;

            const dayMarkers = dayData.activities
              .filter(a => a.coords)
              .map(a => ({
                position: a.coords, // must already exist in your DB
                label: dayLabel,
                description: `${a.title || "Activity"} @ ${a.location}`
              }));

            allMarkers.push(...dayMarkers);

            for (let i = 0; i < dayMarkers.length - 1; i++) {
              allRoutes.push([L.latLng(dayMarkers[i].position), L.latLng(dayMarkers[i + 1].position)]);
            }
          }
        }

        setMarkers(allMarkers);
        setRoutes(allRoutes);
      } catch (err) {
        console.error("Error loading activities:", err);
      }
    }

    loadData();
  }, []);

  const handleDownload = useCallback(() => console.log("Download Offline Area"), []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TabBar active={activeTab} setActive={setActiveTab} onHome={() => navigate("/")} onTrip={() => navigate("/trip")} />
      <main className="flex-1 relative">
        <div className="h-[70vh] w-full">
          <MapContainer center={[-1.9441, 30.0619]} zoom={12} className="h-full w-full z-0" zoomControl={false}>
            <ZoomControl position="topright" />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markers.map((m,i) => <DayMarker key={i} position={m.position} label={m.label} description={m.description} />)}
            <RouteLayer routes={routes} />
            <FitBounds markers={markers} />
          </MapContainer>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md">
          <button onClick={handleDownload} className="w-full bg-yellow-100 text-gray-800 font-medium py-3 rounded-lg shadow-inner flex items-center justify-center gap-2" type="button">
            Download Offline Area
          </button>
        </div>
      </main>
    </div>
  );
}
