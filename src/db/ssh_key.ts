import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";



export const sshKey = pgTable("ssh_key", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  pub: varchar("pub"),
  userId: uuid("user_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

export const ssh_relations = relations(sshKey, ({ one }) => ({
  one: one(user, {
    fields: [sshKey.userId],
    references: [user.id],
  })
}))