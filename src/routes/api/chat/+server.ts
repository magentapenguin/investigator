import { OPENROUTER_API_KEY } from '$app/env/private';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
	isStepCount,
	toUIMessageStream,
	tool,
	hasToolCall,
	isLoopFinished
} from 'ai';
import { JSDOM } from 'jsdom';
import { z } from 'zod';


const openrouter = createOpenRouter({
	apiKey: OPENROUTER_API_KEY
});

export const POST = async ({ request }: { request: Request }) => {
	const { messages } = await request.json();

	const result = streamText({
		model: openrouter('z-ai/glm-5.3-flash'),
		messages: await convertToModelMessages(messages),
		stopWhen: [
			isStepCount(50), // Maximum 50 steps
			hasToolCall('done'), // Stop after calling either tool
			isLoopFinished()
		],
		instructions: [{
			role: 'system',
			content: 'You are the Investi-gator, an agent focusing on consumer rights and consumer protection. Use the available tools to assist the user. If given only a product or company name, use the tools to look up relevant information. Include relevant context from the Consumer Rights Wiki or Deceptive Patterns (https://deceptive.design/) when appropriate.',
		}],
		tools: {
			done: tool({
				description: 'Indicates the completion of a multi-step process.',
				inputSchema: z.object({})
			}),
			current_time: tool({
				description: 'Returns the current date and time. (this may be out of sync with the actual current time, but the day should be correct)',
				inputSchema: z.object({}),
				outputSchema: z.object({
					currentTime: z.string()
				}),
				execute: async () => {
					return {
						currentTime: new Date().toISOString()
					};
				}
			}),
			crw_lookup: tool({
				description: 'Looks up information about a given topic on the Consumer Rights Wiki',
				inputSchema: z.object({
					topic: z.string(),
					maxMatches: z.number().default(10)
				}),
				outputSchema: z.object({
					matched: z.array(z.record(z.string(), z.any())),
					license: z.string()
				}),
				execute: async ({ topic, maxMatches }) => {
					const response = await fetch(`https://raw.githubusercontent.com/FULU-Foundation/CRW-Extension/refs/heads/export_cargo/all_cargo_combined.json`);
					const data = await response.json();
					const companies = data.Company;
					const incidents = data.Incident;
					const products = data.Product;
					const productLines = data.ProductLine;
					const combined = [...companies, ...incidents, ...products, ...productLines];
					let matched: Record<string, any>[] = [];
					function scoreMatch(item: Record<string, any>, topic: string) {
						let score = 0;
						for (const key in item) {
							if (typeof item[key] === 'string' && item[key].toLowerCase().includes(topic.toLowerCase())) {
								const index = item[key].length - item[key].toLowerCase().indexOf(topic.toLowerCase());
								score += index;
							}
						}
						return score;
					}
					for (const item of combined) {
						const score = scoreMatch(item, topic.toLowerCase());
						if (score > 0) {
							let type = '';
							if (companies.includes(item)) {
								type = 'Company';
							} else if (incidents.includes(item)) {
								type = 'Incident';
							} else if (products.includes(item)) {
								type = 'Product';
							} else if (productLines.includes(item)) {
								type = 'Product Line';
							}
							matched.push({
								...item,
								matchScore: score,
								itemType: type
							});
						}
					}
					matched.sort((a, b) => b.matchScore - a.matchScore);
					matched = matched.slice(0, maxMatches);
					console.log(`Matched items for topic "${topic}":`, matched);
					return {
						matched,
						license: "All data from https://consumerrights.wiki/, CC-BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)"
					};
				}
			}),
			web_search: tool({
				description: 'Performs a web search.',
				inputSchema: z.object({
					query: z.string()
				}),
				outputSchema: z.object({
					results: z.array(z.object({
						title: z.string(),
						url: z.string(),
						snippet: z.string()
					}))
				}),
				execute: async ({ query }) => {
					const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
					const html = await response.text();
					const dom = new JSDOM(html, {
						url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
  						contentType: "text/html",
					});
					const results = Array.from(dom.window.document.querySelectorAll('.result')).map((result) => {
						const title = result.querySelector('h2')?.textContent ?? '';
						const url = (result.querySelector('a.result__a') as HTMLAnchorElement)?.href ?? '';
						const snippet = result.querySelector('.result__snippet')?.textContent ?? '';
						return { title, url, snippet };
					}); 
					return { results };
				}
			}),
			web_request: tool({
				description: 'Performs a web request and converts the response into markdown.',
				inputSchema: z.object({
					url: z.string(),
					mode: z.enum(['html', 'markdown', 'original'])
				}),
				outputSchema: z.object({
					response: z.string(),
					mode: z.enum(['html', 'markdown', 'original'])
				}),
				execute: async ({ url, mode }) => {
					const response = await fetch(url);
					const responseBody = await response.text();
					const dom = new JSDOM(responseBody, {
						url,
  						contentType: "text/html",
					});
					let responseContent;
					if (mode === 'html') {
						responseContent = dom.window.document.body.innerHTML ?? '';
					} else if (mode === 'markdown') {
						responseContent = dom.window.document.body.textContent ?? '';
					} else {
						responseContent = responseBody;
					}
					return {
						response: responseContent,
						mode,
					};
				}
			}),
			fetch: tool({
				description: 'Performs a fetch request.',
				inputSchema: z.object({
					url: z.string(),
					method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
					includeHeaders: z.boolean().default(false)
				}),
				outputSchema: z.object({
					response: z.string(),
					status: z.number(),
					headers: z.record(z.string(), z.string()).optional()
				}),
				execute: async ({ url, method, includeHeaders }) => {
					const response = await fetch(url, { method });
					const responseBody = await response.text();
					const headers = includeHeaders ? Object.fromEntries(response.headers.entries()) : undefined;
					return {
						response: responseBody,
						status: response.status,
						headers
					};
				}
			})
		},
		onError: (error) => {
			console.error(error);
		}
	});

	result

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream })
	});
};
