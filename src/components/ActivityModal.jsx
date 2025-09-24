import { useState, useEffect } from "react";

export default function ActivityModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Initialize modal fields
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setLocation(initialData.location || "");
      setCoords(initialData.coords || null);
      setTime(initialData.time || "");
      setCategory(initialData.category || "");
    } else {
      setTitle("");
      setLocation("");
      setCoords(null);
      setTime("");
      setCategory("");
    }
    setSearchResults([]);
  }, [initialData, isOpen]);

  // --- Search using Nominatim OpenStreetMap API ---
  const handleSearch = (query) => {
    setLocation(query);
    setCoords(null);

    if (typingTimeout) clearTimeout(typingTimeout);

    if (!query) {
      setSearchResults([]);
      return;
    }

    setTypingTimeout(
      setTimeout(async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5`;

          const res = await fetch(url, {
            headers: {
              "Accept": "application/json",
            },
          });
          const data = await res.json();

          setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Error fetching geocode:", err);
          setSearchResults([]);
        }
      }, 300)
    );
  };

  const handleSelect = (result) => {
    setLocation(result.display_name);
    setCoords({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setSearchResults([]);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!location.trim() || !coords) {
      alert("Please select a location from search results");
      return;
    }

    onSave({
      title: title.trim(),
      location: location.trim(),
      coords,
      time,
      category,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-bold mb-4">{initialData ? "Edit Activity" : "Add Activity"}</h2>

        <div className="space-y-3 relative">
          <input
            type="text"
            placeholder="Activity Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Location (city / place)"
            value={location}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          {searchResults.length > 0 && (
            <ul className="border rounded max-h-40 overflow-auto bg-white z-50 absolute w-full mt-1 shadow">
              {searchResults.map((res, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(res)}
                  className="px-2 py-1 hover:bg-orange-100 cursor-pointer"
                >
                  {res.display_name}
                </li>
              ))}
            </ul>
          )}

          {coords && (
            <p className="text-xs text-gray-500">
              Selected Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            <option value="Culture">Culture</option>
            <option value="Food">Food</option>
            <option value="Adventure">Adventure</option>
            <option value="Nature">Nature</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
