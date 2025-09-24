import DayCard from "./DayCard";

export default function TripDetail({ trip }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-semibold text-lg">{trip.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{trip.dates}</p>

      {trip.days.map((day) => (
        <DayCard key={day.id} day={day} />
      ))}

      <button className="text-orange-500 mt-2 text-sm font-medium">+ Add Day</button>
    </div>
  );
}
