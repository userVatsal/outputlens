import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Msg = { id: string; role: 'user' | 'assistant'; text: string; toolEvents?: { name: string; cached?: boolean; error?: string }[] };

export function AgentDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', text };
    const assistantId = crypto.randomUUID();
    setMessages(m => [...m, userMsg, { id: assistantId, role: 'assistant', text: '', toolEvents: [] }]);
    setStreaming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-agent`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ message: text }),
      });
      if (resp.status === 429) {
        const err = await resp.json();
        setMessages(m => m.map(x => x.id === assistantId ? { ...x, text: `⚠️ ${err.error}` } : x));
        return;
      }
      if (!resp.body) throw new Error('No stream');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            setMessages(m => m.map(x => {
              if (x.id !== assistantId) return x;
              if (evt.type === 'text') return { ...x, text: x.text + evt.delta };
              if (evt.type === 'tool_start') return { ...x, toolEvents: [...(x.toolEvents || []), { name: evt.name }] };
              if (evt.type === 'tool_end') return { ...x, toolEvents: (x.toolEvents || []).map(t => t.name === evt.name && !('cached' in t) ? { ...t, cached: evt.cached } : t) };
              if (evt.type === 'tool_error') return { ...x, toolEvents: [...(x.toolEvents || []), { name: evt.name, error: evt.error }] };
              if (evt.type === 'error') return { ...x, text: x.text + `\n\n⚠️ ${evt.message}` };
              return x;
            }));
          } catch (_) {}
        }
      }
    } catch (e: any) {
      setMessages(m => m.map(x => x.id === assistantId ? { ...x, text: `⚠️ ${e?.message || e}` } : x));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50" aria-label="Open AI assistant">
          <Sparkles className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> OutputLens AI</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Ask about your portfolio, simulations, alerts, or market regime.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={cn('flex flex-col gap-1', m.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn('rounded-lg px-3 py-2 max-w-[85%] text-sm', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1">
                      <ReactMarkdown>{m.text || (streaming ? '…' : '')}</ReactMarkdown>
                    </div>
                  ) : m.text}
                </div>
                {m.toolEvents && m.toolEvents.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.toolEvents.map((t, i) => (
                      <Badge key={i} variant={t.error ? 'destructive' : t.cached ? 'secondary' : 'outline'} className="text-[10px]">
                        {t.name}{t.cached ? ' · cached' : ''}{t.error ? ' · error' : ''}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Ask anything…"
            disabled={streaming}
          />
          <Button onClick={send} disabled={streaming || !input.trim()} size="icon">
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}