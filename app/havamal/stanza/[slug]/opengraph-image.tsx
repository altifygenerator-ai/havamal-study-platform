import { ImageResponse } from "next/og";

import { getCompletePassage } from "@/lib/complete-corpus";

export const alt = "Hávamál passage from The Hávamál Archive";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const passage = await getCompletePassage(slug);
  const primary = passage?.editions[0];
  const lines = primary?.passage.text_lines.slice(0, 5) ?? [
    "Read and compare the Hávamál across translations.",
  ];
  const translator =
    primary?.edition.translator ?? primary?.edition.editor ?? "The Hávamál Archive";
  const stanza = primary?.passage.source_stanza_number;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#d8c397",
          color: "#211a14",
          border: "24px solid #181411",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#7b3027",
          }}
        >
          The Hávamál Archive
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 980,
            fontSize: 42,
            lineHeight: 1.22,
          }}
        >
          {lines.map((line, index) => (
            <div key={index} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: "#5e503f",
          }}
        >
          <div style={{ display: "flex" }}>
            {translator}
            {stanza ? ` · stanza ${stanza}` : ""}
          </div>
          <div style={{ display: "flex" }}>thehavamalarchive.org</div>
        </div>
      </div>
    ),
    size,
  );
}
