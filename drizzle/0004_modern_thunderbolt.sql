ALTER TABLE "riceboxhero_admin" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_customer" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "riceboxhero_menu" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;