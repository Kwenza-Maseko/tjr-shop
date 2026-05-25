import { sql } from "drizzle-orm";
import {
    boolean,
    date,
    integer,
    jsonb,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["USERS", "ADMIN"]);
export const accessEnum = pgEnum("access", ["GRANTED", "NOT GRANTED"]);
export const adminRoleEnum = pgEnum("admin_role", ["SUPER ADMIN", "ADMIN"]);
export const isBold = pgEnum("is_bold", ["YES", "NO"]);
export const isItalic = pgEnum("is_italic", ["YES", "NO"]);

export const userTable = pgTable("users", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: userRoleEnum("role").default("USERS"),

    phoneNumber: varchar("phone_number", { length: 20 }),

    addressLatCords: varchar("latitude_coordinate"),
    addressLngCords: varchar("longitude_coordinate"),
    lastLogin: date("last_login").defaultNow(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpires: timestamp("password_reset_expires", { withTimezone: true })
});

export const adminTable = pgTable("admin", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    adminRole: adminRoleEnum("admin_role").default("ADMIN"),
    accessGranted: accessEnum("access_granted").default("NOT GRANTED"),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpires: timestamp("password_reset_expires", { withTimezone: true })
});

export const storeHeadline = pgTable("storeheadline", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    headline: varchar("headline", { length: 255 }).notNull(),
    textBold: isBold("textBold").default("NO"),
    textItalic: isItalic("textItalic").default("NO"),
    colorHex: varchar("colorHex", { length: 7 }).notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const storeContactDetails = pgTable("storecontactdetails", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    streetAddress: varchar("street_address", { length: 100 }).notNull(),
    town: varchar("town", { length: 100 }),
    province: varchar("province", { length: 40 }).notNull(),
    storeTelNumber: varchar("tel_number", { length: 13 }),
    storeEmail: text("email"),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const media = pgTable("media", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const banners = pgTable("banners", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    mediaId: uuid("media_id").references(() => media.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const announcements = pgTable("announcements", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    announcement: varchar("announcement", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});



export const cartTable = pgTable("cart", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    userId: uuid("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
        .notNull()
        .references(() => productTable.id, { onDelete: "cascade" }),

    imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
    
    quantity: integer("quantity").notNull().default(1),

    priceSnapshot: numeric("price_snapshot", { precision: 10, scale: 2 }),
    discountSnapshot: numeric("discount_snapshot", { precision: 10, scale: 2 }),

    selectedOptions: jsonb("selected_options"),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const deals = pgTable("deals", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    dealCoupon: varchar("deal_coupon", { length: 255 }).notNull(),
    percentage: integer("percentage").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


export const dealProducts = pgTable("deal_products", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    dealId: uuid("deal_id")
        .notNull()
        .references(() => deals.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => productTable.id, { onDelete: "cascade" }),
});

export const dealTimeSpan = pgTable("deal_time_span", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    dealId: uuid("deal_id")
        .notNull()
        .references(() => deals.id, { onDelete: "cascade" }),
    timeSpan: timestamp("time_span", { withTimezone: true }).defaultNow(),
});

export const productTable = pgTable("products", {
    id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
    productName: varchar("product_name", { length: 100 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    productTarget: varchar("product_target", { length: 255 }).notNull(),
    productType: varchar("product_type", { length: 120 }),
    color: varchar("color", { length: 100 }),

    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // product price
    discountPrice: numeric("discount_price", { precision: 10, scale: 2 }), // optional sale price
    stock: integer("stock").default(0), // quantity available
    sku: varchar("sku", { length: 50 }).notNull().unique(), // unique stock keeping unit

    category: varchar("category", { length: 100 }), // e.g., skincare, electronics
    tags: varchar("tags", { length: 255 }), // comma-separated tags for filtering/searching

    weight: numeric("weight", { precision: 10, scale: 2 }), // kg or lbs
    dimensions: varchar("dimensions", { length: 100 }), // e.g., 10x5x2 cm

    rating: numeric("rating", { precision: 2, scale: 1 }).default(sql`0`), // average rating
    reviewCount: integer("review_count").default(0),

    isActive: boolean("is_active").default(true), // whether product is visible in store
    relatedProducts: jsonb("related_products"), // list of related product IDs
    variants: jsonb("variants"), // for color/size variants

    brand: varchar("brand", { length: 100 }),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).defaultNow(),
});

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED"
]);

export const shippingMethodEnum = pgEnum("shipping_method", ["PICKUP", "DELIVERY"]);

export const ordersTable = pgTable("orders", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),

  // Customer
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  // PayFast
  mPaymentId: varchar("m_payment_id", { length: 100 }).notNull().unique(),
  pfPaymentId: varchar("pf_payment_id", { length: 100 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("PENDING"),

  // Order
  status: orderStatusEnum("status").default("PENDING"),
  shippingMethod: shippingMethodEnum("shipping_method").notNull(),

  // Amounts
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),

  // Cart snapshot: [{ productId, productName, imageUrl, quantity, priceSnapshot, discountSnapshot }]
  items: jsonb("items").notNull(),

  // Customer snapshot
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: text("customer_email"),

  // ✅ Delivery address — structured fields instead of a single varchar
  deliveryStreetAddress: varchar("delivery_street_address", { length: 255 }),
  deliverySuburb: varchar("delivery_suburb", { length: 100 }),
  deliveryCity: varchar("delivery_city", { length: 100 }),
  deliveryProvince: varchar("delivery_province", { length: 100 }),
  deliveryPostalCode: varchar("delivery_postal_code", { length: 4 }),

  // Timestamps
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const pendingOrdersTable = pgTable("pending_orders", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})