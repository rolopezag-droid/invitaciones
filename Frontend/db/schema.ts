import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull().unique(),
  confirmedAt: text('confirmed_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
