import { OpenTelemetry } from '@ai-sdk/otel';
import { PostHogSpanProcessor } from '@posthog/ai/otel';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_PROJECT_TOKEN } from '$app/env/public';
import { registerTelemetry } from 'ai';

// registerTelemetry appends to a global array, and Vite's dev-server SSR module
// re-evaluation (HMR) would otherwise re-run this file's side effects on every
// edit, stacking duplicate telemetry integrations and duplicating every trace.
declare global {
	// eslint-disable-next-line no-var
	var __investigatorInstrumented: boolean | undefined;
}

export const posthogSpanProcessor = new PostHogSpanProcessor({
	projectToken: PUBLIC_POSTHOG_PROJECT_TOKEN,
	host: PUBLIC_POSTHOG_HOST
});

if (!globalThis.__investigatorInstrumented) {
	globalThis.__investigatorInstrumented = true;

	const sdk = new NodeSDK({
		resource: resourceFromAttributes({ 'service.name': 'investi-gator' }),
		spanProcessors: [posthogSpanProcessor]
	});
	sdk.start();

	registerTelemetry(
		new OpenTelemetry({
			enrichSpan: ({ runtimeContext }) => ({
				'posthog.distinct_id':
					typeof runtimeContext?.distinctId === 'string' ? runtimeContext.distinctId : undefined,
				$ai_session_id:
					typeof runtimeContext?.sessionId === 'string' ? runtimeContext.sessionId : undefined,
				$ai_trace_id:
					typeof runtimeContext?.traceId === 'string' ? runtimeContext.traceId : undefined
			})
		})
	);
}
