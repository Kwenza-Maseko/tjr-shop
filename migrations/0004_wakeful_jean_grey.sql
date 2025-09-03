CREATE TABLE "storecontactdetails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"street_address" varchar(100) NOT NULL,
	"town" varchar(100),
	"province" varchar(40) NOT NULL,
	"tel_number" varchar(13),
	"email" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "storecontactdetails_id_unique" UNIQUE("id")
);
