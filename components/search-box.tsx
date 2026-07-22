"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox({
  compact = false,
  initialQuery = "",
}: {
  compact?: boolean;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const id = compact ? "search-small" : "search-main";

  return (
    <form className={compact ? "search-box search-box-compact" : "search-box"} onSubmit={submit} role="search">
      <label htmlFor={id}>{compact ? "Search" : "Search the Hávamál"}</label>
      <div>
        <input
          id={id}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Phrase, theme, translator, or stanza"
        />
        <button type="submit">Find</button>
      </div>
    </form>
  );
}
