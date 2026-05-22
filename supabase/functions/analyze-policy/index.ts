import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { title, content, companyId } = await req.json();
    if (!title || !content || !companyId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: corsHeaders });
    }
    if (typeof content !== "string" || content.length > 50000) {
      return new Response(JSON.stringify({ error: "Content too long" }), { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a senior compliance officer specializing in Indian regulations (RBI, SEBI, DPDP, MCA) and global standards (GDPR, HIPAA). Analyze policy text for compliance gaps and risks." },
          { role: "user", content: `Analyze this policy and return: a compliance score 0-100, top 5 gaps, top 3 strengths, and a 1-line verdict.\n\nTitle: ${title}\n\nPolicy:\n${content.slice(0, 30000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_analysis",
            parameters: {
              type: "object",
              properties: {
                score: { type: "integer", minimum: 0, maximum: 100 },
                verdict: { type: "string" },
                gaps: { type: "array", items: { type: "string" } },
                strengths: { type: "array", items: { type: "string" } },
                applicable_regulations: { type: "array", items: { type: "string" } },
              },
              required: ["score", "verdict", "gaps", "strengths"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again later" }), { status: 429, headers: corsHeaders });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: corsHeaders });
    if (!aiRes.ok) throw new Error("AI gateway error " + aiRes.status);

    const data = await aiRes.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const analysis = args ? JSON.parse(args) : { score: 50, verdict: "Unable to analyze", gaps: [], strengths: [] };

    const { error } = await supabase.from("policies").insert({
      company_id: companyId,
      uploaded_by: user.id,
      title,
      content: content.slice(0, 50000),
      ai_analysis: analysis,
      compliance_score: analysis.score,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ score: analysis.score, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
