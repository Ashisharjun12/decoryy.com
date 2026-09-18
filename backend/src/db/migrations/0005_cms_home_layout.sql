DO $m$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    INNER JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'cms_home_block_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."cms_home_block_type" AS ENUM('category_row', 'product_rail');
  END IF;
END
$m$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_home_layout_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "cms_home_block_type" NOT NULL,
	"city_id" uuid,
	"status" "cms_status" DEFAULT 'draft' NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"platforms" text[] DEFAULT ARRAY['web','mobile']::text[] NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"title" text,
	"subtitle" text,
	"show_title" boolean DEFAULT true NOT NULL,
	"show_subtitle" boolean DEFAULT true NOT NULL,
	"section_id" uuid,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_home_block_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_home_block_categories_block_category" UNIQUE("block_id","category_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_home_layout_blocks" ADD CONSTRAINT "cms_home_layout_blocks_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_home_layout_blocks" ADD CONSTRAINT "cms_home_layout_blocks_section_id_catalog_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."catalog_sections"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_home_block_categories" ADD CONSTRAINT "cms_home_block_categories_block_id_cms_home_layout_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."cms_home_layout_blocks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_home_block_categories" ADD CONSTRAINT "cms_home_block_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_home_layout_blocks_city_status_sort_idx" ON "cms_home_layout_blocks" ("city_id","status","sort_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_home_layout_blocks_section_id_idx" ON "cms_home_layout_blocks" ("section_id") WHERE "section_id" IS NOT NULL;
