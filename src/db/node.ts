import { pgTable, varchar } from "drizzle-orm/pg-core";


export const node = pgTable("node", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
})