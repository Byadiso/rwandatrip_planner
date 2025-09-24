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

// --- Icon cache ---
const dayIconCache = new Map();
function createDayIcon(label, variant) {
  const key = `${label}|${variant}`;
  if (dayIconCache.has(key)) return dayIconCache.get(key);

  const number = label; // Use full day label
  const bgColor = variant === "current" ? "#1f2937" : "#fb923c";

  const html = `
    <div aria-label="${label}" style="
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      font-family: system-ui,Roboto,Arial,sans-serif;
    ">
      <div style="
        background: ${bgColor};
        color: white;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        white-space: nowrap;
      ">
        ${number}
      </div>
    </div>
  `;

  const icon = new L.DivIcon({
    html,
    className: "",
    iconAnchor: [15, 45],
    popupAnchor: [0, -50],
  });

  dayIconCache.set(key, icon);
  return icon;
}

// --- Geocode helper using CORS proxy ---
async function geocodeLocation(name) {
  const url = `https://cors-anywhere.herokuapp.com/https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    name
  )}`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TripPlannerApp/1.0 (byadiso@gmail.com)",
      },
    });
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
}

// --- Subcomponents ---
function TabBar({ active, setActive, onHome, onTrip }) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              aria-hidden="true"
              className="h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
            >
              M
            </div>
            <span className="font-semibold text-gray-800">MAP</span>
          </div>
          <div className="flex gap-6">
            {[
              { key: "mytrip", label: "My Trip" },
              { key: "map", label: "Map" },
              { key: "download", label: "Download" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`relative pb-2 text-sm font-medium ${
                  active === key ? "text-gray-900" : "text-gray-500"
                }`}
                aria-current={active === key ? "page" : undefined}
                type="button"
              >
                {label}
                {active === key && (
                  <span className="absolute left-0 right-0 bottom-0 h-1 bg-orange-500 rounded-t-md" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center mt-2 sm:mt-0">
          <button
            onClick={onHome}
            className="text-sm text-orange-600 hover:underline"
            type="button"
          >
            Home
          </button>
          <button
            onClick={onTrip}
            className="text-sm text-orange-600 hover:underline"
            type="button"
          >
            Trip
          </button>
        </div>
      </div>
    </div>
  );
}

function DayMarker({ position, label, description }) {
  const icon = useMemo(() => createDayIcon(label, "primary"), [label]);
  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="space-y-1">
          <div className="font-semibold">{label}</div>
          {description && (
            <div className="text-xs text-gray-600">{description}</div>
          )}
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
      const bounds = L.latLngBounds(markers.map((m) => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  return null;
}

// --- Main MapPage Component ---
export default function MapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const tripsSnap = await getDocs(collection(db, "trips"));
        if (tripsSnap.empty) return;

        const allMarkers = [];

        for (const tripDoc of tripsSnap.docs) {
          const tripId = tripDoc.id;
          const daysSnap = await getDocs(collection(db, `trips/${tripId}/days`));

          for (const dayDoc of daysSnap.docs) {
            const dayData = dayDoc.data();
            const dayLabel = dayData.dayNumber
              ? `Day ${dayData.dayNumber}`
              : dayData.date || "Day";

            if (!dayData.activities || dayData.activities.length === 0) continue;

            for (const act of dayData.activities) {
              if (act.location) {
                const coords = await geocodeLocation(act.location);
                if (coords) {
                  allMarkers.push({
                    position: coords,
                    label: dayLabel,
                    description: `${act.title || "Activity"} @ ${act.location}`,
                  });
                  setMarkers([...allMarkers]);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading activities:", err);
      }
    }

    loadData();
  }, []);

  const handleDownload = useCallback(() => {
    console.log("Download Offline Area");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TabBar
        active={activeTab}
        setActive={setActiveTab}
        onHome={() => navigate("/")}
        onTrip={() => navigate("/trip")}
      />
      <main className="flex-1 relative">
        <div className="h-[70vh] w-full">
          <MapContainer
            center={[-1.9441, 30.0619]}
            zoom={12}
            className="h-full w-full z-0"
            zoomControl={false}
          >
            <ZoomControl position="topright" />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markers.map((m, i) => (
              <DayMarker
                key={i}
                position={m.position}
                label={m.label}
                description={m.description}
              />
            ))}
            <FitBounds markers={markers} />
          </MapContainer>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md">
          <button
            onClick={handleDownload}
            className="w-full bg-yellow-100 text-gray-800 font-medium py-3 rounded-lg shadow-inner flex items-center justify-center gap-2"
            aria-label="Download offline area"
            type="button"
          >
            Download Offline Area
          </button>
        </div>
      </main>
    </div>
  );
}
