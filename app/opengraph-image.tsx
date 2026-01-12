import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
            Data-driven insights into HDB prices, transport burden, school
            pressure, and living comfort.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 20, opacity: 0.85 }}>
            sgeye.vercel.app
          </div>
          <div
            style={{
              fontSize: 18,
              opacity: 0.8,
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            Neighbourhood • HDB • Transport • Schools
          </div>
        </div>
      </div>
    ),
    size
  );
}

