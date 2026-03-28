"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Input component ────────────────────────
function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  suffix?: React.ReactNode;
  hint?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <label
          htmlFor={id}
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            fontWeight: "600",
            color: "#2A3C2F",
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </label>
        {hint}
      </div>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: "46px",
            padding: "0 44px 0 14px",
            fontFamily: "var(--font-dm-sans)",
            fontSize: "15px",
            color: "#162920",
            background: "#FAFCFA",
            border: `1.5px solid ${focused ? "#1A5C44" : "#D8DED9"}`,
            borderRadius: "12px",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(26,92,68,0.08)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxSizing: "border-box",
          }}
        />
        {suffix && (
          <div style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
          }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Role is injected into app_metadata by the JWT hook on sign-in.
    // No DB query needed — the layouts enforce role protection server-side.
    const role = data.user.app_metadata?.role as string | undefined;
    window.location.href = role === "doctor" ? "/doctor" : "/dashboard";
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex" }}>

      {/* ── Left panel ─────────────────────────── */}
      <div
        style={{
          width: "44%",
          background: "#0C1810",
          display: "none",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
        className="auth-left-panel"
      >
        {/* Decorative cross watermark */}
        <div aria-hidden style={{
          position: "absolute",
          bottom: "-60px",
          right: "-60px",
          opacity: 0.03,
          pointerEvents: "none",
        }}>
          <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
            <rect x="145" y="10"  width="90" height="360" rx="20" fill="white"/>
            <rect x="10"  y="145" width="360" height="90" rx="20" fill="white"/>
          </svg>
        </div>

        {/* Subtle grid */}
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}/>

        {/* Top — Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none", position: "relative", zIndex: 1 }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg, #1A5C44 0%, #2E7D5E 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(26,92,68,0.4)" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="5" y="1" width="3" height="11" rx="1.2" fill="white"/>
              <rect x="1" y="5" width="11" height="3" rx="1.2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "19px", fontWeight: "700", color: "#E8E5DE", letterSpacing: "-0.025em" }}>
            HealthLuma
          </span>
        </Link>

        {/* Middle — Statement */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div style={{ height: "1px", width: "32px", background: "#C4975A" }}/>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase", color: "#C4975A" }}>
              Welcome back
            </span>
          </div>

          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(26px, 2.8vw, 34px)", fontWeight: "700", color: "#E8E5DE", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "20px" }}>
            Your health,
            <br />
            <span style={{ color: "#C4975A" }}>remembered.</span>
          </h2>

          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "rgba(190,218,200,0.5)", lineHeight: "1.75", marginBottom: "40px", maxWidth: "300px" }}>
            All your appointments, records, and care plans — exactly where you left them.
          </p>

          {/* Trust indicators */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                label: "256-bit AES encryption",
                sub: "Military-grade data protection",
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                ),
                label: "HIPAA-aligned platform",
                sub: "Built for healthcare privacy",
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                ),
                label: "Same-week appointments",
                sub: "No waiting room delays",
              },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(26,92,68,0.2)", border: "1px solid rgba(77,154,127,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: "600", color: "#E8E5DE", marginBottom: "2px" }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "rgba(190,218,200,0.38)" }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Quote */}
        <p style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontStyle: "italic", color: "rgba(190,218,200,0.3)", position: "relative", zIndex: 1 }}>
          &ldquo;Because your health deserves complete clarity.&rdquo;
        </p>
      </div>

      {/* ── Right panel — Form ─────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none", marginBottom: "36px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, #1A5C44 0%, #2E7D5E 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                  <rect x="5" y="1" width="3" height="11" rx="1.2" fill="white"/>
                  <rect x="1" y="5" width="11" height="3" rx="1.2" fill="white"/>
                </svg>
              </div>
              <span style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", fontWeight: "700", color: "#162920", letterSpacing: "-0.025em" }}>
                HealthLuma
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "28px", fontWeight: "700", color: "#162920", letterSpacing: "-0.025em", marginBottom: "8px", lineHeight: "1.2" }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#7C9488" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#1A5C44", fontWeight: "600", textDecoration: "none" }}>
                Create one free
              </Link>
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              height: "46px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "#FFFFFF",
              border: "1.5px solid #D8DED9",
              borderRadius: "12px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: "600",
              fontSize: "14px",
              color: "#162920",
              cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
              marginBottom: "24px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1A5C44"; (e.currentTarget as HTMLElement).style.background = "#FAFCFA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D8DED9"; (e.currentTarget as HTMLElement).style.background = "#FFFFFF"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ flex: 1, height: "1px", background: "#EAF0EA" }}/>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "#A8BDB5" }}>
              or sign in with email
            </span>
            <div style={{ flex: 1, height: "1px", background: "#EAF0EA" }}/>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: "16px",
              padding: "12px 14px",
              background: "rgba(168,46,46,0.06)",
              border: "1px solid rgba(168,46,46,0.18)",
              borderRadius: "10px",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              color: "#A82E2E",
              display: "flex",
              gap: "8px",
              alignItems: "flex-start",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <AuthInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@healthluma.com"
              value={email}
              onChange={setEmail}
              required
            />

            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              required
              hint={
                <Link href="/forgot-password" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "#7C9488", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#1A5C44"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#7C9488"}
                >
                  Forgot password?
                </Link>
              }
              suffix={
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#A8BDB5", display: "flex", alignItems: "center" }}>
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              }
            />

            {/* Remember me */}
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div
                onClick={() => setRemember(!remember)}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "5px",
                  border: `1.5px solid ${remember ? "#1A5C44" : "#D8DED9"}`,
                  background: remember ? "#1A5C44" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
              >
                {remember && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "#476355" }}>
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "46px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: loading ? "#476355" : "#1A5C44",
                color: "#FFFFFF",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: "600",
                fontSize: "15px",
                border: "none",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s, transform 0.1s",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#154D3A"; }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#1A5C44"; }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing you in…
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Trust line */}
          <div style={{ marginTop: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8BDB5" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "#A8BDB5" }}>
              Your medical data is encrypted and never shared.
            </span>
          </div>

          {/* Legal */}
          <p style={{ marginTop: "20px", textAlign: "center", fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "rgba(124,148,136,0.6)" }}>
            By continuing, you agree to our{" "}
            <Link href="/" style={{ color: "#7C9488", textDecoration: "underline" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/" style={{ color: "#7C9488", textDecoration: "underline" }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-left-panel { display: flex !important; }
        }
        .auth-mobile-logo { display: block; }
        @media (min-width: 1024px) {
          .auth-mobile-logo { display: none; }
        }
      `}</style>
    </div>
  );
}
