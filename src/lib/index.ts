// place files you want to import through the `#lib` alias in this folder.
import type { Attachment } from 'svelte/attachments';
import Twemoji from '@twemoji/api';

export const twemoji: () => Attachment = () => {
	return (element) => {
		if (!element) return;
		if (!(element instanceof HTMLElement)) return;
		$effect(() => {
			Twemoji.parse(element);
			console.log('Twemoji parsed', element);
		});
	};
};
