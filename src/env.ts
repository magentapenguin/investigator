import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	OPENROUTER_API_KEY: { description: 'The API key for OpenRouter.' },
	PUBLIC_POSTHOG_PROJECT_TOKEN: {
		public: true,
		description: 'The public PostHog project token.'
	},
	PUBLIC_POSTHOG_HOST: {
		public: true,
		description: 'The PostHog API host.'
	},
	PUBLIC_POSTHOG_FEEDBACK_SURVEY_ID: {
		public: true,
		description: 'The PostHog survey ID used to collect thumbs up/down feedback on AI responses.',
		schema: (value) => value
	}
});
