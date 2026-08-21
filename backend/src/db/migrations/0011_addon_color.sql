CREATE TABLE "addon_colors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "addon_colors_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE UNIQUE INDEX "addon_colors_name_lower_idx" ON "addon_colors" USING btree (lower("name"));--> statement-breakpoint
ALTER TABLE "addons" ADD COLUMN "color_id" uuid;--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_color_id_addon_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."addon_colors"("id") ON DELETE set null ON UPDATE no action;
