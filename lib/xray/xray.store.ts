import { XRayTrace } from './xray.types';

export class TraceStore {
  private static instance: TraceStore;
  // TODO: Replace this in-memory Map with a real database collection (e.g., MongoDB, PostgreSQL via Prisma/Drizzle)
  private traces: Map<string, XRayTrace> = new Map();

  private constructor() {}

  public static getInstance(): TraceStore {
    if (!TraceStore.instance) {
      TraceStore.instance = new TraceStore();
    }
    return TraceStore.instance;
  }

  /**
   * Persists a trace to the store.
   */
  async save(trace: XRayTrace): Promise<void> {
    // TODO: Implement database write operation here
    // TODO: Add data validation or schema parsing (e.g., Zod) before persistence
    this.traces.set(trace.id, trace);
  }

  /**
   * Retrieves a summary list of all traces.
   */
  async list(): Promise<XRayTrace[]> {
    // TODO: Implement database query with pagination
    // TODO: Offload sorting to the database engine
    return Array.from(this.traces.values()).sort(
      (a, b) => b.startTime - a.startTime
    );
  }

  /**
   * Retrieves a single full trace by its ID.
   */
  async getById(id: string): Promise<XRayTrace | undefined> {
    // TODO: Implement database lookup by indexed ID
    return this.traces.get(id);
  }

  /**
   * Clears the store (primarily for test cleanup).
   */
  async clear(): Promise<void> {
    // TODO: Implement TRUNCATE or DELETE ALL for test environments
    this.traces.clear();
  }
}

export const getStore = () => TraceStore.getInstance();
