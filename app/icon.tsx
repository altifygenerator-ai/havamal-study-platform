import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d7c394",
          color: "#211813",
          border: "5px solid #17120f",
          fontFamily: "serif",
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        H
        <span
          style={{
            position: "absolute",
            right: 4,
            top: 4,
            width: 10,
            height: 10,
            background: "#7d3028",
          }}
        />
      </div>
    ),
    size,
  );
}
