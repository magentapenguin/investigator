<script lang="ts">
	import { getChats, createChat, deleteChat } from '#lib/chats.remote';
	import { goto } from '$app/navigation';
	let chatsPromise = getChats();
</script>

<main class="mx-4">
	<button
		class="button primary-button my-2"
		onclick={async () => goto((await createChat()).redirect)}
	>
		Create New Chat
	</button>
	{#await chatsPromise}
		Loading...
	{:then chats}
		<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
			{#each chats as chat}
				<li class="button outline-button flex cursor-default flex-col gap-1 rounded-xl p-2 px-4">
					<span class="text-lg font-medium">{chat.title}</span>
					<div class="flex gap-2">
						<a href={`/chat/${chat.id}`} class="inline cursor-pointer text-indigo-500 underline"
							>View Chat</a
						>
						<button
							onclick={async () => {
								await deleteChat(chat.id);
								chatsPromise.refresh();
							}}
							class="inline cursor-pointer text-rose-500 underline">Delete Chat</button
						>
					</div>
				</li>
			{/each}
		</ul>
	{/await}
</main>
