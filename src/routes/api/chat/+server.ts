import '#lib/server/instrumentation';
import { OPENROUTER_API_KEY } from '$app/env/private';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { tool } from 'ai';
import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
	isStepCount,
	toUIMessageStream,
	hasToolCall,
	isLoopFinished
} from 'ai';
import { aiTools } from '#lib';
import { db } from '#lib/server/db';
import { chat } from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const openrouter = createOpenRouter({
	apiKey: OPENROUTER_API_KEY
});

export const POST = async ({ request }: { request: Request }) => {
	const { messages, id } = await request.json();

	const result = streamText({
		model: openrouter('z-ai/glm-5.3-flash'),
		messages: await convertToModelMessages(messages),
		stopWhen: [
			isStepCount(50), // Maximum 50 steps
			hasToolCall('done'), // Stop after calling either tool
			isLoopFinished()
		],
		instructions: [
			{
				role: 'system',
				content:
					'You are the Investi-gator, an agent focusing on consumer rights and consumer protection. Use the available tools to assist the user. If given only a product or company name, use the tools to look up relevant information. Include relevant context from the Consumer Rights Wiki or Deceptive Patterns (https://deceptive.design/) when appropriate.'
			},
			{
				role: 'system',
				content:
					'Use set_title tool to set the title of the chat. Always set a meaningful title based on the conversation context.'
			}
		],
		tools: {
			...aiTools,
			set_title: tool({
				description: 'Set the title of the chat',
				inputSchema: z.object({
					title: z.string()
				}),
				execute: async ({ title }) => {
					await db.update(chat).set({ title }).where(eq(chat.id, id));
				}
			})
		},
		runtimeContext: {
			sessionId: id,
			traceName: 'chat-turn'
		},
		telemetry: {
			functionId: 'chat-turn',
			includeRuntimeContext: {
				sessionId: true,
				traceName: true
			}
		},
		onError: (error) => {
			console.error(error);
		}
	});

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({
			stream: result.stream,
			originalMessages: messages,
			onEnd: async ({ messages: updatedMessages }) => {
				// Save messages
				await db
					.update(chat)
					.set({ messages: updatedMessages, lastMessageAt: new Date() })
					.where(eq(chat.id, id));
			}
		})
	});
};
