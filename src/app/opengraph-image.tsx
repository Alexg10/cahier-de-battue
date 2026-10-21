import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

/** Image de partage (WhatsApp, Facebook, SMS…) : tuile verte, sapin, accroche. */
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#2f6b3a",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#ffffff",
          }}
        >
          <svg
            width={60}
            height={60}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2f6b3a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" />
            <path d="M12 22v-3" />
          </svg>
        </div>
        <span style={{ fontSize: 44, fontWeight: 700 }}>{SITE_NAME}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
          {SITE_TAGLINE}
        </span>
        <span style={{ fontSize: 30, opacity: 0.85 }}>
          Pointage signé · Tableau de chasse · Partage du gibier · Hors réseau
        </span>
      </div>

      <span style={{ fontSize: 30, opacity: 0.75 }}>
        {SITE_URL.replace(/^https?:\/\//, "")}
      </span>
    </div>,
    size,
  );
}
