CREATE TABLE IF NOT EXISTS "cms_home_faq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"status" "cms_status" DEFAULT 'draft' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"platforms" text[] DEFAULT ARRAY['web','mobile']::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_home_faq_items_status_sort_idx" ON "cms_home_faq_items" USING btree ("status","sort_index");
