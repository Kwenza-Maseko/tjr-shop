CREATE TYPE "public"."access" AS ENUM('GRANTED', 'NOT GRANTED');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('SUPER ADMIN', 'ADMIN');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"admin_role" "admin_role" DEFAULT 'ADMIN',
	"access_granted" "access" DEFAULT 'NOT GRANTED',
	"created_at" timestamp with time zone DEFAULT now(),
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp with time zone,
	CONSTRAINT "admin_id_unique" UNIQUE("id"),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
