const functions = require("firebase-functions");
const fetch = require("node-fetch"); // make sure to npm install node-fetch@2
const cors = require("cors")({ origin: true }); // allow CORS

exports.geocodeLocation = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    try {
      // Call OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "TripPlannerApp/1.0 (youremail@example.com)",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim responded with status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Geocoding error:", err);
      res.status(500).json({ error: "Failed to fetch geocode from Nominatim" });
    }
  });
});
