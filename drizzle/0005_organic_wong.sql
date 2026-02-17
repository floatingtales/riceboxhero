ALTER TABLE "riceboxhero_menu" ALTER COLUMN "standardPrice" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ADD COLUMN "adjustment" numeric(15, 2) DEFAULT 0 NOT NULL;