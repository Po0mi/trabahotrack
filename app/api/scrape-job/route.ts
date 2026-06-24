import { NextRequest } from "next/server";

function parseTitleForJobDetails(raw: string): { company?: string; role?: string } {
  const title = raw
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(
      /\s*[|\-–]\s*(LinkedIn|Indeed\.com|Glassdoor|ZipRecruiter|Monster|CareerBuilder|Dice|Handshake|Workday|Greenhouse|Lever|Jobvite|AngelList|Wellfound|Built ?In)\s*$/i,
      "",
    )
    .trim();

  // "Role at Company" — LinkedIn title format
  const atMatch = title.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) return { role: atMatch[1].trim(), company: atMatch[2].trim() };

  // "Role | Company"
  const pipeMatch = title.match(/^(.+?)\s*\|\s*(.+)$/);
  if (pipeMatch) return { role: pipeMatch[1].trim(), company: pipeMatch[2].trim() };

  // "Role - Company" or "Role - Company - Location, ST"
  const dashParts = title.split(/\s+-\s+/);
  if (dashParts.length >= 2) {
    return { role: dashParts[0].trim(), company: dashParts[1].trim() };
  }

  return {};
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return Response.json({ error: "Missing url" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return Response.json({ error: "Invalid URL protocol" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = await res.text();

    // Try every JSON-LD block for a JobPosting schema
    const jsonLdBlocks = [
      ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    ];
    for (const block of jsonLdBlocks) {
      try {
        const data: unknown = JSON.parse(block[1]);
        const items = Array.isArray(data) ? data : [data];
        const job = items.find(
          (d) => d && typeof d === "object" && (d as Record<string, unknown>)["@type"] === "JobPosting",
        ) as Record<string, unknown> | undefined;
        if (job) {
          const org = job["hiringOrganization"] as Record<string, unknown> | undefined;
          const company = (org?.["name"] as string) ?? "";
          const role = (job["title"] as string) ?? "";
          if (company || role) return Response.json({ company, role });
        }
      } catch {
        // malformed JSON-LD — skip block
      }
    }

    // Fall back to <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleText = titleMatch?.[1]?.trim() ?? "";
    const { company = "", role = "" } = parseTitleForJobDetails(titleText);

    return Response.json({ company, role });
  } catch {
    return Response.json({ error: "Failed to fetch page" }, { status: 502 });
  }
}
