import { useEffect, useState } from 'react';

const BOOKMARKS_KEY = 'gsoc-explorer-bookmarks-v1';
const NOTES_KEY = 'gsoc-explorer-notes-v1';

export default function LocalResearch({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      setBookmarked(Array.isArray(bookmarks) && bookmarks.includes(slug));
      if (notes && typeof notes === 'object' && typeof notes[slug] === 'string')
        setNote(notes[slug]);
    } catch {
      // Corrupt browser-local research should never stop the page rendering.
    }
  }, [slug]);

  function toggleBookmark() {
    let bookmarks: string[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
      if (Array.isArray(stored))
        bookmarks = stored.filter(
          (value): value is string => typeof value === 'string',
        );
    } catch {}
    const next = bookmarks.includes(slug)
      ? bookmarks.filter((value) => value !== slug)
      : [...bookmarks, slug];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    setBookmarked(next.includes(slug));
  }

  function saveNote() {
    let notes: Record<string, string> = {};
    try {
      const stored = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      if (stored && typeof stored === 'object' && !Array.isArray(stored))
        notes = stored;
    } catch {}
    notes[slug] = note;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <section
      className="detail-card local-research"
      aria-labelledby="private-notes-heading"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Stored only in this browser</span>
          <h2 id="private-notes-heading">Private research notes</h2>
        </div>
        <button
          className={`button ${bookmarked ? 'primary-button' : 'secondary-button'}`}
          type="button"
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
        >
          <svg className="save-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.25 3.5h9.5c.97 0 1.75.78 1.75 1.75v15.1L12 16.4l-6.5 3.95V5.25c0-.97.78-1.75 1.75-1.75Z" />
          </svg>
          {bookmarked ? 'Saved' : 'Save organization'}
        </button>
      </div>
      <label>
        <span className="sr-only">Notes about {name}</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={`Record links, questions, or next steps for ${name}…`}
          rows={6}
        />
      </label>
      <div className="note-actions">
        <button
          className="button primary-button"
          type="button"
          onClick={saveNote}
        >
          Save note
        </button>
        <span role="status" aria-live="polite">
          {saved ? 'Saved locally.' : 'No account or sync.'}
        </span>
      </div>
    </section>
  );
}
