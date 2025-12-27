# LuciXR

A **real-time debugging and observability platform** for AI discovery engines. LuciXR provides deep visibility into the decision-making process of competitor discovery systems through detailed execution traces and interactive dashboards.

## Overview

LuciXR is designed to help AI/ML teams understand, debug, and optimize their discovery engines by capturing and visualizing the complete execution flow—from initial input through all processing steps (generative, retrieval, ranking, filtering) to final output.

### Key Features

- **X-Ray Tracing**: Capture detailed execution traces of discovery engine runs with step-by-step visibility
- **Evaluation Metrics**: Track filter evaluations, thresholds, and pass/fail results at each step
- **Dashboard**: Monitor all discovery runs with real-time status updates and execution metrics
- **Run History**: Access detailed logs of past discovery executions for auditing and analysis
- **Structured Data**: Store and retrieve execution traces with comprehensive metadata

## Use Cases

- **Debug AI Decisions**: Understand why specific products were selected or rejected
- **Monitor Quality**: Track filtering thresholds and evaluation results
- **Optimize Performance**: Identify bottlenecks in the discovery pipeline
- **Audit Trails**: Maintain complete execution logs for compliance and analysis

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation & Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Run the production server
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:run` - Run tests in CI mode
- `npm run lint` - Run ESLint for code quality

## Architecture

### Core Components

#### X-Ray Module (`lib/xray/`)

Lightweight SDK for instrumenting AI applications with tracing capabilities.

- **xray.client.ts**: Provides the tracing API for applications
- **xray.store.ts**: Persists traces to storage
- **xray.types.ts**: Type definitions for traces, steps, and evaluations

**Trace Structure:**

```typescript
XRayTrace {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  steps: XRayStep[] // generative, retrieval, rank, filter, or error steps
  prospect: { id, name, metadata }
}
```

#### Discovery Engine (`lib/discovery/`)

Implements the competitive product discovery logic.

- **discovery.logic.ts**: Core engine that orchestrates the discovery pipeline
- **discovery.types.ts**: Type definitions for products and configurations

**Discovery Pipeline:**

1. Keyword Generation (Generative)
2. Candidate Search (Retrieval)
3. Ranking & Filtering (Filter with evaluations)
4. Result Selection

#### Dashboard (`app/dashboard/`)

React-based UI for viewing and managing discovery runs.

- View all X-Ray traces in a table
- Monitor execution status and step counts
- Access detailed trace information
- Trigger new discovery runs

### API Endpoints

#### `POST /api/xray`

**Ingest X-Ray traces** from discovery engine runs.

```bash
curl -X POST http://localhost:3000/api/xray \
  -H "Content-Type: application/json" \
  -d '{"id":"...", "name":"...", ...}'
```

#### `GET /api/xray`

**List all trace summaries** for the dashboard.

```bash
curl http://localhost:3000/api/xray
```

#### `GET /api/xray/[id]`

**Retrieve detailed trace** by ID.

```bash
curl http://localhost:3000/api/xray/{traceId}
```

## Project Structure

```bash
app/
  ├── api/xray/              # API routes for trace ingestion & retrieval
  ├── dashboard/             # Dashboard UI & discovery engine controls
  └── page.tsx               # Home page

lib/
  ├── xray/                  # X-Ray tracing module
  │   ├── xray.client.ts     # Tracing API
  │   ├── xray.store.ts      # Trace persistence
  │   └── xray.types.ts      # Type definitions
  └── discovery/             # Discovery engine
      ├── discovery.logic.ts # Pipeline implementation
      ├── discovery.types.ts # Type definitions
      └── discovery.mock.ts  # Mock data for testing

components/ui/              # Reusable UI components (badge, button, card, table)
```

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.x with App Router
- **Language**: TypeScript
- **UI Framework**: React 19.x
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.x
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/)

## Development Workflow

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# View test results in UI
npm run test:ui
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code (configured in prettier)
npm run lint -- --fix
```

## TODOs & Future Enhancements

- Integrate with LLM APIs (OpenAI/Anthropic) for keyword generation
- Connect to search APIs (Amazon, product search) for candidate retrieval
- Implement request signature verification for API security
- Add centralized error logging (e.g., Sentry integration)
- Build trace analytics and visualization dashboard
- Export traces to JSON/CSV for external analysis

## Deployment

### Vercel

The easiest way to deploy LuciXR is using [Vercel](https://vercel.com/):

1. Push your repository to GitHub
2. Import the project in Vercel
3. Configure environment variables if needed
4. Deploy

See [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

This project is actively under development. Feel free to open issues and pull requests for improvements!

## License

MIT
