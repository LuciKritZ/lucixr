export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[];

export type Metrics = Record<string, JsonPrimitive>;

export interface FilterResult {
  actual?: JsonPrimitive;
  detail: string;
  passed: boolean;
  threshold?: JsonPrimitive;
}

export interface EvaluationResult {
  filterResults: Record<string, FilterResult>;
  id: string;
  metrics: Metrics;
  name: string;
  passed: boolean;
}

interface BaseStep {
  id: string;
  input: JsonValue;
  name: string;
  output: JsonValue;
  reasoning?: string;
  timestamp: number;
}

export interface FilterStep extends BaseStep {
  evaluations: EvaluationResult[];
  type: 'filter';
}

export interface GenericStep extends BaseStep {
  evaluations?: never;
  type: 'generative' | 'retrieval' | 'rank' | 'error';
}

export type XRayStep = FilterStep | GenericStep;

export interface XRayTrace {
  endTime?: number;
  id: string;
  name: string;
  prospect: {
    id: string;
    metadata: Metrics;
    name: string;
  };
  startTime: number;
  status: 'running' | 'completed' | 'failed';
  steps: XRayStep[];
}
