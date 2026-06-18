ALTER TABLE "products" ALTER COLUMN "color" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slide_images" jsonb;