import { PlayIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TraceSummary {
  id: string;
  name: string;
  prospectName: string;
  status: 'running' | 'completed' | 'failed';
  stepCount: number;
  timestamp: number;
}

export default async function DashboardPage() {
  // TODO: Implement SWR or React Query for real-time updates
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/xray`,
    { cache: 'no-store' }
  );
  const traces: TraceSummary[] = await res.json();

  return (
    <div className='p-8 max-w-7xl mx-auto space-y-8'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>X-Ray Runs</h1>
          <p className='text-muted-foreground'>
            Monitor and debug discovery engine decisions.
          </p>
        </div>
        {/* TODO: In a real workflow, this would trigger an background Job/Worker */}
        <Button disabled>
          <PlayIcon className='mr-2 h-4 w-4' /> Run New Discovery
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trace Name</TableHead>
              <TableHead>Prospect</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Executed At</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traces.map(trace => (
              <TableRow key={trace.id}>
                <TableCell className='font-medium'>{trace.name}</TableCell>
                <TableCell>{trace.prospectName}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      trace.status === 'completed' ? 'default' : 'destructive'
                    }
                  >
                    {trace.status}
                  </Badge>
                </TableCell>
                <TableCell>{trace.stepCount}</TableCell>
                <TableCell>
                  {new Date(trace.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className='text-right'>
                  <Button asChild size='sm' variant='ghost'>
                    <Link href={`/dashboard/${trace.id}`}>
                      <SearchIcon className='mr-2 h-4 w-4' /> View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
