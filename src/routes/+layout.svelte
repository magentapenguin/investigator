<script lang="ts">
	import './layout.css';
	import '@magenta/utills/floating.css';
	import favicon from '#lib/assets/favicon.svg';
	import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_PROJECT_TOKEN } from '$app/env/public';
	import { Palette } from '@lucide/svelte';
	import { tooltip, popover, click } from '@magenta/utills/floating';
	import { onMount } from 'svelte';
	import posthog from 'posthog-js';

	let { children } = $props();
	const themes = {
		neutral: 'Neutral',
		cool: 'Cool',
		warm: 'Warm',
		olive: 'Olive',
		mauve: 'Mauve'
	};
	let currentTheme = $state<string>('neutral');
	const fonts = {
		sans: 'Sans',
		serif: 'Serif',
		mono: 'Mono',
		dyslexic: 'OpenDyslexic'
	};
	let currentFont = $state<string>('sans');
	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const savedFont = localStorage.getItem('font');
		if (savedFont) {
			currentFont = savedFont;
		}
		if (savedTheme) {
			currentTheme = savedTheme;
		}
	});
	$effect(() => {
		if (currentTheme) {
			document.documentElement.setAttribute('data-theme', currentTheme);
			localStorage.setItem('theme', currentTheme);
		}
	});
	$effect(() => {
		if (currentFont) {
			document.documentElement.setAttribute('data-font', currentFont);
			localStorage.setItem('font', currentFont);
		}
	});
	let themeButton = $state<HTMLElement | null>(null);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="mx-auto flex min-h-screen flex-col p-2 px-4">
	{@render children()}
</div>
<button
	class="button secondary-button top-2 right-4 rounded-lg p-1.5 shadow fixed"
	{@attach tooltip('Theme')}
	bind:this={themeButton}
>
	<Palette size={18} />
	<span class="sr-only">Theme</span>
</button>
{#if themeButton}
	<div
		class="input fixed w-auto rounded-lg border p-2 shadow"
		{@attach popover(themeButton, {
			placement: 'top',
			padding: 8,
			positioning: 'fixed'
		})}
		{@attach click(themeButton)}
	>
		<!-- Input class is very good for this style -->
		<span class="px-1 text-theme-700 dark:text-theme-400">Select Theme:</span>
		<div class="flex flex-wrap gap-1">
			{#each Object.entries(themes) as [id, name]}
				<button
					data-theme={id}
					class="button outline-button m-1 bg-theme-100 p-1 dark:bg-theme-900 {currentTheme === id
						? 'active'
						: ''} size-8"
					onclick={() => {
						currentTheme = id;
						if (PUBLIC_POSTHOG_PROJECT_TOKEN && PUBLIC_POSTHOG_HOST) {
							posthog.capture('theme_selected', { theme: id });
						}
					}}
					{@attach tooltip(name)}
				>
					<span class="sr-only">{name}</span>
				</button>
			{/each}
		</div>
		<div class="h-2"></div>
		<span class="px-1 text-theme-700 dark:text-theme-400">Select Font:</span>
		<div class="flex flex-wrap gap-1">
			{#each Object.entries(fonts) as [id, name]}
				<button
					data-font={id}
					class="button outline-button m-1 bg-theme-100 p-1 dark:bg-theme-900 {currentFont === id
						? 'active'
						: ''} relative size-8 font-interface"
					onclick={() => {
						currentFont = id;
						if (PUBLIC_POSTHOG_PROJECT_TOKEN && PUBLIC_POSTHOG_HOST) {
							posthog.capture('font_selected', { font: id });
						}
					}}
					{@attach tooltip(name)}
				>
					<span aria-hidden="true" class="absolute inset-0 flex items-center justify-center"
						>Ab</span
					>
					<span class="sr-only">{name}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}
