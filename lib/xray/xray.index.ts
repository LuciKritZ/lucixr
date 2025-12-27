import {
  XRayTrace,
  JsonPrimitive,
  EvaluationResult,
  JsonValue,
  Metrics,
  GenericStep,
} from './xray.types';

export class XRay {
  private trace: XRayTrace;

  constructor(
    traceName: string,
    prospect: { id: string; name: string; metadata: Metrics }
  ) {
    this.trace = {
      endTime: undefined,
      id: `trace_${crypto.randomUUID()}`,
      name: traceName,
      prospect,
      startTime: Date.now(),
      status: 'running',
      steps: [],
    };
  }

  getTraceSnapshot(): XRayTrace {
    return JSON.parse(JSON.stringify(this.trace));
  }

  async recordStep<TInput extends JsonValue, TOutput extends JsonValue>(
    name: string,
    type: GenericStep['type'],
    input: TInput,
    execute: () => Promise<{ output: TOutput; reasoning?: string }>
  ): Promise<TOutput> {
    const { output, reasoning } = await execute();

    const step: GenericStep = {
      id: crypto.randomUUID(),
      input,
      name,
      output,
      reasoning,
      timestamp: Date.now(),
      type,
    };

    this.trace.steps.push(step);
    return output;
  }

  async recordFilterStep<T>(
    name: string,
    candidates: T[],
    config: {
      identity: (item: T) => { id: string; name: string; metrics: Metrics };
      rules: Array<{
        label: string;
        check: (item: T) => {
          passed: boolean;
          detail: string;
          threshold?: JsonPrimitive;
          actual?: JsonPrimitive;
        };
      }>;
      reasoning?: string;
    }
  ): Promise<T[]> {
    const evaluations: EvaluationResult[] = candidates.map(item => {
      const { id, name, metrics } = config.identity(item);
      const filterResults: EvaluationResult['filterResults'] = {};
      let allPassed = true;

      for (const rule of config.rules) {
        const result = rule.check(item);
        filterResults[rule.label] = {
          actual: result.actual,
          detail: result.detail,
          passed: result.passed,
          threshold: result.threshold,
        };
        if (!result.passed) allPassed = false;
      }

      return { filterResults, id, metrics, name, passed: allPassed };
    });

    const passedItems = candidates.filter((_, idx) => evaluations[idx].passed);

    this.trace.steps.push({
      evaluations,
      id: crypto.randomUUID(),
      input: { candidateCount: candidates.length },
      name,
      output: { passedCount: passedItems.length },
      reasoning: config.reasoning,
      timestamp: Date.now(),
      type: 'filter',
    });

    return passedItems;
  }

  async fail(error: Error | string): Promise<XRayTrace> {
    this.trace.endTime = Date.now();
    this.trace.status = 'failed';

    this.trace.steps.push({
      id: crypto.randomUUID(),
      input: {},
      name: 'Critical System Error',
      output: { message: typeof error === 'string' ? error : error.message },
      timestamp: Date.now(),
      type: 'error',
    });

    return this.trace;
  }

  async flush(
    onFlush?: (trace: XRayTrace) => Promise<void>
  ): Promise<XRayTrace> {
    this.trace.endTime = Date.now();
    this.trace.status = 'completed';
    if (onFlush) await onFlush(this.trace);
    return this.trace;
  }
}
