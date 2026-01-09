CREATE TABLE "deal_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "deal_products_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "deals" DROP CONSTRAINT "deals_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "deal_products" ADD CONSTRAINT "deal_products_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_products" ADD CONSTRAINT "deal_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN "product_id";