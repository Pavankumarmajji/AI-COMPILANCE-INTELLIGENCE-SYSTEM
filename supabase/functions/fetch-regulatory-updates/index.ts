// Fetches real regulatory updates from public RSS/Atom feeds (RBI, SEBI, MCA, PIB) — no API keys required.
// Then summarizes each new entry with Lovable AI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedDef { regulator: string; url: string; }

// Public RSS/Atom feeds — no auth required
const FEEDS: FeedDef[] = [
  { regulator: "RBI",  url: "https://www.rbi.org.in/Scripts/Rss.aspx" },
  { regulator: "RBI",  url: "https://website.rbi.org.in/web/rbi/notifications/rss" },
  { regulator: "SEBI", url: "https://www.sebi.gov.in/sebirss.xml" },
  { regulator: "MCA",  url: "https://pib.gov.in/rss/lreleases.aspx" }, // PIB releases (incl. MCA)
];

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "").trim();
}

function parseFeed(xml: string) {
  const items: { title: string; link: string; description: string; pubDate: string | null }[] = [];
  // RSS <item> ... </item>
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const rssItems = xml.match(itemRegex) || [];
  for (const it of rssItems) {
    const title = decode((it.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || "");
    const link = decode((it.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)?.[1]) || "");
    const desc = decode((it.match(/<description\b[^>]*>([\s\S]*?)<\/description>/i)?.[1]) || "");
    const pub  = (it.match(/<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim() || null;
    if (title && link) items.push({ title, link, description: desc, pubDate: pub });
  }
  // Atom <entry>
  if (items.length === 0) {
    const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
    for (const e of entries) {
      const title = decode((e.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || "");
      const link = (e.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1]) || "";
      const desc = decode((e.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || e.match(/<content\b[^>]*>([\s\S]*?)<\/content>/i)?.[1]) || "");
      const pub  = (e.match(/<updated\b[^>]*>([\s\S]*?)<\/updated>/i)?.[1] || e.match(/<published\b[^>]*>([\s\S]*?)<\/published>/i)?.[1] || "").trim() || null;
      if (title && link) items.push({ title, link, description: desc, pubDate: pub });
    }
  }
  return items;
}

async function summarize(items: { title: string; description: string }[]): Promise<{ summary: string; severity: string }[]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey || items.length === 0) return items.map(() => ({ summary: "", severity: "medium" }));

  const prompt = `For each regulatory notification below, return a 1-sentence plain-English summary (max 30 words) and a severity (low/medium/high/critical). Reply ONLY with a JSON array in same order.\n\n${items.map((it, i) => `${i + 1}. ${it.title}\n${it.description.slice(0, 400)}`).join("\n\n")}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a compliance analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_summaries",
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      summary: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    },
                    required: ["summary", "severity"],
                  },
                },
              },
              required: ["results"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_summaries" } },
      }),
    });

    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return items.map(() => ({ summary: "", severity: "medium" }));
    }
    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { results: [] };
    return parsed.results || [];
  } catch (e) {
    console.error("summarize error", e);
    return items.map(() => ({ summary: "", severity: "medium" }));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const allNew: { regulator: string; title: string; summary: string; source_url: string; published_at: string | null }[] = [];

    for (const feed of FEEDS) {
      try {
        const r = await fetch(feed.url, { headers: { "User-Agent": "LexGuard/1.0 (+compliance bot)" } });
        if (!r.ok) { console.warn(`Feed ${feed.url} → ${r.status}`); continue; }
        const xml = await r.text();
        const parsed = parseFeed(xml).slice(0, 15);
        for (const p of parsed) {
          allNew.push({
            regulator: feed.regulator,
            title: p.title.slice(0, 500),
            summary: p.description.slice(0, 1000),
            source_url: p.link,
            published_at: p.pubDate ? new Date(p.pubDate).toISOString() : null,
          });
        }
      } catch (e) { console.warn("feed error", feed.url, e); }
    }

    // Dedupe against existing source_urls
    const urls = allNew.map(n => n.source_url);
    const { data: existing } = await supabase.from("regulatory_updates").select("source_url").in("source_url", urls);
    const existingSet = new Set((existing || []).map((e: any) => e.source_url));
    const fresh = allNew.filter(n => !existingSet.has(n.source_url));

    if (fresh.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, scanned: allNew.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AI summarize in batches of 8
    const enriched: any[] = [];
    for (let i = 0; i < fresh.length; i += 8) {
      const batch = fresh.slice(i, i + 8);
      const ai = await summarize(batch);
      batch.forEach((b, idx) => {
        enriched.push({
          ...b,
          ai_summary: ai[idx]?.summary || null,
          severity: ai[idx]?.severity || "medium",
        });
      });
    }

    const { error } = await supabase.from("regulatory_updates").insert(enriched);
    if (error) throw error;

    return new Response(JSON.stringify({ inserted: enriched.length, scanned: allNew.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
