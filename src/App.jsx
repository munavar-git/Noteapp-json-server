
import { useState } from "react";
import { useNotes } from "./context/NotesContext";

const colors = {
  yellow: "bg-yellow-100",
  blue: "bg-blue-100",
  green: "bg-green-100",
  pink: "bg-pink-100",
};

function App() {
  const {
    notes,
    loading,
    error,
    toast,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
    searchNotes,
  } = useNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("yellow");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");

  function clearForm() {
    setTitle("");
    setContent("");
    setColor("yellow");
    setTags("");
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      color,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    let success;

    if (editingId !== null) {
      success = await updateNote(editingId, noteData);
    } else {
      success = await createNote(noteData);
    }

    if (success) {
      clearForm();
    }
  }

  function handleEdit(note) {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || "yellow");
    setTags((note.tags || []).join(", "));
    setEditingId(note.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const success = await deleteNote(id);

    if (success && String(editingId) === String(id)) {
      clearForm();
    }
  }

  const filteredNotes = searchNotes(search).filter((note) => {
    if (filter === "active") return !note.archived;
    if (filter === "archived") return note.archived;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep your thoughts in one place.
            </p>
          </div>

          <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
            {notes.length} notes
          </span>
        </header>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {toast && (
          <div
            role="status"
            className="mb-4 rounded-lg bg-gray-800 px-4 py-3 text-sm text-white"
          >
            {toast}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {editingId !== null ? "Edit note" : "Create a note"}
          </h2>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-gray-500"
          />

          <textarea
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="mb-3 w-full resize-y rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-gray-500"
          />

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2"
            >
              <option value="yellow">Yellow</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="pink">Pink</option>
            </select>

            <input
              type="text"
              placeholder="Tags (e.g. work, study)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId !== null
                  ? "Update note"
                  : "Add note"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={clearForm}
                className="rounded-lg border border-gray-200 px-5 py-2.5 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder="Search notes or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-500"
          />

          <div className="flex gap-2">
            {["active", "archived", "all"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-4 py-2 capitalize ${
                  filter === item
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
            Loading...
          </div>
        )}

        {!loading && filteredNotes.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center text-gray-500">
            No notes found.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              className={`rounded-xl p-5 shadow-sm ${
                colors[note.color] || "bg-white"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="break-words text-lg font-semibold">
                  {note.title}
                </h3>

                {note.archived && (
                  <span className="shrink-0 rounded bg-white/70 px-2 py-1 text-xs">
                    Archived
                  </span>
                )}
              </div>

              <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {note.content}
              </p>

              {(note.tags || []).length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full bg-white/70 px-2 py-1 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="mb-4 text-xs text-gray-500">
                Updated{" "}
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>

              <div className="flex flex-wrap gap-2 border-t border-black/10 pt-3">
                <button
                  onClick={() => handleEdit(note)}
                  className="text-sm font-medium hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleArchive(note.id)}
                  className="text-sm font-medium hover:underline"
                >
                  {note.archived ? "Unarchive" : "Archive"}
                </button>

                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
