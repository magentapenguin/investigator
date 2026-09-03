import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const investgation = sqliteTable('investgation', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	run: text('run', { mode: 'json' }).notNull()
});
