-- Idempotent: 0018 may have already added these labels.
ALTER TYPE "public"."geo_point_source" ADD VALUE IF NOT EXISTS 'geocode_ola';--> statement-breakpoint
ALTER TYPE "public"."geo_point_source" ADD VALUE IF NOT EXISTS 'place_pin';
