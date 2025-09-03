CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "banners_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imageUrl" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "media_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;