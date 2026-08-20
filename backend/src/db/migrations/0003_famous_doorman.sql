CREATE TABLE "media_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "folder_id" uuid;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_id_media_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_folders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_folders_root_slug" ON "media_folders" USING btree ("slug") WHERE "media_folders"."parent_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "media_folders_parent_slug" ON "media_folders" USING btree ("parent_id","slug") WHERE "media_folders"."parent_id" is not null;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;