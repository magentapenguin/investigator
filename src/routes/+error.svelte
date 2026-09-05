<script lang="ts">
	import { page } from '$app/state';
</script>

<h1
	class="bg-linear-to-r from-theme-200 to-red-500 bg-clip-text text-center text-6xl font-black text-transparent lg:text-9xl"
>
	{page.status}
</h1>
<p class="text-center text-lg text-theme-600 dark:text-theme-400">
	{page.error?.message}
	<br />
	<a href="/" class="link underline"> Go back to home </a>
</p>
