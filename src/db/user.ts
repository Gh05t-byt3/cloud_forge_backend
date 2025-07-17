import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull()
})