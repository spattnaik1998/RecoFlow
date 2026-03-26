import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { buildDigestContent, renderDigestHTML } from "@/lib/digest-renderer";
import type { ExportStyle } from "@/types";

interface Props {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<{ format?: string }>;
}

// Public page — no auth required. Accessed by share link recipients.
export default async function SharePage({ params, searchParams }: Props) {
  const { shareId } = await params;
  const { format } = await searchParams;
  const isPrint = format === "print";

  const serviceClient = createServiceRoleClient();

  const { data: exportRow } = await serviceClient
    .from("exports")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (!exportRow || exportRow.status !== "ready") {
    notFound();
  }

  let html: string;
  try {
    const content = await buildDigestContent(exportRow.session_id, serviceClient);
    html = renderDigestHTML(content, exportRow.style as ExportStyle);
  } catch {
    notFound();
  }

  const printScript = isPrint
    ? `<script>window.addEventListener('load', () => window.print());</script>`
    : "";

  // Inject print trigger and CTA into the rendered HTML
  const withCta = html.replace(
    "</body>",
    `${printScript}
  <div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:12px;z-index:100">
    <a href="/?ref=share" style="display:inline-block;padding:10px 20px;background:#C8A96E;color:#0D0A07;font-family:'Georgia',serif;font-size:12px;text-decoration:none;letter-spacing:0.05em">
      Begin Your Own Consultation
    </a>
    <a href="?format=print" style="display:inline-block;padding:10px 20px;border:1px solid #C8A96E;color:#C8A96E;font-family:'Georgia',serif;font-size:12px;text-decoration:none;letter-spacing:0.05em">
      Save as PDF
    </a>
  </div>
</body>`
  );

  // Render the HTML directly into the page using dangerouslySetInnerHTML
  // The content is server-generated from our own database — not user-supplied
  return (
    <div
      dangerouslySetInnerHTML={{ __html: withCta }}
      style={{ minHeight: "100vh" }}
    />
  );
}

export const dynamic = "force-dynamic";
