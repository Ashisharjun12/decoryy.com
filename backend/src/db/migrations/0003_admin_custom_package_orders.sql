ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_custom_package" boolean DEFAULT false NOT NULL;--> statement-breakpoint
INSERT INTO "products" (
	"name",
	"slug",
	"category_id",
	"is_active",
	"scheduled_enabled",
	"instant_enabled",
	"payment_cod",
	"payment_online",
	"price_paise"
)
SELECT
	'Custom decoration (admin)',
	'admin-custom-booking',
	c.id,
	false,
	true,
	false,
	true,
	false,
	0
FROM "categories" c
ORDER BY c.created_at ASC
LIMIT 1
ON CONFLICT ("slug") DO NOTHING;
