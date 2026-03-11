"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Reusable input ─────────────────────────
function AuthInput({
  id, label, type = "text", placeholder, value, onChange, required, suffix,
}: {
  id: string; label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: "600", color: "#2A3C2F", marginBottom: "6px", letterSpacing: "0.01em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", height: "46px",
            padding: suffix ? "0 44px 0 14px" : "0 14px",
            fontFamily: "var(--font-dm-sans)", fontSize: "15px", color: "#162920",
            background: "#FAFCFA",
            border: `1.5px solid ${focused ? "#1A5C44" : "#D8DED9"}`,
            borderRadius: "12px", outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(26,92,68,0.08)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxSizing: "border-box",
          }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  const passwordChecks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
  };
  const isPasswordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isPasswordValid) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, role: "patient" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    if (data.session && data.user) {
      await supabase.from("users").upsert(
        { id: data.user.id, email: data.user.email, full_name: fullName, role: "patient" },
        { onConflict: "id", ignoreDuplicates: true }
      );
      window.location.href = "/dashboard";
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  // ── Success state ──
  if (success) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(26,92,68,0.08)", border: "1px solid rgba(26,92,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={28} color="#1A5C44" />
          </div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "26px", fontWeight: "700", color: "#162920", letterSpacing: "-0.025em", marginBottom: "10px" }}>
            Check your email
          </h1>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#7C9488", lineHeight: "1.7", marginBottom: "28px" }}>
            We sent a verification link to{" "}
            <span style={{ color: "#162920", fontWeight: "600" }}>{email}</span>.
            Confirm your email to activate your account.
          </p>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1A5C44", color: "#FFFFFF", fontFamily: "var(--font-dm-sans)", fontWeight: "600", fontSize: "14px", padding: "11px 22px", borderRadius: "12px", textDecoration: "none" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex" }}>

      {/* ── Left panel ─────────────────────────── */}
      <div
        className="auth-left-panel"
        style={{
          width: "44%", background: "#0C1810",
          display: "none", flexDirection: "column",
          justifyContent: "space-between", padding: "48px",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Watermark cross */}
        <div aria-hidden style={{ position: "absolute", bottom: "-60px", right: "-60px", opacity: 0.03, pointerEvents: "none" }}>
          <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
            <rect x="145" y="10" width="90" height="360" rx="20" fill="white"/>
            <rect x="10" y="145" width="360" height="90" rx="20" fill="white"/>
          </svg>
        </div>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }}/>

        {/* Logo */}
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

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div style={{ height: "1px", width: "32px", background: "#4D9A7F" }}/>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: "700", letterSpacing: "0.18em", textTransform: "uppercase", color: "#4D9A7F" }}>
              Join HealthLuma
            </span>
          </div>

          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(26px, 2.8vw, 34px)", fontWeight: "700", color: "#E8E5DE", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "20px" }}>
            Start your health
            <br />
            <span style={{ color: "#4D9A7F" }}>journey today.</span>
          </h2>

          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "rgba(190,218,200,0.5)", lineHeight: "1.75", marginBottom: "40px", maxWidth: "300px" }}>
            Book appointments, manage your records, and get AI-assisted care — all in one secure place.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                ),
                title: "Book in minutes",
                body: "Real-time slots, instant confirmation",
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: "Cover your family",
                body: "One Pro plan, unlimited members",
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                  </svg>
                ),
                title: "AI health assistant",
                body: "Prep intelligently before every visit",
              },
              {
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4D9A7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                ),
                title: "Digital records",
                body: "All your history in one place",
              },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(77,154,127,0.12)", border: "1px solid rgba(77,154,127,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: "600", color: "#E8E5DE", marginBottom: "2px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "rgba(190,218,200,0.38)" }}>
                    {item.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-playfair)", fontSize: "13px", fontStyle: "italic", color: "rgba(190,218,200,0.3)", position: "relative", zIndex: 1 }}>
          &ldquo;Because every health decision deserves clarity.&rdquo;
        </p>
      </div>

      {/* ── Right panel — Form ─────────────────── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", padding: "40px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "420px", padding: "8px 0" }}>

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
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "28px", fontWeight: "700", color: "#162920", letterSpacing: "-0.025em", marginBottom: "8px", lineHeight: "1.2" }}>
              Create your account
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#7C9488" }}>
              Already registered?{" "}
              <Link href="/login" style={{ color: "#1A5C44", fontWeight: "600", textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: "16px", padding: "12px 14px", background: "rgba(168,46,46,0.06)", border: "1px solid rgba(168,46,46,0.18)", borderRadius: "10px", fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "#A82E2E", display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <AuthInput
              id="fullName" label="Full Name"
              placeholder="Your full name"
              value={fullName} onChange={setFullName} required
            />

            <AuthInput
              id="email" label="Email Address" type="email"
              placeholder="you@healthluma.com"
              value={email} onChange={setEmail} required
            />

            {/* Password with strength */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: "600", color: "#2A3C2F", marginBottom: "6px", letterSpacing: "0.01em" }}>
                Create Password
              </label>
              <AuthInput
                id="password" label="" type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                value={password} onChange={setPassword} required
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#A8BDB5", display: "flex", alignItems: "center" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {password.length > 0 && (
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { ok: passwordChecks.length,    text: "8+ characters" },
                    { ok: passwordChecks.uppercase,  text: "Uppercase letter" },
                    { ok: passwordChecks.number,     text: "Number" },
                  ].map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: c.ok ? "#1A5C44" : "#A8BDB5", transition: "color 0.2s" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: c.ok ? "rgba(26,92,68,0.1)" : "rgba(168,189,181,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.ok && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1A5C44" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      {c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !fullName || !email}
              style={{
                width: "100%", height: "46px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                background: (loading || !isPasswordValid || !fullName || !email) ? "#C5D4CA" : "#1A5C44",
                color: "#FFFFFF",
                fontFamily: "var(--font-dm-sans)", fontWeight: "600", fontSize: "15px",
                border: "none", borderRadius: "12px",
                cursor: (loading || !isPasswordValid) ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => { if (!loading && isPasswordValid) (e.currentTarget as HTMLElement).style.background = "#154D3A"; }}
              onMouseLeave={(e) => { if (!loading && isPasswordValid) (e.currentTarget as HTMLElement).style.background = "#1A5C44"; }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating your account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Trust */}
          <div style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8BDB5" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "#A8BDB5" }}>
              Your medical data is encrypted and never shared.
            </span>
          </div>

          <p style={{ marginTop: "16px", textAlign: "center", fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "rgba(124,148,136,0.6)" }}>
            By creating an account, you agree to our{" "}
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
