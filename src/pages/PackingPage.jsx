import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ArrowLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-800"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const Ellipsis = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-600"
  >
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

export default function PackingPage() {
  const navigate = useNavigate();

  const initialItems = [
    {
      id: 1,
      item: "Hiking Boots",
      stop: "Kigali Genocide Memorial",
      checked: false,
    },
    { id: 2, item: "Rain Jacket", stop: null, checked: false },
    { id: 3, item: "Insect Repellent", stop: null, checked: false },
  ];

  const [items, setItems] = useState(initialItems);

  const toggleItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  }, []);

  // Group by stop (null => uncategorized)
  const grouped = items.reduce((acc, cur) => {
    const key = cur.stop || "__uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cur);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Back"
              className="flex items-center gap-2 text-gray-800"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft />
              <span className="text-base font-medium">Packing</span>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="text-sm font-medium text-gray-800"
              onClick={() => navigate("/notes")}
            >
              Notes
            </button>
            <button
              type="button"
              className="text-sm text-orange-600 hover:underline"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              type="button"
              className="text-sm text-orange-600 hover:underline"
              onClick={() => navigate("/trip")}
            >
              Trip
            </button>
          </div>
        </div>
      </div>

      {/* Offline banner */}
      <div className="flex items-start gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200">
        <div className="flex-shrink-0 mt-1">
          <span
            className="inline-block h-3 w-3 rounded-full bg-orange-500"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 text-sm text-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium">You're offline</span>
              <span className="ml-1">
                – All features are still available
              </span>
            </div>
            <button
              aria-label="More options"
              className="ml-2 p-1 rounded hover:bg-gray-100"
              type="button"
            >
              <Ellipsis />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <h2 className="text-lg font-semibold mb-3">Packing</h2>

        {Object.entries(grouped).map(([stopKey, groupItems]) => {
          const isUncategorized = stopKey === "__uncategorized";
          return (
            <div
              key={stopKey}
              className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {!isUncategorized && (
                <div className="px-4 py-3 border-b">
                  <div className="text-sm font-semibold">{stopKey}</div>
                </div>
              )}
              <div className="divide-y divide-gray-100">
                {groupItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{it.item}</p>
                      {it.stop && (
                        <span className="text-xs text-gray-500">
                          {it.stop}
                        </span>
                      )}
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={it.checked}
                        onChange={() => toggleItem(it.id)}
                        className="h-4 w-4"
                        aria-label={`Check ${it.item}`}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
