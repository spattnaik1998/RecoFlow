"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CircleSwitcher from "@/components/CircleSwitcher";
import type { User } from "@supabase/supabase-js";

const HIDDEN_ON = ["/", "/auth"];

const NAV_LINKS = [
  { href: "/enter",       label: "New Session" },
  { href: "/library",     label: "Library" },
  { href: "/profile",     label: "Profile" },
  { href: "/circles",     label: "Circles" },
  { href: "/preferences", label: "Preferences" },
];

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (HIDDEN_ON.includes(pathname) || !user) return null;

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10,14,26,0.95)"
          : "rgba(10,14,26,0.7)",
        borderBottom: scrolled
          ? "1px solid rgba(99,135,255,0.12)"
          : "1px solid transparent",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <Link
          href="/enter"
          className="flex items-center gap-2 group"
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            style={{ background: "var(--brand)", boxShadow: "0 0 12px rgba(99,135,255,0.35)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 11L7 3L12 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8.5H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span
            className="font-semibold tracking-tight transition-colors duration-200"
            style={{ fontSize: "0.938rem", color: "var(--text-primary)" }}
          >
            RecoFlow
          </span>
        </Link>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                data-active={active}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <CircleSwitcher />

          <div style={{ width: 1, height: 16, background: "rgba(99,135,255,0.12)" }} />

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm transition-colors duration-150 disabled:opacity-50"
            style={{
              color: "var(--text-tertiary)",
              background: "none",
              border: "none",
              cursor: signingOut ? "not-allowed" : "pointer",
              padding: "4px 8px",
              borderRadius: 6,
            }}
            onMouseEnter={(e) => {
              if (!signingOut)
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-tertiary)";
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
