import { db } from './server/db';
import { eq } from 'drizzle-orm';
import { chat } from './server/db/schema';
import { z } from 'zod';
import { query, command } from '$app/server'
import { resolve } from '$app/paths';

export const getChats = query(async () => {
	return db
		.select({
			id: chat.id,
			title: chat.title,
			lastMessageAt: chat.lastMessageAt
		})
		.from(chat);
});

export const getChatById = query(z.string(), async (id: string) => {
	return db.select().from(chat).where(eq(chat.id, id)).all()[0];
});

export const createChat = command(
	z.object({
		title: z.string().optional()
	}).optional(),
	async (opts) => {
		const { title } = opts ?? {};
		const data = await db.insert(chat).values({
			title: title,
			lastMessageAt: new Date(),
			messages: []
		}).returning();
		if (!data || data.length === 0) {
			throw new Error('Failed to create chat');
		}
		return { data, redirect: resolve('/chat/[id]', { id: data[0].id }) };
	}
);
