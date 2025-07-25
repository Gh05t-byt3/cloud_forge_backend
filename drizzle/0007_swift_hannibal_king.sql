ALTER TABLE "node" ADD PRIMARY KEY ("name");--> statement-breakpoint
ALTER TABLE "vm" ADD COLUMN "node_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "vm" ADD CONSTRAINT "vm_node_id_node_name_fk" FOREIGN KEY ("node_id") REFERENCES "public"."node"("name") ON DELETE no action ON UPDATE no action;