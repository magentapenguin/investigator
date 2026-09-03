<script lang="ts">
	import './layout.css';
	import '@magenta/utills/floating.css';
	import favicon from '#lib/assets/favicon.svg';
	import { Palette } from '@lucide/svelte';
	import { tooltip, popover, click } from '@magenta/utills/floating';
	import { onMount } from 'svelte';

	let { children } = $props();
	const themes = {
		neutral: 'Neutral',
		cool: 'Cool',
		warm: 'Warm',
		olive: 'Olive',
		mauve: 'Mauve',
	};
	let currentTheme = $state<string>('neutral');
	const fonts = {
		sans: 'Sans',
		serif: 'Serif',
		mono: 'Mono',
		dyslexic: 'OpenDyslexic',
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
<div class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center p-2 px-4">
	<div class="flex w-full flex-col gap-2">
		{@render children()}
	</div>
</div>
<button
	class="button secondary-button fixed right-4 bottom-4 rounded-lg p-1.5 shadow"
	{@attach tooltip('Theme')}
	bind:this={themeButton}
>
	<Palette size={18} />
	<span class="sr-only">Theme</span>
</button>
{#if themeButton}
<div
	class="input fixed rounded-lg p-2 shadow w-auto border" 
	{@attach popover(themeButton, {
		placement: 'top',
		padding: 8,
		positioning: 'fixed',
	})}
	{@attach click(themeButton)}
> <!-- Input class is very good for this style -->
	<span class="text-theme-700 dark:text-theme-400 px-1">Select Theme:</span>
	<div class="flex flex-wrap gap-1">
	{#each Object.entries(themes) as [id, name]}
		<button
			data-theme={id}
			class="button outline-button m-1 p-1 bg-theme-100 dark:bg-theme-900 {currentTheme === id ? 'active' : ''} size-8"
			onclick={() => (currentTheme = id)}
			{@attach tooltip(name)}
		>
			<span class="sr-only">{name}</span>
		</button>
	{/each}
	</div>
	<div class="h-2"></div>
	<span class="text-theme-700 dark:text-theme-400 px-1">Select Font:</span>
	<div class="flex flex-wrap gap-1">
	{#each Object.entries(fonts) as [id, name]}
		<button
			data-font={id}
			class="button outline-button m-1 p-1 bg-theme-100 dark:bg-theme-900 {currentFont === id ? 'active' : ''} size-8 relative font-interface"
			onclick={() => (currentFont = id)}
			{@attach tooltip(name)}
		>
			<span aria-hidden="true" class="absolute inset-0 flex items-center justify-center">Ab</span>
			<span class="sr-only">{name}</span>
		</button>
	{/each}
	</div>
</div>
{/if}