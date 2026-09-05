<script lang="ts">
	import { tooltip } from '@magenta/utills/floating';
	import { tick } from 'svelte';
	import { Chat } from '@ai-sdk/svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import { fade } from 'svelte/transition';
	import { Send, Brain, ChevronRight, Wrench, House, ArrowDown } from '@lucide/svelte';
	import { getChatById } from '#lib/chats.remote';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const plugins = [gfmPlugin()];
	let input = $state('');
	const chatData = await getChatById(page.params.id as string);
	const chat = new Chat({
		id: chatData.id,
		messages: chatData.messages as any,
		onData: () => {
			tick().then(() => {
				messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
			});
		},
		onToolCall: ({ toolCall }: { toolCall: any }) => {
			console.log(toolCall);
			if (toolCall.toolName === 'set_title') {
				if (toolCall.input?.title) {
					chatData.title = toolCall.input.title as string;
				}
			}
		}
	});
	let formElement: HTMLFormElement;
	let messageContainer: HTMLUListElement;

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!input.trim()) return;
		chat.sendMessage({ text: input });
		input = '';
	}
	let loadingIndex = $state(0);
	const loadingMessages = [
		'Generating',
		'Reticulating splines',
		'Crunching numbers',
		'Optimizing algorithms',
		'Simulating scenarios',
		'Analyzing data',
		'Thinking',
		'Processing',
		'Matrix multiplying',
		'Calculating probabilities',
		'Spinning fish',
		'Contemplating',
		'Asking Reddit'
	];
	$effect(() => {
		const interval = setInterval(() => {
			loadingIndex = (loadingIndex + 1) % loadingMessages.length;
		}, 15000);
		return () => clearInterval(interval);
	});
	$effect(() => {
		if (messageContainer) {
			tick().then(() => {
				messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
			});
		}
	});
</script>

<div class="flex gap-2 py-2 bg-theme-100 dark:bg-theme-900 -m-4 mb-0 p-4 sticky inset-0 bottom-auto z-10">
	<a
		href={resolve('/')}
		class="button secondary-button left-4 rounded-lg p-1.5 shadow"
		{@attach tooltip('Home')}
		><House size={18} />
		<span class="sr-only">Home</span>
	</a>
	<button
		class="button secondary-button rounded-lg p-1.5 shadow"
		{@attach tooltip('Bottom')}
		onclick={() => {
			document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}}
		><ArrowDown size={18} />
		<span class="sr-only">Bottom</span>
	</button>
	<p class="flex-1 text-lg text-theme-700 dark:text-theme-200 block align-middle ms-2">
		{chatData.title ?? 'Untitled Chat'}
	</p>
</div>

<main class="mx-auto w-[min(var(--container-3xl),100%)] flex-1 flex flex-col justify-center">
	<ul class="flex flex-col gap-2" bind:this={messageContainer}>
		{#each chat.messages as message, messageIndex (messageIndex)}
			<li class="flex flex-col gap-2 p-2">
				{#each message.parts as part, partIndex (partIndex)}
					{#if part.type === 'text'}
						<div
							class="prose wrap-break-word prose-indigo dark:prose-invert {message.role === 'user'
								? 'self-end rounded-xl rounded-br-xs bg-indigo-50 p-2 px-5 text-inherit dark:bg-indigo-950'
								: ''}"
						>
							<Markdown {plugins} md={part.text} />
						</div>
					{:else if part.type === 'reasoning'}
						<details class="group mx-1 text-theme-600 dark:text-theme-400">
							<summary
								class="-ms-7.5 flex cursor-pointer items-center gap-2 text-sm text-theme-500 select-none"
							>
								<ChevronRight
									size={18}
									class="rotate-0 transition-transform group-open:rotate-90"
								/>
								<span class="flex items-center gap-1">
									<Brain size={18} />
									Thinking
								</span>
							</summary>
							<div class="prose mt-1 opacity-80 prose-indigo dark:prose-invert">
								<Markdown {plugins} md={part.text} />
							</div>
						</details>
					{:else if part.type.startsWith('tool-')}
						<span class="flex items-center gap-1 text-sm text-theme-500">
							<Wrench size={18} />
							<span
								>Called tool
								<span class="font-mono">{part.type.replace('tool-', '')}</span>
							</span>
						</span>
					{/if}
				{/each}
			</li>
		{/each}
	</ul>
	<form onsubmit={handleSubmit} class="sticky bottom-2 -mx-2" bind:this={formElement}>
		{#if chat.status !== 'ready'}
			<div class="ms-4 text-sm text-theme-500" transition:fade>
				{loadingMessages[loadingIndex]}...
			</div>
		{:else}
			<div class="h-3.5 w-5"></div>
		{/if}
		<div
			class="input flex flex-col rounded-xl border p-1 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30"
		>
			<textarea
				name="content"
				disabled={chat.status !== 'ready'}
				placeholder={chat.status === 'ready' ? 'Type your message here...' : ''}
				bind:value={input}
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						formElement.requestSubmit();
					}
				}}
				class="w-full resize-none rounded-md border-none bg-none p-2 outline-none"></textarea>
			<div class="flex flex-row gap-2">
				<div class="flex-1"></div>
				<button
					type="submit"
					class="button secondary-button rounded-lg p-1.5 shadow"
					{@attach tooltip('Send')}
					><Send size={18} />
					<span class="sr-only">Send</span>
				</button>
			</div>
		</div>
	</form>
</main>
