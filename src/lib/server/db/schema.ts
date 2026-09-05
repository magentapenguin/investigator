import { nanoid } from '#lib';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const chat = sqliteTable('chat', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: text('title').default('New Chat'),
	lastMessageAt: integer('last_message_at', { mode: 'timestamp' }).notNull(),
	messages: text('messages', { mode: 'json' }).notNull().default([])
});
