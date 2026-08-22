CREATE TABLE "catalog_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_sections_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE "catalog_section_city_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"city_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_section_city_overrides_section_city" UNIQUE("section_id","city_id")
);--> statement-breakpoint
CREATE TABLE "catalog_section_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"city_id" uuid,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "catalog_section_city_overrides" ADD CONSTRAINT "catalog_section_city_overrides_section_id_catalog_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."catalog_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_section_city_overrides" ADD CONSTRAINT "catalog_section_city_overrides_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_section_products" ADD CONSTRAINT "catalog_section_products_section_id_catalog_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."catalog_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_section_products" ADD CONSTRAINT "catalog_section_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_section_products" ADD CONSTRAINT "catalog_section_products_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_section_products_global_uniq" ON "catalog_section_products" USING btree ("section_id","product_id") WHERE "catalog_section_products"."city_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_section_products_city_uniq" ON "catalog_section_products" USING btree ("section_id","product_id","city_id") WHERE "catalog_section_products"."city_id" is not null;
