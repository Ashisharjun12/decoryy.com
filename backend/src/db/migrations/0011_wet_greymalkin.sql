CREATE TABLE IF NOT EXISTS "cms_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"status" "cms_status" DEFAULT 'draft' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"platforms" text[] DEFAULT ARRAY['web','mobile']::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cms_pages_slug_unique" ON "cms_pages" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_pages_status_sort_idx" ON "cms_pages" USING btree ("status","sort_index");
--> statement-breakpoint
ALTER TABLE "cms_footer_column_links" ADD COLUMN IF NOT EXISTS "link_type" text DEFAULT 'custom' NOT NULL;
--> statement-breakpoint
ALTER TABLE "cms_footer_column_links" ADD COLUMN IF NOT EXISTS "page_id" uuid;
--> statement-breakpoint
DO $mig$ BEGIN
 ALTER TABLE "cms_footer_column_links" ADD CONSTRAINT "cms_footer_column_links_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $mig$;
