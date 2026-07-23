"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { SearchSuggestion } from "@/lib/corpus-search";

export function SearchBox({
  compact = false,
  initialQuery = "",
}: {
  compact?: boolean;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 && !/^\d{1,3}$/.test(trimmed)) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search-suggestions?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const body = (await response.json()) as { suggestions?: SearchSuggestion[] };
        if (!response.ok) throw new Error("Suggestion request failed.");
        setSuggestions(body.suggestions ?? []);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function goToSuggestion(suggestion: SearchSuggestion) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(suggestion.href);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToSuggestion(suggestions[activeIndex]);
      return;
    }
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) {
      if (event.key === "ArrowDown" && suggestions.length) setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const id = compact ? "search-small" : "search-main";

  return (
    <form
      ref={rootRef}
      className={compact ? "search-box search-box-compact" : "search-box"}
      onSubmit={submit}
      role="search"
    >
      <label htmlFor={id}>{compact ? "Search" : "Search the Hávamál"}</label>
      <div className="search-input-row">
        <input
          id={id}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Phrase, theme, translator, or stanza"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
        />
        <button type="submit">Find</button>
      </div>

      {open && (
        <div className="search-suggestions" id={listId} role="listbox">
          {loading && !suggestions.length ? (
            <p className="search-suggestion-state">Searching the archive…</p>
          ) : suggestions.length ? (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  id={`${listId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  className="search-suggestion"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToSuggestion(suggestion)}
                >
                  <span className="search-suggestion-type">{suggestion.type}</span>
                  <strong>{suggestion.label}</strong>
                  <small>{suggestion.meta}</small>
                </button>
              ))}
              <button
                type="submit"
                className="search-all-results"
                onMouseDown={(event) => event.preventDefault()}
              >
                View all results for “{query.trim()}”
              </button>
            </>
          ) : (
            <p className="search-suggestion-state">No matching passages yet. Press Find for the full search.</p>
          )}
        </div>
      )}
    </form>
  );
}
