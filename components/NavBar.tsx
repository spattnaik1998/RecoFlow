"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Pages where the nav should be hidden entirely
const HIDDEN_ON = ["/", "/auth"];

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Keep in sync with auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  // Don't render on landing or auth pages, or when not logged in
  if (HIDDEN_ON.includes(pathname) || !user) return null;

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard redirect so all React state, server cache, and cookies are fully cleared
    window.location.href = "/";
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background:
          "linear-gradient(to bottom, rgba(13,10,7,0.95) 0%, rgba(13,10,7,0) 100%)",
        borderBottom: "1px solid rgba(200,169,110,0.1)",
      }}
    >
      {/* Brand */}
      <Link
        href="/enter"
        className="font-cinzel text-sm tracking-widest uppercase"
        style={{ color: "rgba(200,169,110,0.7)" }}
      >
        RecoFlow
      </Link>

      {/* Right-side actions */}
      <div className="flex items-center gap-6">
        <Link
          href="/library"
          className="font-fell italic text-sm"
          style={{ color: "rgba(232,213,183,0.55)" }}
        >
          Your Library
        </Link>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="font-cinzel text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200"
          style={{
            border: "1px solid rgba(200,169,110,0.35)",
            color: "rgba(200,169,110,0.7)",
            background: "transparent",
            cursor: signingOut ? "not-allowed" : "pointer",
            opacity: signingOut ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!signingOut) {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(200,169,110,0.75)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(200,169,110,1)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(200,169,110,0.06)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(200,169,110,0.35)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(200,169,110,0.7)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          {signingOut ? "Leaving..." : "Sign Out"}
        </button>
      </div>
    </nav>
  );
}
