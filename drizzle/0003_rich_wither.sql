ALTER TABLE "riceboxhero_order" ALTER COLUMN "grossPrice" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "discount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "discount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "discountRate" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "discountRate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "serviceCharge" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "serviceCharge" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "serviceChargeRate" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "serviceChargeRate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "tax" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "tax" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "taxRate" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "taxRate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "total" SET NOT NULL;