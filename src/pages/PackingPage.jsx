import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../Firebase";

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

  // Packing items
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemText, setItemText] = useState("");
  const [itemStop, setItemStop] = useState("");

  // Notes
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Delete confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: null, // 'item' or 'note'
    id: null,
    label: "",
  });

  const itemsRef = collection(db, "packingList");
  const notesRef = collection(db, "packingNotes");

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      const snapshot = await getDocs(itemsRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setLoadingItems(false);
    };
    fetchItems();
  }, []);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoadingNotes(true);
      const snapshot = await getDocs(notesRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(data);
      setLoadingNotes(false);
    };
    fetchNotes();
  }, []);

  // --- CRUD: Items ---
  const openNewItem = () => {
    setEditingItem(null);
    setItemText("");
    setItemStop("");
    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemText(item.item);
    setItemStop(item.stop || "");
    setShowItemModal(true);
  };

  const saveItem = async () => {
    if (!itemText.trim()) return;

    if (editingItem) {
      const itemRef = doc(db, "packingList", editingItem.id);
      await updateDoc(itemRef, { item: itemText, stop: itemStop });
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id ? { ...i, item: itemText, stop: itemStop } : i
        )
      );
    } else {
      const newItem = { item: itemText, stop: itemStop || null, checked: false };
      const docRef = await addDoc(itemsRef, newItem);
      setItems((prev) => [...prev, { id: docRef.id, ...newItem }]);
    }

    setItemText("");
    setItemStop("");
    setEditingItem(null);
    setShowItemModal(false);
  };

  const toggleItem = useCallback(async (id) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, checked: !it.checked };
          updateDoc(doc(db, "packingList", id), { checked: updated.checked });
          return updated;
        }
        return it;
      })
    );
  }, []);

  const confirmDelete = (type, id, label) => {
    setConfirmModal({ visible: true, type, id, label });
  };

  const handleDeleteConfirmed = async () => {
    const { type, id } = confirmModal;

    if (type === "item") {
      await deleteDoc(doc(db, "packingList", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else if (type === "note") {
      await deleteDoc(doc(db, "packingNotes", id));
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }

    setConfirmModal({ visible: false, type: null, id: null, label: "" });
  };

  // --- CRUD: Notes ---
  const openNewNote = () => {
    setEditingNote(null);
    setNoteText("");
    setShowNoteModal(true);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setNoteText(note.text);
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;

    if (editingNote) {
      const noteRef = doc(db, "packingNotes", editingNote.id);
      await updateDoc(noteRef, { text: noteText, updatedAt: Date.now() });
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? { ...n, text: noteText } : n))
      );
    } else {
      const newNote = { text: noteText, createdAt: Date.now() };
      const docRef = await addDoc(notesRef, newNote);
      setNotes((prev) => [...prev, { id: docRef.id, ...newNote }]);
    }

    setNoteText("");
    setEditingNote(null);
    setShowNoteModal(false);
  };

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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-800"
          >
            <ArrowLeft />
            <span className="text-base font-medium">Packing</span>
          </button>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="text-sm font-medium text-gray-800"
              onClick={() => setShowNoteModal(true)}
            >
              Notes
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-orange-600 hover:underline"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/my-trip")}
              className="text-sm text-orange-600 hover:underline"
            >
              Trip
            </button>
            <button
              onClick={() => navigate("/map")}
              className="text-sm text-orange-600 hover:underline"
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Offline banner */}
      <div className="flex items-start gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200">
        <div className="flex-shrink-0 mt-1">
          <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
        </div>
        <div className="flex-1 text-sm text-gray-800">
          <span className="font-medium">You're offline</span>
          <span className="ml-1">– All features are still available</span>
        </div>
      </div>

      {/* Packing List */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Packing List</h2>
          <button
            onClick={openNewItem}
            className="text-sm px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            + Add Item
          </button>
        </div>

        {loadingItems ? (
          <p className="text-sm text-gray-500">Loading packing list...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">No items yet.</p>
        ) : (
          Object.entries(grouped).map(([stopKey, groupItems]) => {
            const isUncategorized = stopKey === "__uncategorized";
            return (
              <div
                key={stopKey}
                className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {!isUncategorized && (
                  <div className="px-4 py-3 border-b text-sm font-semibold">
                    {stopKey}
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
                          <span className="text-xs text-gray-500">{it.stop}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={it.checked}
                          onChange={() => toggleItem(it.id)}
                          className="h-4 w-4"
                        />
                        <button
                          onClick={() => openEditItem(it)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete("item", it.id, it.item)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notes Section */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Notes</h2>
          <button
            onClick={openNewNote}
            className="text-sm px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            + Add Note
          </button>
        </div>

        {loadingNotes ? (
          <p className="text-sm text-gray-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex justify-between items-center border border-gray-200 p-3 rounded-lg"
              >
                <p className="text-sm text-gray-800">{note.text}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditNote(note)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete("note", note.id, note.text)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white w-80 rounded-xl p-4 shadow-lg">
            <h3 className="text-base font-semibold mb-2">
              {editingItem ? "Edit Item" : "New Item"}
            </h3>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2"
              placeholder="Item name"
              value={itemText}
              onChange={(e) => setItemText(e.target.value)}
            />
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              placeholder="Stop (optional)"
              value={itemStop}
              onChange={(e) => setItemStop(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="text-sm px-3 py-1 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                className="text-sm px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white w-80 rounded-xl p-4 shadow-lg">
            <h3 className="text-base font-semibold mb-2">
              {editingNote ? "Edit Note" : "New Note"}
            </h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows="4"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note..."
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-sm px-3 py-1 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="text-sm px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmModal.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
          <div className="bg-white w-80 rounded-xl p-4 shadow-lg">
            <h3 className="text-base font-semibold mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{confirmModal.label}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setConfirmModal({ visible: false, type: null, id: null, label: "" })
                }
                className="text-sm px-3 py-1 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
