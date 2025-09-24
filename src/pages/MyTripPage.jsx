import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import ActivityModal from "../components/ActivityModal";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../Firebase";

export default function TripPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);
  const [initialActivityData, setInitialActivityData] = useState(null);

  const fetchTrips = async () => {
    try {
      const tripsSnapshot = await getDocs(collection(db, "trips"));
      const tripsData = [];

      for (const tripDoc of tripsSnapshot.docs) {
        const tripId = tripDoc.id;
        const daysSnapshot = await getDocs(collection(db, "trips", tripId, "days"));
        const daysData = daysSnapshot.docs.map((dayDoc) => {
          const day = { id: dayDoc.id, ...dayDoc.data() };
          if (!Array.isArray(day.activities)) day.activities = [];
          return day;
        });
        tripsData.push({ id: tripId, ...tripDoc.data(), days: daysData });
      }
      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleAddDay = async (tripIndex) => {
    try {
      const newDay = { date: `Day ${trips[tripIndex].days.length + 1}`, activities: [] };
      const tripId = trips[tripIndex].id;
      const dayDocRef = await addDoc(collection(db, "trips", tripId, "days"), newDay);
      const updatedTrips = [...trips];
      updatedTrips[tripIndex].days.push({ ...newDay, id: dayDocRef.id });
      setTrips(updatedTrips);
    } catch (error) {
      console.error("Error adding day:", error);
    }
  };

  const handleDeleteDay = async (tripIndex, dayIndex) => {
    try {
      const day = trips[tripIndex].days[dayIndex];
      await deleteDoc(doc(db, "trips", trips[tripIndex].id, "days", day.id));
      const updatedTrips = [...trips];
      updatedTrips[tripIndex].days.splice(dayIndex, 1);
      setTrips(updatedTrips);
    } catch (error) {
      console.error("Error deleting day:", error);
    }
  };

  const handleDeleteTrip = async (tripIndex) => {
    try {
      const trip = trips[tripIndex];
      for (const day of trip.days) {
        await deleteDoc(doc(db, "trips", trip.id, "days", day.id));
      }
      await deleteDoc(doc(db, "trips", trip.id));
      const updatedTrips = [...trips];
      updatedTrips.splice(tripIndex, 1);
      setTrips(updatedTrips);
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const handleAddActivity = (tripIndex, dayIndex) => {
    setSelectedTripIndex(tripIndex);
    setSelectedDayIndex(dayIndex);
    setEditingActivityIndex(null);
    setInitialActivityData(null);
    setModalOpen(true);
  };

  const handleEditActivity = (tripIndex, dayIndex, activityIndex) => {
    setSelectedTripIndex(tripIndex);
    setSelectedDayIndex(dayIndex);
    setEditingActivityIndex(activityIndex);
    setInitialActivityData(trips[tripIndex].days[dayIndex].activities[activityIndex]);
    setModalOpen(true);
  };

  const handleSaveActivity = async (activityData) => {
    if (selectedTripIndex === null || selectedDayIndex === null) return;

    const updatedTrips = [...trips];
    const targetDay = updatedTrips[selectedTripIndex].days[selectedDayIndex];
    if (!Array.isArray(targetDay.activities)) targetDay.activities = [];

    if (editingActivityIndex !== null && editingActivityIndex >= 0) {
      targetDay.activities[editingActivityIndex] = activityData;
    } else {
      targetDay.activities.push(activityData);
    }

    setTrips(updatedTrips);
    setModalOpen(false);
    setSelectedTripIndex(null);
    setSelectedDayIndex(null);
    setEditingActivityIndex(null);
    setInitialActivityData(null);

    try {
      if (!targetDay.id) {
        const newDayRef = await addDoc(collection(db, "trips", updatedTrips[selectedTripIndex].id, "days"), {
          date: targetDay.date || "",
          activities: targetDay.activities,
        });
        targetDay.id = newDayRef.id;
        setTrips([...updatedTrips]);
      } else {
        const dayDocRef = doc(db, "trips", updatedTrips[selectedTripIndex].id, "days", targetDay.id);
        await updateDoc(dayDocRef, { activities: targetDay.activities });
      }
    } catch (error) {
      console.error("Error updating activity in Firestore:", error);
    }
  };

  const handleDeleteActivity = async (tripIndex, dayIndex, activityIndex) => {
    try {
      const updatedTrips = [...trips];
      const targetDay = updatedTrips[tripIndex].days[dayIndex];
      if (!Array.isArray(targetDay.activities)) targetDay.activities = [];
      targetDay.activities.splice(activityIndex, 1);
      setTrips(updatedTrips);

      if (targetDay.id) {
        const dayDocRef = doc(db, "trips", updatedTrips[tripIndex].id, "days", targetDay.id);
        await updateDoc(dayDocRef, { activities: targetDay.activities });
      }
    } catch (error) {
      console.error("Error deleting activity in Firestore:", error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTripIndex(null);
    setSelectedDayIndex(null);
    setEditingActivityIndex(null);
    setInitialActivityData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex justify-between items-center p-4 shadow-sm border-b bg-white sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-800">Rwanda Trip Planner</h1>
        <div className="flex gap-4 text-sm text-orange-600">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/map")}>Map</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto flex-grow">
        {trips.map((trip, tIndex) => (
          <div key={trip.id} className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">Trip {trip.id}</h2>
              <button
                onClick={() => handleDeleteTrip(tIndex)}
                className="text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete Trip
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trip.days.map((day, dIndex) => (
                <div key={day.id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-orange-500">{day.date}</h3>
                    <button
                      onClick={() => handleDeleteDay(tIndex, dIndex)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Day
                    </button>
                  </div>

                  {day.activities?.length === 0 ? (
                    <p className="text-sm text-gray-400 italic mb-3">
                      No activities yet. Add your first one!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {day.activities.map((act, aIndex) => (
                        <div
                          key={aIndex}
                          className="flex justify-between items-center bg-gray-50 border rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {act.time ? `${act.time} - ${act.title}` : act.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {act.category}
                                {act.location ? ` • ${act.location}` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => handleEditActivity(tIndex, dIndex, aIndex)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteActivity(tIndex, dIndex, aIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleAddActivity(tIndex, dIndex)}
                    className="flex items-center gap-1 mt-4 px-2 py-1 text-sm font-semibold text-orange-600 rounded-full border border-orange-400 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4" /> Add Activity
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleAddDay(tIndex)}
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-orange-400 text-orange-600 text-sm font-semibold hover:bg-orange-50"
              >
                <Plus className="w-4 h-4" /> Add Day
              </button>
            </div>
          </div>
        ))}

        {trips.length === 0 && <p className="text-gray-500">No trips available. Click Add Day to create one.</p>}
      </main>

      <ActivityModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveActivity}
        initialData={initialActivityData}
      />
    </div>
  );
}
