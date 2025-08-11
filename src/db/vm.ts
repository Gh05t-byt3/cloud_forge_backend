import { integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user";
import { project } from "./project";
import { node } from "./node";
import { relations } from "drizzle-orm";

export const VM_STATUS = pgEnum("vm_status", [
  "pending",
  "running",
  "stopped",
  "terminated",
  "suspended",
]);

export const vm = pgTable("vm", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: uuid("user_id").notNull().references(() => user.id),
  nodeId: varchar("node_id", { length: 255 }).notNull().references(() => node.name),
  projectId: uuid("project_id").notNull().references(() => project.id),
  status: VM_STATUS("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const vmRelations = relations(vm, ({ one }) => ({
  owner: one(user, {
    fields: [vm.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [vm.projectId],
    references: [project.id],
  }),
  node: one(node, {
    fields: [vm.nodeId],
    references: [node.name],
  }),
}));