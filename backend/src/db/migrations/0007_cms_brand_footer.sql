CREATE TABLE IF NOT EXISTS "cms_social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"icon_preset" text,
	"icon_upload_id" uuid,
	"status" "cms_status" DEFAULT 'draft' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"platforms" text[] DEFAULT ARRAY['web','mobile']::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_footer_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"status" "cms_status" DEFAULT 'draft' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"platforms" text[] DEFAULT ARRAY['web','mobile']::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_footer_column_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"column_id" uuid NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cms_social_links" ADD CONSTRAINT "cms_social_links_icon_upload_id_uploads_id_fk" FOREIGN KEY ("icon_upload_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cms_footer_column_links" ADD CONSTRAINT "cms_footer_column_links_column_id_cms_footer_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."cms_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_social_links_status_sort_idx" ON "cms_social_links" USING btree ("status","sort_index");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_footer_columns_status_sort_idx" ON "cms_footer_columns" USING btree ("status","sort_index");
