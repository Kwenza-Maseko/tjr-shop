CREATE TYPE "public"."is_bold" AS ENUM('YES', 'NO');--> statement-breakpoint
CREATE TYPE "public"."is_italic" AS ENUM('YES', 'NO');--> statement-breakpoint
CREATE TABLE "storeheadline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"headline" varchar(255) NOT NULL,
	"textBold" "is_bold" DEFAULT 'NO',
	"textItalic" "is_italic" DEFAULT 'NO',
	"colorHex" varchar(7) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "storeheadline_id_unique" UNIQUE("id")
);
