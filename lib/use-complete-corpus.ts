"use client";

import { useEffect, useMemo, useState } from "react";
import type { CanonicalPassage, CorpusSourceStatus } from "@/lib/types";

export function useCompleteCorpus(initialPassages: CanonicalPassage[]) {
  const initialEditionCount = useMemo(
    () =>
      new Set(
        initialPassages.flatMap((passage) =>
          passage.editions.map(({ edition }) => edition.slug),
        ),
      ).size,
    [initialPassages],
  );
  const hasServerCorpus = initialPassages.length >= 150 && initialEditionCount > 1;
  const [passages, setPassages] = useState(initialPassages);
  const [statuses, setStatuses] = useState<CorpusSourceStatus[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">(
    hasServerCorpus ? "ready" : "loading",
  );
  const [message, setMessage] = useState(
    hasServerCorpus
      ? `${initialEditionCount} complete editions loaded.`
      : "Loading complete legal editions…",
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/corpus", { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as {
          passages?: CanonicalPassage[];
          statuses?: CorpusSourceStatus[];
          error?: string;
        };
        if (!response.ok || !body.passages) throw new Error(body.error || "Corpus request failed.");
        setPassages(body.passages);
        setStatuses(body.statuses ?? []);
        setState("ready");
        const available = new Set(
          body.passages.flatMap((passage) =>
            passage.editions.map(({ edition }) => edition.slug),
          ),
        );
        setMessage(
          available.size > 1
            ? `${available.size} complete editions available for comparison.`
            : "Using the bundled offline corpus.",
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (hasServerCorpus) {
          setState("ready");
          setMessage(`${initialEditionCount} complete editions loaded.`);
          return;
        }
        setState("error");
        setMessage(
          `Complete editions could not load; the bundled corpus remains available. ${error instanceof Error ? error.message : ""}`.trim(),
        );
      });
    return () => controller.abort();
  }, [hasServerCorpus, initialEditionCount]);

  return { passages, statuses, state, message };
}
