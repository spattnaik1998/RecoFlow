import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "RecoFlow — Intelligence-Driven Book Recommendations",
  description:
    "RecoFlow analyzes what your team is reading, finds the hidden connections between books, and recommends exactly what to read next.",
  keywords: ["book recommendations", "reading", "team learning", "L&D", "professional development"],
  openGraph: {
    title: "RecoFlow — Intelligence-Driven Book Recommendations",
    description:
      "Smarter reading, for teams that think. Data-driven book recommendations that compound over time.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-base antialiased font-sans">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
