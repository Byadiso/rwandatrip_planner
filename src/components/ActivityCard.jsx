export default function ActivityCard({ activity }) {
  return (
    <div className="bg-white border p-2 rounded mb-2 text-sm">
      <p className="font-medium">{activity.title}</p>
      <p className="text-xs text-gray-500">{activity.category} • {activity.time}</p>
    </div>
  );
}
