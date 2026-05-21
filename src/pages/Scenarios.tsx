import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Plus, Save, Trash2, Pin, PinOff, Activity, Globe, Building2, Play, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type BlockKind = 'market' | 'macro' | 'asset';

interface Block {
  id: string;
  kind: BlockKind;
  label: string;
  params: Record<string, number | string>;
}

interface SavedScenario {
  id: string;
  name: string;
  description: string | null;
  blocks: Block[];
  is_pinned: boolean;
  created_at: string;
}

const blockTemplates: Record<BlockKind, { label: string; icon: typeof Activity; tone: string; defaults: Record<string, number | string> }> = {
  market: {
    label: 'Market Shock',
    icon: Activity,
    tone: 'text-bearish border-bearish/30 bg-bearish/5',
    defaults: { equity_pct: -30, credit_bps: 200, vix_mult: 3 },
  },
  macro: {
    label: 'Macro Shift',
    icon: Globe,
    tone: 'text-primary border-primary/30 bg-primary/5',
    defaults: { inflation_pct: 3, rate_bps: 150, usd_pct: 8 },
  },
  asset: {
    label: 'Asset-Specific',
    icon: Building2,
    tone: 'text-accent border-accent/30 bg-accent/5',
    defaults: { symbol: 'AAPL', shock_pct: -15 },
  },
};

const newBlock = (kind: BlockKind): Block => ({
  id: crypto.randomUUID(),
  kind,
  label: blockTemplates[kind].label,
  params: { ...blockTemplates[kind].defaults },
});

export default function Scenarios() {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Scenario Builder | OutputLens'; }, []);

  const fetchScenarios = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await (supabase as any)
      .from('saved_scenarios')
      .select('*')
      .eq('user_id', session.user.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    setScenarios((data as SavedScenario[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchScenarios(); }, [fetchScenarios]);

  const addBlock = (kind: BlockKind) => setBlocks(b => [...b, newBlock(kind)]);
  const removeBlock = (id: string) => setBlocks(b => b.filter(x => x.id !== id));
  const updateParam = (id: string, key: string, value: number | string) =>
    setBlocks(b => b.map(x => x.id === id ? { ...x, params: { ...x.params, [key]: value } } : x));

  const handleSave = async () => {
    if (!name.trim() || blocks.length === 0) {
      toast({ title: 'Add a name and at least one block', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }
    const { error } = await (supabase as any).from('saved_scenarios').insert({
      user_id: session.user.id,
      name: name.trim(),
      description: description.trim() || null,
      blocks,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Scenario saved', description: `"${name}" is now in your library.` });
    setName(''); setDescription(''); setBlocks([]);
    fetchScenarios();
  };

  const togglePin = async (s: SavedScenario) => {
    await (supabase as any).from('saved_scenarios').update({ is_pinned: !s.is_pinned }).eq('id', s.id);
    fetchScenarios();
  };

  const remove = async (id: string) => {
    await (supabase as any).from('saved_scenarios').delete().eq('id', id);
    fetchScenarios();
  };

  const loadScenario = (s: SavedScenario) => {
    setName(s.name);
    setDescription(s.description || '');
    setBlocks(s.blocks || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell>
      <div className="section-container py-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-accent/10">
              <Wand2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-foreground">Scenario Builder</h1>
              <p className="text-sm text-muted-foreground">Compose shocks, save them, replay against any position</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Canvas */}
            <div className="lg:col-span-8 space-y-4">
              {/* Name + description */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Scenario name
                  </Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder='e.g. "2008-style credit shock"'
                    className="font-mono mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Description (optional)
                  </Label>
                  <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What this scenario stresses"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Block palette */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-1">
                  Add block:
                </span>
                {(Object.keys(blockTemplates) as BlockKind[]).map(k => {
                  const T = blockTemplates[k];
                  const Icon = T.icon;
                  return (
                    <button
                      key={k}
                      onClick={() => addBlock(k)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-colors hover:opacity-80',
                        T.tone
                      )}
                    >
                      <Plus className="h-3 w-3" />
                      <Icon className="h-3 w-3" />
                      {T.label}
                    </button>
                  );
                })}
              </div>

              {/* Canvas blocks */}
              {blocks.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/10 p-12 text-center">
                  <Wand2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Drop blocks above to start composing a scenario.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map(b => {
                    const T = blockTemplates[b.kind];
                    const Icon = T.icon;
                    return (
                      <div key={b.id} className={cn('rounded-lg border p-4', T.tone)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-mono uppercase tracking-wider font-semibold">
                              {T.label}
                            </span>
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeBlock(b.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {Object.entries(b.params).map(([k, v]) => (
                            <div key={k}>
                              <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                {k.replace(/_/g, ' ')}
                              </Label>
                              <Input
                                value={String(v)}
                                onChange={e => {
                                  const next = typeof v === 'number' ? Number(e.target.value) : e.target.value;
                                  updateParam(b.id, k, isNaN(next as number) ? e.target.value : next);
                                }}
                                className="font-mono text-sm mt-1 bg-background"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Save bar */}
              {blocks.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {blocks.length} block{blocks.length === 1 ? '' : 's'} composed
                  </div>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Save Scenario
                  </Button>
                </div>
              )}
            </div>

            {/* Saved scenarios sidebar */}
            <aside className="lg:col-span-4">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="font-display font-semibold text-foreground">Saved scenarios</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">{scenarios.length} in library</p>
                </div>
                {loading ? (
                  <div className="p-6 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                  </div>
                ) : scenarios.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Your saved scenarios will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {scenarios.map(s => (
                      <div key={s.id} className="p-3 hover:bg-muted/30 group">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => loadScenario(s)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-1.5">
                              {s.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                              <span className="font-medium text-sm text-foreground">{s.name}</span>
                            </div>
                            {s.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">
                              {(s.blocks || []).length} block{(s.blocks || []).length === 1 ? '' : 's'}
                            </p>
                          </button>
                          <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100">
                            <button onClick={() => togglePin(s)} title={s.is_pinned ? 'Unpin' : 'Pin'}>
                              {s.is_pinned
                                ? <PinOff className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                : <Pin className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                              }
                            </button>
                            <button onClick={() => remove(s.id)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-bearish" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-4 py-3 border-t border-border bg-muted/20">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/workspace">
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Open Workspace
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}