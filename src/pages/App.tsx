import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, RefreshCw, FileText, AlertTriangle, TrendingUp, Sparkles, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface RegUpdate {
  id: string; regulator: string; title: string; ai_summary: string | null; summary: string | null;
  source_url: string; severity: string; published_at: string | null; fetched_at: string;
}

const App = () => {
  const [session, setSession] = useState<any>(undefined);
  const [profile, setProfile] = useState<any>(null);
  const [updates, setUpdates] = useState<RegUpdate[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyContent, setPolicyContent] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    loadProfile();
    loadUpdates();
    loadPolicies();
    const channel = supabase
      .channel("reg-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "regulatory_updates" }, () => loadUpdates())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*, companies(*)").eq("id", session.user.id).maybeSingle();
    setProfile(data);
  };
  const loadUpdates = async () => {
    const { data } = await supabase.from("regulatory_updates").select("*")
      .order("published_at", { ascending: false, nullsFirst: false }).limit(50);
    setUpdates((data as RegUpdate[]) || []);
  };
  const loadPolicies = async () => {
    const { data } = await supabase.from("policies").select("*").order("created_at", { ascending: false });
    setPolicies(data || []);
  };

  const refreshFeeds = async () => {
    setRefreshing(true);
    const { data, error } = await supabase.functions.invoke("fetch-regulatory-updates");
    setRefreshing(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Fetched ${data?.inserted ?? 0} new updates`);
    loadUpdates();
  };

  const analyzePolicy = async () => {
    if (!policyTitle || !policyContent) { toast.error("Title and content required"); return; }
    if (!profile?.company_id) { toast.error("Complete onboarding first"); return; }
    setAnalyzing(true);
    const { data, error } = await supabase.functions.invoke("analyze-policy", {
      body: { title: policyTitle, content: policyContent, companyId: profile.company_id },
    });
    setAnalyzing(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Analysis complete · score ${data.score}/100`);
    setPolicyTitle(""); setPolicyContent("");
    loadPolicies();
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  if (session === undefined) return null;
  if (!session) return <Navigate to="/auth" replace />;

  const sevColor = (s: string) => s === "critical" || s === "high" ? "destructive"
    : s === "medium" ? "default" : "secondary";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">LexGuard<span className="text-primary">.AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-right hidden sm:block">
              <div>{profile?.full_name || session.user.email}</div>
              <div className="text-xs text-muted-foreground">{profile?.companies?.name || "—"}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Compliance war-room</h1>
            <p className="text-muted-foreground text-sm">Live data from RBI · SEBI · MCA · IRDAI feeds</p>
          </div>
          <Button onClick={refreshFeeds} disabled={refreshing}>
            {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Pull latest
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Live updates", v: updates.length, i: TrendingUp },
            { l: "Critical alerts", v: updates.filter(u => u.severity === "critical" || u.severity === "high").length, i: AlertTriangle },
            { l: "Policies analyzed", v: policies.length, i: FileText },
            { l: "Avg compliance", v: policies.length ? Math.round(policies.reduce((a, p) => a + (p.compliance_score || 0), 0) / policies.length) + "%" : "—", i: Sparkles },
          ].map(s => (
            <Card key={s.l} className="p-5 bg-card-gradient">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.l}</span>
                <s.i className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{s.v}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live regulatory feed */}
          <Card className="lg:col-span-2 p-6 bg-card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Live regulatory feed</h2>
              <span className="text-xs text-muted-foreground">{updates.length} items · realtime</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {updates.length === 0 && (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No updates yet. Click <strong>Pull latest</strong> above to fetch real RBI/SEBI/MCA notifications.
                </div>
              )}
              {updates.map(u => (
                <a key={u.id} href={u.source_url} target="_blank" rel="noopener noreferrer"
                  className="block rounded-lg border border-border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className="text-primary border-primary/30">{u.regulator}</Badge>
                    <Badge variant={sevColor(u.severity) as any}>{u.severity}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {u.published_at ? new Date(u.published_at).toLocaleDateString() : new Date(u.fetched_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-medium text-sm mb-1">{u.title}</div>
                  {u.ai_summary && (
                    <div className="text-xs text-muted-foreground leading-relaxed mt-2 flex gap-2">
                      <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span>{u.ai_summary}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </Card>

          {/* Policy analyzer */}
          <Card className="p-6 bg-card-gradient">
            <h2 className="font-semibold mb-1 flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> AI Policy Analyzer</h2>
            <p className="text-xs text-muted-foreground mb-4">Paste policy text — AI scores compliance & flags gaps.</p>
            <div className="space-y-3">
              <Input placeholder="Policy title" value={policyTitle} onChange={e => setPolicyTitle(e.target.value)} />
              <Textarea placeholder="Paste full policy text here..." rows={6}
                value={policyContent} onChange={e => setPolicyContent(e.target.value)} />
              <Button onClick={analyzePolicy} disabled={analyzing} className="w-full">
                {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Analyze
              </Button>
            </div>

            {policies.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Recent</div>
                {policies.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-border rounded-lg p-2.5 text-sm">
                    <span className="truncate flex-1">{p.title}</span>
                    <Badge variant={p.compliance_score >= 75 ? "default" : "destructive"}>{p.compliance_score ?? "—"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default App;
