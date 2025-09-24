import React, { useState } from "react";
import ActivityModal from "./ActivityModal";

export default function DaySection({ day, updateActivities }) {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleSave = (activity) => {
    if (selectedActivity) {
      updateActivities(
        day.activities.map((a) => (a.id === activity.id ? activity : a))
      );
    } else {
      updateActivities([...day.activities, { ...activity, id: Date.now() }]);
    }
    setSelectedActivity(null);
  };

  const handleDelete = (id) => {
    updateActivities(day.activities.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow mb-4">
      <h3 className="font-bold text-gray-700 mb-3">{day.title}</h3>
      <div className="space-y-3">
        {day.activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-gray-50 p-3 rounded-lg border flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">{activity.title}</h4>
              <p className="text-xs text-gray-500">{activity.category}</p>
            </div>
            <div className="flex gap-2 text-sm text-orange-500">
              <button onClick={() => setSelectedActivity(activity)}>Edit</button>
              <button onClick={() => handleDelete(activity.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setSelectedActivity(null)}
        className="text-sm text-orange-600 mt-3"
      >
        + Add Activity
      </button>

      {selectedActivity !== undefined && (
        <ActivityModal
          activity={selectedActivity}
          onSave={handleSave}
          onClose={() => setSelectedActivity(undefined)}
        />
      )}
    </div>
  );
}
