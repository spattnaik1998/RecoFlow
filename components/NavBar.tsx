"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CircleSwitcher from "@/components/CircleSwitcher";
import type { User } from "@supabase/supabase-js";

const HIDDEN_ON = ["/", "/auth"];

const NAV_LINKS = [
  { href: "/enter",   label: "Consult" },
  { href: "/library", label: "Library" },
  { href: "/profile", label: "Profile" },
  { href: "/circles", label: "Circles" },
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(10, 8, 5, 0.97)"
          : "linear-gradient(to bottom, rgba(13,10,7,0.92) 0%, rgba(13,10,7,0) 100%)",
        borderBottom: scrolled ? "1px solid rgba(200,169,110,0.1)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Brand */}
        <Link
          href="/enter"
          className="font-cinzel tracking-widest uppercase transition-opacity duration-200 hover:opacity-80"
          style={{ color: "var(--gold)", fontSize: "0.8rem", letterSpacing: "0.3em" }}
        >
          RecoFlow
        </Link>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{
                  color: active ? "var(--parchment-mid)" : undefined,
                  fontStyle: "italic",
                }}
              >
                {label}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: 0,
                      width: "100%",
                      height: 1,
                      background: "var(--gold-dim)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Circle switcher + sign out */}
        <div className="flex items-center gap-6">
          <CircleSwitcher />

          <div
            style={{
              width: 1,
              height: 14,
              background: "rgba(200,169,110,0.15)",
            }}
          />

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="font-cinzel uppercase tracking-widest transition-all duration-200"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.2em",
              color: signingOut ? "var(--parchment-dim)" : "rgba(200,169,110,0.45)",
              background: "none",
              border: "none",
              cursor: signingOut ? "not-allowed" : "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (!signingOut)
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.85)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.45)";
            }}
          >
            {signingOut ? "Leaving…" : "Sign Out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
