"use client";

import { Bot, Calendar, Heart, FileText } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    Icon: Bot,
    title: "AI Health Assistant",
    body: "Describe your symptoms in plain language. Our AI recommends the right appointment type and helps you book — available 24/7 on every page.",
    badge: "Signature Feature",
  },
  {
    Icon: Calendar,
    title: "Instant Online Booking",
    body: "See real available time slots. Pick the one that works. Pay securely online and get instant confirmation. Done in under a minute.",
    badge: null,
  },
  {
    Icon: Heart,
    title: "Family Care Membership",
    body: "$150/year. 20% off every visit for you, your spouse, your kids, and your parents. Priority slots and same-day urgent booking included.",
    badge: null,
  },
  {
    Icon: FileText,
    title: "Digital Medical Records",
    body: "Upload reports, view prescriptions, and download visit summaries — all in one place. Your complete health history, accessible anytime.",
    badge: null,
  },
];

export default function FeaturesSection() {
  return (
    <>
      <style>{`
        .hl-feat-section {
          position: relative;
          overflow: hidden;
          padding: 2ss6px 0 0;
        }
        .hl-feat-bg-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 52%;
          background: #FFFFFF;
          z-index: 0;
        }
        .hl-feat-bg-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 48%;
          background: #162920;
          z-index: 0;
        }
        .hl-feat-bg-bottom::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(24,92,69,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .hl-feat-content {
          position: relative;
          z-index: 1;
        }
        .hl-feat-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .hl-feat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          align-items: flex-start;
        }
        .hl-feat-stagger {
          margin-top: 54px;
        }
        .hl-feat-footer {
          padding: 48px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
        }
        .hl-feat-stat {
          text-align: center;
        }
        .hl-feat-stat-num {
          font-family: var(--font-playfair);
          font-size: 36px;
          font-weight: 700;
          color: #E8E5DE;
          line-height: 1;
          letter-spacing: -0.02em;
          display: block;
          margin-bottom: 6px;
        }
        .hl-feat-stat-label {
          font-family: var(--font-dm-sans);
          font-size: 12px;
          color: rgba(232,229,222,0.55);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .hl-feat-divider {
          width: 1px;
          height: 40px;
          background: rgba(232,229,222,0.15);
        }
        @media (max-width: 1100px) {
          .hl-feat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
          .hl-feat-bg-top {
            height: 38%;
          }
          .hl-feat-bg-bottom {
            height: 62%;
          }
          .hl-feat-footer {
            gap: 32px;
          }
        }
        @media (max-width: 580px) {
          .hl-feat-section {
            padding: 28px 0 0;
          }
          .hl-feat-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .hl-feat-stagger {
            margin-top: 0;
          }
          .hl-feat-header {
            margin-bottom: 32px;
          }
          .hl-feat-footer {
            padding: 36px 0;
            gap: 20px;
            flex-wrap: wrap;
          }
          .hl-feat-stat-num {
            font-size: 26px;
          }
        }
      `}</style>

      <section className="hl-feat-section">
        <div className="hl-feat-bg-top" />
        <div className="hl-feat-bg-bottom" />

        <div className="hl-feat-content hl-container">
          {/* Section Header */}
          <ScrollReveal>
            <div className="hl-feat-header">
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(26px, 3.2vw, 42px)",
                  fontWeight: "700",
                  color: "#162920",
                  lineHeight: "1.15",
                  letterSpacing: "-0.025em",
                  marginBottom: "16px",
                  marginTop: "4px",
                }}
              >
                Your clinic visit,{" "}
                <em style={{ fontStyle: "italic", fontWeight: "700" }}>
                  reimagined.
                </em>
              </h2>
              <p
                style={{
                  color: "#527060",
                  fontSize: "15px",
                  fontFamily: "var(--font-dm-sans)",
                  maxWidth: "420px",
                  margin: "0 auto",
                  lineHeight: "1.7",
                }}
              >
                Four systems working behind the scenes so your only job is{" "}
                <span style={{ color: "#162920", fontWeight: "500" }}>
                  showing up.
                </span>
              </p>
            </div>
          </ScrollReveal>

          {/* Staggered 4-card grid */}
          <div className="hl-feat-grid">
            {FEATURES.map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={i % 2 !== 0 ? "hl-feat-stagger" : ""}>
                  <FeatureCard
                    icon={feature.Icon}
                    title={feature.title}
                    body={feature.body}
                    badge={feature.badge}
                    index={i}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Stats row in dark zone */}
          <ScrollReveal delay={200}>
            <div className="hl-feat-footer">
              <div className="hl-feat-stat">
                <span className="hl-feat-stat-num">24/7</span>
                <span className="hl-feat-stat-label">AI Available</span>
              </div>
              <div className="hl-feat-divider" />
              <div className="hl-feat-stat">
                <span className="hl-feat-stat-num">&lt;60s</span>
                <span className="hl-feat-stat-label">To Book</span>
              </div>
              <div className="hl-feat-divider" />
              <div className="hl-feat-stat">
                <span className="hl-feat-stat-num">20%</span>
                <span className="hl-feat-stat-label">Member Savings</span>
              </div>
              <div className="hl-feat-divider" />
              <div className="hl-feat-stat">
                <span className="hl-feat-stat-num">4.9★</span>
                <span className="hl-feat-stat-label">Patient Rating</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
