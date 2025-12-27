import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

import { XRayTrace, XRayStep } from '@/lib/xray/xray.types';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function getPassedCount(step: XRayStep): number {
  if (step.type === 'filter') {
    const output = step.output as { passedCount: number };
    return output.passedCount;
  }
  return 0;
}

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/xray/${id}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return notFound();
  const trace: XRayTrace = await res.json();

  return (
    <div className='p-8 max-w-7xl mx-auto space-y-8'>
      <div className='space-y-2'>
        <div className='flex items-center gap-4'>
          <h1 className='text-3xl font-bold'>{trace.name}</h1>
          <Badge variant='outline'>ID: {trace.id}</Badge>
        </div>
        <p className='text-muted-foreground'>
          Prospect:{' '}
          <span className='font-semibold text-foreground'>
            {trace.prospect.name}
          </span>
        </p>
      </div>

      {/* Funnel Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {trace.steps.map((step, idx) => (
          <Card className='bg-muted/30' key={step.id}>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className='text-xs uppercase text-muted-foreground'>
                Step {idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
              <p className='font-semibold truncate'>{step.name}</p>
              {step.type === 'filter' ? (
                <p className='text-2xl font-bold'>
                  {getPassedCount(step)}
                  <span className='text-sm font-normal text-muted-foreground'>
                    passed
                  </span>
                </p>
              ) : (
                <p className='text-sm text-muted-foreground'>Completed</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decision Timeline */}
      <div className='space-y-6'>
        <h2 className='text-xl font-bold'>Execution Timeline</h2>
        {trace.steps.map(step => (
          <Card className='overflow-hidden' key={step.id}>
            <div
              className={`h-1 w-full ${step.type === 'filter' ? 'bg-blue-500' : 'bg-primary'}`}
            />
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle>{step.name}</CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {step.reasoning}
                  </p>
                </div>
                <Badge variant='secondary'>{step.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {step.type === 'filter' && step.evaluations && (
                <div className='border rounded-lg overflow-hidden'>
                  <Table>
                    <TableHeader className='bg-muted/50'>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reasoning / Rules</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {step.evaluations.map(ev => (
                        <TableRow key={ev.id}>
                          <TableCell className='font-medium'>
                            {ev.name}
                          </TableCell>
                          <TableCell>
                            {ev.passed ? (
                              <Badge className='bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-200'>
                                <CheckCircle2Icon className='mr-1 h-3 w-3' />{' '}
                                Passed
                              </Badge>
                            ) : (
                              <Badge
                                className='bg-red-500/10 text-red-600 hover:bg-red-500/10 border-red-200'
                                variant='destructive'
                              >
                                <XCircleIcon className='mr-1 h-3 w-3' />{' '}
                                Rejected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-sm space-y-1'>
                            {Object.entries(ev.filterResults).map(
                              ([rule, result]) => (
                                <div
                                  className='flex items-center gap-2'
                                  key={rule}
                                >
                                  <span
                                    className={
                                      result.passed
                                        ? 'text-green-600'
                                        : 'text-red-600 font-medium'
                                    }
                                  >
                                    {rule}: {result.detail}
                                  </span>
                                </div>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {step.type !== 'filter' && (
                <div className='bg-muted p-4 rounded-md font-mono text-xs overflow-auto max-h-40'>
                  {/* TODO: Implement a pretty JSON viewer */}
                  <pre>{JSON.stringify(step.output, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
