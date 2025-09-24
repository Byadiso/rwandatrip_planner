# Rwanda Trip Planner – Activity Modal Component

A **React-based interactive activity planner** component for travelers visiting Rwanda. This project allows users to add, edit, and save activities with **location search, geocoding, time, and category selection**, all directly in the browser without a backend server.

The location search uses **OpenStreetMap’s Nominatim API**, avoiding CORS issues and making it fully client-side.

---


## Features

* **Add/Edit Activities** – Users can input an activity title, location, time, and category.
* **Location Search with Autocomplete** – Real-time location suggestions powered by **Nominatim OpenStreetMap API**.
* **Coordinates Display** – Selected location coordinates are displayed for reference.
* **Debounced Search** – Optimized search with a 300ms debounce to reduce API calls.
* **Category Selector** – Choose activity type: Culture, Food, Adventure, Nature, or Other.
* **Responsive Modal** – Mobile-friendly modal overlay for a smooth user experience.
* **Pure Frontend** – No backend required; all API calls are handled client-side.

---

## Tech Stack

* **React** – Frontend component architecture.
* **JavaScript (ES6+)** – Logic and state management.
* **Tailwind CSS** – Styling for quick and clean UI.
* **OpenStreetMap Nominatim API** – Geocoding and location search.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rwanda-trip-planner.git
````

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Open the **Activity Modal** to add or edit an activity.
2. Enter the **activity title**.
3. Start typing the **location** – suggestions appear automatically.
4. Select a suggestion to populate the **coordinates**.
5. Set the **time** and choose a **category**.
6. Click **Save** to save the activity or **Cancel** to discard.

All activities can be managed in a **parent component**, which handles saving and storing activity data (local state, Firebase, or any backend of your choice).

---

## Notes

* **API Usage**: The Nominatim API is free for limited requests. Avoid spamming queries to comply with their usage policy.
* **Extensibility**: You can integrate a **map preview** with Leaflet or Google Maps for better user experience.
* **Styling**: Tailwind classes can be customized or replaced with any CSS framework.

## Future Enhancements

* Map visualization of selected locations.
* Offline storage for activities using IndexedDB or localStorage.
* Integration with Firebase or another backend for persistent storage.
* Multi-day itinerary planner for Rwanda trips.


## Author

BYAMUNGU Desire

## License

MIT License – free to use, modify, and distribute.
