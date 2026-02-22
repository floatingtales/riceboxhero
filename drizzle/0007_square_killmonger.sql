ALTER TABLE "riceboxhero_order" RENAME COLUMN "grossPrice" TO "subtotal";--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ALTER COLUMN "orderStatus" SET DEFAULT 'pending';