ALTER TABLE "addon_colors" ADD COLUMN "hex" text;--> statement-breakpoint
UPDATE "addon_colors" SET "hex" = '#888888' WHERE "hex" IS NULL;--> statement-breakpoint
ALTER TABLE "addon_colors" ALTER COLUMN "hex" SET NOT NULL;
