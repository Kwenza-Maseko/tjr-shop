CREATE INDEX "admin_access_granted_idx" ON "admin" USING btree ("access_granted");--> statement-breakpoint
CREATE INDEX "cart_user_id_idx" ON "cart" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_product_id_idx" ON "cart" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "cart_user_active_idx" ON "cart" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "deal_products_deal_id_idx" ON "deal_products" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "deal_products_product_id_idx" ON "deal_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "deal_time_span_deal_id_idx" ON "deal_time_span" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "deal_time_span_time_span_idx" ON "deal_time_span" USING btree ("time_span");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_m_payment_id_idx" ON "orders" USING btree ("m_payment_id");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "product_sizes_product_id_idx" ON "product_sizes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_target_idx" ON "products" USING btree ("product_target");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "products_is_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_target_category_idx" ON "products" USING btree ("product_target","category");