import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecoFlow — The Library of Nyx",
  description:
    "Discover your next book at the thematic intersection of everything you are currently reading. Guided by Nyx, the AI librarian.",
  keywords: ["book recommendations", "AI", "reading", "thematic intersection"],
  openGraph: {
    title: "RecoFlow — The Library of Nyx",
    description:
      "An AI librarian who finds your next book at the intersection of all you are reading.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=IM+Fell+English:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {/* Film grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />
        {/* Edge vignette */}
        <div className="vignette" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
