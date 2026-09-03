import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const chat = sqliteTable('chat', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	messages: text('messages', { mode: 'json' }).notNull()
});
