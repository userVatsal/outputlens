import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserJourneyModal } from './UserJourneyModal';

interface RecentSignup {
  userId: string;
  name: string;
  createdAt: string;
  tier: string;
  analysisCount: number;
  source: string;
}

interface RecentSignupsTableProps {
  data: RecentSignup[];
  isAdmin: boolean;
}

function maskName(name: string): string {
  if (!name || name === 'Anonymous') return 'Anonymous';
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part.substring(0, 2) + '***';
  }).join(' ');
}

export function RecentSignupsTable({ data, isAdmin }: RecentSignupsTableProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No signups yet
      </div>
    );
  }

  return (
    <>
      <div className="overflow-auto max-h-[300px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Joined</TableHead>
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs text-center">
                <Activity className="h-3 w-3 inline" />
              </TableHead>
              <TableHead className="text-xs w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((signup) => (
              <TableRow key={signup.userId} className="border-border/30">
                <TableCell className="py-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {maskName(signup.name)}
                    </span>
                    <Badge 
                      variant={signup.tier === 'free' ? 'secondary' : 'default'}
                      className="text-[10px] w-fit mt-0.5"
                    >
                      {signup.tier}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2">
                  {format(new Date(signup.createdAt), 'MMM d')}
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="text-[10px]">
                    {signup.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-2">
                  <span className="text-xs font-medium text-foreground flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    {signup.analysisCount}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedUserId(signup.userId)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserJourneyModal
        userId={selectedUserId}
        isAdmin={isAdmin}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}
