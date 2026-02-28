CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'qris', 'transfer');--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ADD COLUMN "paymentMethod" "payment_method";