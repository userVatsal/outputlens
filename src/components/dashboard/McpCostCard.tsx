import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function McpCostCard() {
  const [today, setToday] = useState({ cost: 0, msgs: 0, tools: 0, hits: 0 });
  const [yesterday, setYesterday] = useState(0);

  useEffect(() => {
    (async () => {
      const d = new Date().toISOString().slice(0, 10);
      const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const { data: tRows } = await supabase.from('mcp_usage').select('*').eq('date', d);
      const { data: yRows } = await supabase.from('mcp_usage').select('estimated_cost').eq('date', y);
      const sum = (rs: any[]) => (rs || []).reduce((a, r) => ({
        cost: a.cost + Number(r.estimated_cost), msgs: a.msgs + r.claude_messages, tools: a.tools + r.tool_calls, hits: a.hits + r.cache_hits,
      }), { cost: 0, msgs: 0, tools: 0, hits: 0 });
      setToday(sum(tRows || []));
      setYesterday((yRows || []).reduce((a: number, r: any) => a + Number(r.estimated_cost), 0));
    })();
  }, []);

  const hitRate = today.tools > 0 ? (today.hits / today.tools) * 100 : 0;
  const savedEst = today.hits * 0.001;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI Spend (Today)
        </CardTitle>
        <Badge variant="outline">£{yesterday.toFixed(2)} yest.</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">£{today.cost.toFixed(4)}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {today.msgs} msgs · {today.tools} tools · {hitRate.toFixed(0)}% cache
        </div>
        {today.hits > 0 && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
            <TrendingDown className="h-3 w-3" /> ~£{savedEst.toFixed(4)} saved by cache
          </div>
        )}
      </CardContent>
    </Card>
  );
}