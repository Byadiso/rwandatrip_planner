import { Link } from "react-router-dom";
import rwandaImg from "../assets/rwanda-bg.png";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="p-5 flex justify-between items-center border-b shadow-sm">
        <h1 className="text-2xl font-extrabold text-orange-500">Plan Your Trip</h1>
        <button
          aria-label="Open menu"
          className="text-3xl text-gray-700 md:hidden"
        >
          &#9776;
        </button>
      </header>

      {/* Main Section */}
      <main className="px-6 py-10 md:px-20 md:py-16 text-center">
        {/* Hero Section */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Plan Your Trip to Rwanda
          </h2>
          <section className="mb-10">
            <div className="relative w-full max-w-5xl mx-auto h-52 md:h-72 lg:h-80 overflow-hidden rounded-lg shadow-lg">
              <img
                src={rwandaImg}
                alt="Rwanda banner"
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        </section>

        {/* Features with Navigation */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {[
            { name: "Itinerary Builder", emoji: "🗓️", path: "/my-trip" },
            { name: "Offline Maps", emoji: "🗺️", path: "/map" },
            { name: "Packing List", emoji: "🎒", path: "/packing" },
          ].map((feature) => (
            <Link
              to={feature.path}
              key={feature.name}
              className="bg-orange-50 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-200 block"
            >
              <div className="text-4xl">{feature.emoji}</div>
              <h4 className="text-lg font-semibold mt-3">{feature.name}</h4>
            </Link>
          ))}
        </section>

        {/* CTA */}
        <Link to="/my-trip">
          <button className="bg-orange-500 text-white text-lg px-8 py-3 rounded-full hover:bg-orange-600 transition duration-200">
            Start Planning
          </button>
        </Link>

        {/* Info Section */}
        <section className="mt-12 text-left max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Trip Planning Features</h3>
          <ul className="text-gray-700 list-disc pl-5 space-y-2 text-sm">
            <li>Custom Itinerary Builder based on your preferences</li>
            <li>Offline-accessible maps for your journey</li>
            <li>Smart packing list based on trip duration and activities</li>
            <li>Real-time recommendations & travel tips</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
