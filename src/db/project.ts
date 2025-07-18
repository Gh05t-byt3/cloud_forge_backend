import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user";


export const project = pgTable("project", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  userId: uuid("user_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})
