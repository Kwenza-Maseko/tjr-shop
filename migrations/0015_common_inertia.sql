ALTER TABLE "cart" DROP CONSTRAINT "cart_image_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "cart" ADD COLUMN "imageUrl" varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE "cart" DROP COLUMN "image_id";