ALTER TABLE "vm" DROP CONSTRAINT "vm_node_id_node_id_fk";
--> statement-breakpoint
ALTER TABLE "node" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "vm" DROP COLUMN "node_id";