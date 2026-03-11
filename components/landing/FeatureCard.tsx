"use client";

import { LucideIcon, ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
  badge?: string | null;
  staggerDown?: boolean;
  index?: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  body,
  badge,
  staggerDown = false,
  index = 0,
}: FeatureCardProps) {
  return (
    <div
      style={{
        marginTop: staggerDown ? "64px" : "0",
        background: "linear-gradient(160deg, #FFFFFF 0%, #FAFBF9 100%)",
        borderRadius: "18px",
        padding: "24px 20px 20px",
        boxShadow:
          "0 1px 2px rgba(22,41,32,0.04), 0 6px 20px rgba(22,41,32,0.07), 0 20px 48px rgba(22,41,32,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        height: "100%",
        border: "1px solid rgba(22, 41, 32, 0.06)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow =
          "0 1px 2px rgba(22,41,32,0.04), 0 10px 28px rgba(22,41,32,0.10), 0 28px 60px rgba(22,41,32,0.12)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow =
          "0 1px 2px rgba(22,41,32,0.04), 0 6px 20px rgba(22,41,32,0.07), 0 20px 48px rgba(22,41,32,0.08)";
      }}
    >
      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            background: "rgba(196, 151, 90, 0.10)",
            border: "1px solid rgba(196, 151, 90, 0.32)",
            borderRadius: "9999px",
            padding: "2px 8px",
            fontSize: "8.5px",
            fontWeight: "700",
            fontFamily: "var(--font-dm-sans)",
            color: "#7A6240",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {badge}
        </div>
      )}

      {/* Index number */}
      <span
        style={{
          position: "absolute",
          top: "14px",
          left: "18px",
          fontFamily: "var(--font-playfair)",
          fontSize: "10px",
          fontWeight: "700",
          color: "rgba(22, 41, 32, 0.15)",
          letterSpacing: "0.04em",
        }}
      >
        0{index + 1}
      </span>

      {/* Circular icon */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 35%, rgba(24,92,69,0.10) 0%, rgba(24,92,69,0.04) 100%)",
          border: "1.5px solid rgba(24, 92, 69, 0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "4px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 40%, rgba(24,92,69,0.07) 0%, transparent 70%)",
          }}
        />
        <Icon size={20} color="#185C45" strokeWidth={1.65} />
      </div>

      {/* Inner content — constrained width for readable line length */}
      <div style={{ maxWidth: "200px", width: "100%" }}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "17px",
            fontWeight: "700",
            color: "#162920",
            marginBottom: "8px",
            lineHeight: "1.3",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>

        {/* Body */}
        <p
          style={{
            color: "#527060",
            fontSize: "12.5px",
            fontFamily: "var(--font-dm-sans)",
            lineHeight: "1.7",
            margin: "0 0 16px",
          }}
        >
          {body}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          width: "24px",
          height: "1px",
          background: "rgba(24, 92, 69, 0.16)",
          marginBottom: "12px",
        }}
      />

      {/* CTA */}
      <a
        href="#"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "11.5px",
          fontWeight: "600",
          fontFamily: "var(--font-dm-sans)",
          color: "#185C45",
          textDecoration: "none",
          letterSpacing: "0.02em",
          transition: "gap 0.25s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.gap = "9px";
          el.style.color = "#0F3D2A";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.gap = "5px";
          el.style.color = "#185C45";
        }}
      >
        Learn more
        <ArrowRight size={11} strokeWidth={2.2} />
      </a>
    </div>
  );
}
