import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #1D4ED8 0%, #0B1020 55%, #111827 100%)",
          color: "white",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>
            Singapore Data Eye
          </div>
          <div style={{ fontSize: 28, opacity: 0.92, maxWidth: 880 }}>
            Compare neighbourhood trade-offs with official data.
          </div>
        </div>

        <div style={{ fontSize: 20, opacity: 0.85 }}>sgeye.vercel.app</div>
      </div>
    ),
    size
  );
}

