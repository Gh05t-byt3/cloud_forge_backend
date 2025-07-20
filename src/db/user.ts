import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sshKey } from "./ssh_key";
import { project } from "./project";
import { vm } from "./vm";


export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const userRelations = relations(user, ({one, many}) => ({
  sshKeys: many(sshKey),
  projects: many(project),
  vms: many(vm)
}))