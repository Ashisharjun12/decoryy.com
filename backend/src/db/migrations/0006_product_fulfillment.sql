ALTER TABLE "products" ADD COLUMN "scheduled_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "instant_enabled" boolean DEFAULT false NOT NULL;
