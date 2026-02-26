import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { analyzeBooks } from "@/lib/book-analyzer";
import type { AnalyzeBooksRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as AnalyzeBooksRequest;
    const { books, session_id } = body;

    if (!books || books.length === 0) {
      return NextResponse.json({ error: "At least one book is required" }, { status: 400 });
    }

    // Analyze books (parallel Serper + single Claude call)
    const intersection = await analyzeBooks(books);

    // Persist books + analysis to Supabase
    const serviceClient = createServiceRoleClient();

    await serviceClient.from("current_books").insert(
      books.map((book) => ({
        session_id,
        user_id: user.id,
        title: book.title,
        author: book.author ?? null,
        goodreads_url: book.goodreads_url ?? null,
        themes: intersection.books.find((b) => b.title === book.title)?.themes ?? [],
        raw_analysis: intersection.books.find((b) => b.title === book.title) ?? null,
      }))
    );

    return NextResponse.json({ intersection, session_id });
  } catch (err) {
    console.error("[analyze-books]", err);
    return NextResponse.json(
      { error: "Analysis failed. The texts resisted my reading." },
      { status: 500 }
    );
  }
}
