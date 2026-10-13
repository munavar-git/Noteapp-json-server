
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const NotesContext = createContext();

const API = "http://localhost:3000/notes";

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  }

  async function fetchNotes() {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API);
      setNotes(response.data);
    } catch (err) {
      setError("Could not load notes. Check JSON Server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function createNote(note) {
    setLoading(true);
    setError(null);

    const now = new Date().toISOString();

    const newNote = {
      title: note.title,
      content: note.content,
      color: note.color || "yellow",
      tags: note.tags || [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const response = await axios.post(API, newNote);

      setNotes((previousNotes) => [
        response.data,
        ...previousNotes,
      ]);

      showToast("Note created successfully");
      return true;
    } catch (err) {
      setError("Could not create note.");
      showToast("Failed to create note");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function updateNote(id, updates) {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(`${API}/${id}`, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          String(note.id) === String(id)
            ? response.data
            : note
        )
      );

      showToast("Note updated successfully");
      return true;
    } catch (err) {
      setError("Could not update note.");
      showToast("Failed to update note");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id) {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API}/${id}`);

      setNotes((previousNotes) =>
        previousNotes.filter(
          (note) => String(note.id) !== String(id)
        )
      );

      showToast("Note deleted successfully");
      return true;
    } catch (err) {
      setError("Could not delete note.");
      showToast("Failed to delete note");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function toggleArchive(id) {
    const selectedNote = notes.find(
      (note) => String(note.id) === String(id)
    );

    if (!selectedNote) return false;

    const archived = !selectedNote.archived;

    const success = await updateNote(id, { archived });

    if (success) {
      showToast(
        archived ? "Note archived" : "Note unarchived"
      );
    }

    return success;
  }

  function searchNotes(query) {
    const value = query.trim().toLowerCase();

    if (!value) return notes;

    return notes.filter((note) => {
      const title = note.title.toLowerCase();
      const content = note.content.toLowerCase();
      const tags = note.tags || [];

      return (
        title.includes(value) ||
        content.includes(value) ||
        tags.some((tag) =>
          tag.toLowerCase().includes(value)
        )
      );
    });
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        toast,
        createNote,
        updateNote,
        deleteNote,
        toggleArchive,
        searchNotes,
        fetchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
