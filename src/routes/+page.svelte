<script lang="ts">
	import { getChats, createChat } from '#lib/chats.remote';
	import { goto } from '$app/navigation';
</script>

<main class="mx-4 h-[calc(100vh-1rem)]">
    <button class="button primary-button my-2" onclick={async () => goto((await createChat()).redirect)}>
        Create New Chat
    </button>
	{#await getChats()}
		Loading...
	{:then chats}
		<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
			{#each chats as chat}
				<li class="button outline-button flex cursor-default flex-col gap-1 rounded-xl p-2 px-4">
					<span class="text-lg font-medium">{chat.title}</span>
					<a href={`/chat/${chat.id}`} class="text-blue-500 underline">View Chat</a>
				</li>
			{/each}
		</ul>
	{/await}
</main>
