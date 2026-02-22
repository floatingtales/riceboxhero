CREATE TYPE "public"."menu_type" AS ENUM('rice_box', 'meat_only');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'completed', 'voided');--> statement-breakpoint
CREATE TABLE "riceboxhero_admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "riceboxhero_admin_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "riceboxhero_customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "riceboxhero_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "menu_type" NOT NULL,
	"standardPrice" numeric(15, 2) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "riceboxhero_order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"menuId" uuid NOT NULL,
	"amount" numeric(5, 2),
	"grossPrice" numeric(15, 2),
	"discount" numeric(15, 2),
	"discountRate" numeric(5, 2),
	"totalPrice" numeric(15, 2),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "riceboxhero_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customerId" uuid NOT NULL,
	"adminId" uuid NOT NULL,
	"orderNumber" text NOT NULL,
	"orderStatus" "order_status" DEFAULT 'pending' NOT NULL,
	"orderedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"discount" numeric(15, 2) DEFAULT 0 NOT NULL,
	"discountRate" numeric(5, 2) DEFAULT 0 NOT NULL,
	"serviceCharge" numeric(15, 2) DEFAULT 0 NOT NULL,
	"serviceChargeRate" numeric(15, 2) DEFAULT 0 NOT NULL,
	"tax" numeric(15, 2) DEFAULT 0 NOT NULL,
	"taxRate" numeric(5, 2) DEFAULT 0 NOT NULL,
	"adjustment" numeric(15, 2) DEFAULT 0 NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"orderNote" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "riceboxhero_order_item" ADD CONSTRAINT "riceboxhero_order_item_orderId_riceboxhero_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."riceboxhero_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riceboxhero_order_item" ADD CONSTRAINT "riceboxhero_order_item_menuId_riceboxhero_menu_id_fk" FOREIGN KEY ("menuId") REFERENCES "public"."riceboxhero_menu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ADD CONSTRAINT "riceboxhero_order_customerId_riceboxhero_customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."riceboxhero_customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riceboxhero_order" ADD CONSTRAINT "riceboxhero_order_adminId_riceboxhero_admin_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."riceboxhero_admin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "riceboxhero_order_item_orderId_index" ON "riceboxhero_order_item" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "riceboxhero_order_item_menuId_index" ON "riceboxhero_order_item" USING btree ("menuId");--> statement-breakpoint
CREATE INDEX "riceboxhero_order_customerId_index" ON "riceboxhero_order" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "riceboxhero_order_adminId_index" ON "riceboxhero_order" USING btree ("adminId");