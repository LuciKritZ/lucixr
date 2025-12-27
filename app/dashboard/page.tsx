import { SearchIcon, ActivityIcon } from 'lucide-react';
import Link from 'next/link';

import { RunDiscoveryButton } from './dashboard.run-button';
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // TODO: Add error handling for fetch failures if the API is down
  const res = await fetch(`${baseUrl}/api/xray`, { cache: 'no-store' });
  const traces: TraceSummary[] = await res.json();

  return (
    <div className='p-8 max-w-7xl mx-auto space-y-8'>
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            X-Ray Runs
          </h1>
          <p className='text-slate-500 mt-1'>
            Monitor and debug discovery engine decisions in real-time.
          </p>
        </div>

        {/* Placement 1: Primary Action (Top Right) */}
        <RunDiscoveryButton />
      </div>

      <Card className='overflow-hidden border-slate-200 shadow-sm'>
        <Table>
          <TableHeader className='bg-slate-50'>
            <TableRow>
              <TableHead className='w-75'>Trace Name</TableHead>
              <TableHead>Prospect</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Executed At</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traces.length > 0 ? (
              traces.map(trace => (
                <TableRow
                  className='hover:bg-slate-50/50 transition-colors'
                  key={trace.id}
                >
                  <TableCell className='font-semibold text-slate-700'>
                    {trace.name}
                  </TableCell>
                  <TableCell className='text-slate-600'>
                    {trace.prospectName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        trace.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          : ''
                      }
                      variant={
                        trace.status === 'completed' ? 'default' : 'destructive'
                      }
                    >
                      {trace.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-slate-600'>
                    {trace.stepCount} steps
                  </TableCell>
                  <TableCell className='text-slate-500 text-sm'>
                    {new Date(trace.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      asChild
                      className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      size='sm'
                      variant='ghost'
                    >
                      <Link href={`/dashboard/${trace.id}`}>
                        <SearchIcon className='mr-2 h-4 w-4' /> View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              /* Placement 2: Empty State Call to Action */
              <TableRow>
                <TableCell className='h-64 text-center' colSpan={6}>
                  <div className='flex flex-col items-center justify-center space-y-3'>
                    <ActivityIcon className='h-10 w-10 text-slate-300' />
                    <div className='space-y-1'>
                      <p className='text-lg font-medium text-slate-900'>
                        No traces found
                      </p>
                      <p className='text-sm text-slate-500'>
                        Run your first discovery to see the X-Ray module in
                        action.
                      </p>
                    </div>
                    <RunDiscoveryButton />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
