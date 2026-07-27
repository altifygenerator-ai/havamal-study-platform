import { ImageResponse } from "next/og";

export const alt = "The Hávamál Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#17120f",
          padding: 46,
          color: "#211813",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "2px solid #8b7450",
            background: "#d7c394",
            padding: "58px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontSize: 22,
              color: "#7d3028",
            }}
          >
            Texts · Translations · Study
          </div>
          <div style={{ display: "flex", alignItems: "stretch", gap: 34 }}>
            <div style={{ width: 8, background: "#7d3028" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "serif", fontSize: 76, lineHeight: 1.02 }}>
                The Hávamál
              </div>
              <div style={{ fontFamily: "serif", fontSize: 76, lineHeight: 1.02 }}>
                Archive
              </div>
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 30 }}>
            Read the text. Compare the translations.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
