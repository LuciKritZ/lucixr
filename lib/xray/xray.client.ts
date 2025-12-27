import { XRay } from './xray.index';
import { Metrics, XRayTrace } from './xray.types';

interface XRayConfig {
  apiUrl: string;
  debug?: boolean;
}

export class XRayModule {
  private config: XRayConfig;

  constructor(config: XRayConfig) {
    this.config = config;
  }

  /**
   * Creates a new trace instance and injects the transmission logic.
   */
  createTrace(
    name: string,
    prospect: { id: string; name: string; metadata: Metrics }
  ): XRay {
    const trace = new XRay(name, prospect);

    const originalFlush = trace.flush.bind(trace);

    trace.flush = async (): Promise<XRayTrace> => {
      return await originalFlush(async (data: XRayTrace) => {
        await this.transmit(data);
      });
    };

    return trace;
  }

  /**
   * Internal transmission logic with 'Do No Harm' error handling.
   */
  private async transmit(data: XRayTrace): Promise<void> {
    try {
      const response = await fetch(this.config.apiUrl, {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok && this.config.debug) {
        // eslint-disable-next-line no-console
        console.warn(`X-Ray Module: Failed to transmit trace ${data.id}`);
      }
    } catch (error) {
      if (this.config.debug) {
        // eslint-disable-next-line no-console
        console.error('X-Ray Module: Transmission error suppressed', error);
      }
      // Explicitly swallow errors to ensure business logic is never interrupted by logging failures
    }
  }
}

let activeModule: XRayModule | null = null;

export const initXRay = (config: XRayConfig): XRayModule => {
  activeModule = new XRayModule(config);
  return activeModule;
};

export const getXRay = (): XRayModule => {
  if (!activeModule) {
    throw new Error('X-Ray Module not initialized. Call initXRay() first.');
  }
  return activeModule;
};
