import { pgTable, varchar } from "drizzle-orm/pg-core";


export const node = pgTable("node", {
  name: varchar("name", { length: 255 }).notNull().primaryKey(),
})