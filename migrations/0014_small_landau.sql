CREATE TABLE "deal_time_span" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"time_span" timestamp with time zone DEFAULT now(),
	CONSTRAINT "deal_time_span_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "deal_time_span" ADD CONSTRAINT "deal_time_span_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;