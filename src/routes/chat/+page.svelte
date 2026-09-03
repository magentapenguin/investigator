<script lang="ts">
	import { tooltip } from '@magenta/utills/floating';
	import { Chat } from '@ai-sdk/svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import { fade } from 'svelte/transition';
	import { Send, Brain, ChevronRight, Wrench } from '@lucide/svelte';
	import { twemoji } from '#lib'
	const plugins = [gfmPlugin(), ];
	let input = $state('');
	const chat = new Chat({});
	let formElement: HTMLFormElement;

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
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
</script>

<main>
	<ul class="flex flex-col gap-2">
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
							<div class="prose opacity-80 prose-indigo dark:prose-invert mt-1">
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
			<div class="text-sm text-theme-500 ms-4" transition:fade>
				{loadingMessages[loadingIndex]}...
			</div>
		{:else}
			<div class="text-sm invisible">
				Placeholder
			</div>
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
