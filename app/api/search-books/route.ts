import { NextRequest, NextResponse } from "next/server";
import { searchBook } from "@/lib/serper";

export async function POST(req: NextRequest) {
  try {
    const { title, author } = await req.json() as { title: string; author: string };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const results = await searchBook(title, author ?? "");
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[search-books]", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
