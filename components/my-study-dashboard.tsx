"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type PassageRelation = {
  slug: string;
  internal_reference: string;
  section_label?: string | null;
};

type Bookmark = {
  created_at: string;
  canonical_passages: PassageRelation | PassageRelation[] | null;
};

type Note = {
  id: string;
  body: string;
  study_question?: string | null;
  personal_tags?: string[];
  updated_at: string;
  canonical_passages: PassageRelation | PassageRelation[] | null;
};

type Guide = {
  title: string;
  slug: string;
  updated_at: string;
  user_study_items?: Array<{ count: number }>;
};

type SavedQuote = {
  id: string;
  created_at: string;
  configuration?: Record<string, unknown>;
  edition_passages?:
    | {
        source_stanza_number?: string;
        editions?:
          | {
              slug?: string;
              edition_title?: string;
              translator?: string | null;
              editor?: string | null;
            }
          | Array<{
              slug?: string;
              edition_title?: string;
              translator?: string | null;
              editor?: string | null;
            }>
          | null;
      }
    | Array<{
        source_stanza_number?: string;
        editions?: unknown;
      }>
    | null;
};

type Overview = {
  user: { email?: string; displayName?: string | null };
  bookmarks: Bookmark[];
  notes: Note[];
  guides: Guide[];
  savedQuotes: SavedQuote[];
};

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function passageFor(item: Bookmark | Note) {
  return one(item.canonical_passages);
}

function noteExcerpt(note: Note) {
  const text = note.study_question?.trim() || note.body.trim();
  if (!text) return "Private note";
  return text.length > 150 ? `${text.slice(0, 150).trim()}…` : text;
}

export function MyStudyDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/study/overview", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        setNeedsSignIn(response.status === 401);
        setMessage(result.error || "Saved work could not be loaded.");
        return;
      }
      setOverview(result);
      setNeedsSignIn(false);
      setMessage("");
    } catch {
      setMessage("Saved work could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/study/guides", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error);
      return;
    }
    location.href = `/my-study/${result.guide.slug}`;
  }

  if (loading) {
    return <div className="empty-state">Opening your private study folio…</div>;
  }

  if (needsSignIn) {
    return (
      <section className="saved-work-signin">
        <div>
          <div className="section-kicker">Private study folio</div>
          <h2>Sign in to see your saved work</h2>
          <p>Bookmarks, notes, personal guides, and saved quote designs are kept with your reader account.</p>
        </div>
        <Link className="button" href="/account">
          Sign in or create an account
        </Link>
      </section>
    );
  }

  if (!overview) {
    return <div className="empty-state">{message || "Saved work could not be loaded."}</div>;
  }

  const readerName = overview.user.displayName || overview.user.email || "Reader";

  return (
    <>
      <section className="saved-work-heading">
        <div>
          <div className="section-kicker">Signed-in reader</div>
          <h2>{readerName}</h2>
          {overview.user.displayName && <p>{overview.user.email}</p>}
        </div>
        <Link href="/account">Account and profile →</Link>
      </section>

      <section className="saved-work-summary" aria-label="Saved work summary">
        <div>
          <strong>{overview.bookmarks.length}</strong>
          <span>Bookmarks</span>
        </div>
        <div>
          <strong>{overview.notes.length}</strong>
          <span>Private notes</span>
        </div>
        <div>
          <strong>{overview.guides.length}</strong>
          <span>Study guides</span>
        </div>
        <div>
          <strong>{overview.savedQuotes.length}</strong>
          <span>Saved quotes</span>
        </div>
      </section>

      <div className="saved-work-grid">
        <section>
          <h2 className="rule-heading">Bookmarked passages</h2>
          {overview.bookmarks.length ? (
            <div className="saved-work-list">
              {overview.bookmarks.map((bookmark, index) => {
                const passage = passageFor(bookmark);
                return (
                  <article key={`${passage?.slug ?? "bookmark"}-${index}`}>
                    <div>
                      <div className="section-kicker">Bookmark</div>
                      <h3>{passage?.internal_reference || "Saved passage"}</h3>
                      {passage?.section_label && <p>{passage.section_label}</p>}
                    </div>
                    {passage?.slug && (
                      <Link href={`/havamal/stanza/${passage.slug}`}>Open passage</Link>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No passages have been bookmarked yet.</div>
          )}
        </section>

        <section>
          <h2 className="rule-heading">Private notes</h2>
          {overview.notes.length ? (
            <div className="saved-work-list">
              {overview.notes.map((note) => {
                const passage = passageFor(note);
                return (
                  <article key={note.id}>
                    <div>
                      <div className="section-kicker">Private note</div>
                      <h3>{passage?.internal_reference || "Saved note"}</h3>
                      <p>{noteExcerpt(note)}</p>
                      {note.personal_tags?.length ? (
                        <small>{note.personal_tags.join(" · ")}</small>
                      ) : null}
                    </div>
                    {passage?.slug && (
                      <Link href={`/havamal/stanza/${passage.slug}`}>Continue note</Link>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No private notes have been saved yet.</div>
          )}
        </section>
      </div>

      <section className="saved-guides-section">
        <h2 className="rule-heading">Personal study guides</h2>
        <form className="guide-create-form" onSubmit={create}>
          <label>
            New guide title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={2}
              maxLength={120}
              placeholder="Example: Speech and restraint"
              required
            />
          </label>
          <button className="button">Create guide</button>
        </form>

        {overview.guides.length ? (
          <div className="card-list">
            {overview.guides.map((guide) => (
              <article className="flat-card" key={guide.slug}>
                <div className="section-kicker">Private guide</div>
                <h2>{guide.title}</h2>
                <p>
                  {(guide.user_study_items?.[0]?.count ?? 0).toLocaleString()} passage
                  {(guide.user_study_items?.[0]?.count ?? 0) === 1 ? "" : "s"} · updated {new Date(guide.updated_at).toLocaleDateString()}
                </p>
                <Link href={`/my-study/${guide.slug}`}>Continue guide</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No personal study guides have been created.</div>
        )}
      </section>

      <section>
        <h2 className="rule-heading">Saved quote designs</h2>
        {overview.savedQuotes.length ? (
          <div className="saved-work-list">
            {overview.savedQuotes.map((quote) => {
              const passage = one(quote.edition_passages);
              const edition = one(passage?.editions as any);
              const person = edition?.translator || edition?.editor || edition?.edition_title;
              return (
                <article key={quote.id}>
                  <div>
                    <div className="section-kicker">Saved quote</div>
                    <h3>
                      {person ? `${person} · ` : ""}
                      {passage?.source_stanza_number
                        ? `stanza ${passage.source_stanza_number}`
                        : "Quote design"}
                    </h3>
                    <p>Saved {new Date(quote.created_at).toLocaleDateString()}</p>
                  </div>
                  <Link href="/quote-maker">Open quote maker</Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No quote designs have been saved yet.</div>
        )}
      </section>

      {message && <p className="notice" aria-live="polite">{message}</p>}
    </>
  );
}
