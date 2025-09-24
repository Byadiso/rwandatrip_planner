// functions/index.js
const functions = require("firebase-functions");
const fetch = require("node-fetch"); // npm install node-fetch@2

exports.geocodeLocation = functions.https.onRequest(async (req, res) => {
  // ✅ Always set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    // Call Nominatim server-side to bypass browser CORS
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "TripPlannerApp/1.0 (byadiso@gmail.com)" },
    });

    if (!response.ok) {
      throw new Error(`Nominatim responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error("Geocoding error:", err);

    // Optional: fallback to Heroku proxy if Nominatim fails
    try {
      const corsProxy = "https://cors-anywhere.herokuapp.com/";
      const herokuUrl = `${corsProxy}https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`;
      const fallbackRes = await fetch(herokuUrl, {
        headers: { "User-Agent": "TripPlannerApp/1.0 (byadiso@gmail.com)" },
      });
      const fallbackData = await fallbackRes.json();
      return res.json(fallbackData);
    } catch (fallbackErr) {
      console.error("Heroku fallback error:", fallbackErr);
      return res.status(500).json({ error: "Failed to fetch geocode from Nominatim" });
    }
  }
});
