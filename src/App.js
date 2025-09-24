import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import MyTrip from "./pages/MyTripPage";
import Map from "./pages/MapPage";
import Packing from "./pages/PackingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-trip" element={<MyTrip />} />
        <Route path="/map" element={<Map />} />
        <Route path="/packing" element={<Packing />} />
      </Routes>
    </Router>
  );
}

export default App;
