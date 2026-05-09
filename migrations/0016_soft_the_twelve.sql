CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."shipping_method" AS ENUM('PICKUP', 'DELIVERY');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"m_payment_id" varchar(100) NOT NULL,
	"pf_payment_id" varchar(100),
	"payment_status" varchar(50) DEFAULT 'PENDING',
	"status" "order_status" DEFAULT 'PENDING',
	"shipping_method" "shipping_method" NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"items" jsonb NOT NULL,
	"customer_name" varchar(255),
	"customer_email" text,
	"delivery_street_address" varchar(255),
	"delivery_suburb" varchar(100),
	"delivery_city" varchar(100),
	"delivery_province" varchar(100),
	"delivery_postal_code" varchar(4),
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "orders_id_unique" UNIQUE("id"),
	CONSTRAINT "orders_m_payment_id_unique" UNIQUE("m_payment_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;