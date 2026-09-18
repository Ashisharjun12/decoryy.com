ALTER TABLE "cms_banners" ADD COLUMN IF NOT EXISTS "mobile_image_upload_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_banners" ADD CONSTRAINT "cms_banners_mobile_image_upload_id_uploads_id_fk" FOREIGN KEY ("mobile_image_upload_id") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
