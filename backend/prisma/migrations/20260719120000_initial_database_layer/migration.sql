-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Placed', 'Preparing', 'Delivered');

-- CreateEnum
CREATE TYPE "StoreOverride" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('Light', 'Dark', 'System');

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_stock_nonnegative" CHECK ("stock" >= 0),
    CONSTRAINT "products_selling_price_nonnegative" CHECK ("selling_price" >= 0),
    CONSTRAINT "products_cost_price_nonnegative" CHECK ("cost_price" >= 0),
    CONSTRAINT "products_archival_timestamp_matches_state" CHECK (
        ("is_archived" AND "archived_at" IS NOT NULL)
        OR (NOT "is_archived" AND "archived_at" IS NULL)
    )
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "total_profit" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'Placed',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_total_amount_nonnegative" CHECK ("total_amount" >= 0),
    CONSTRAINT "orders_total_cost_nonnegative" CHECK ("total_cost" >= 0)
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_selling_price_nonnegative" CHECK ("selling_price" >= 0),
    CONSTRAINT "order_items_cost_price_nonnegative" CHECK ("cost_price" >= 0),
    CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0),
    CONSTRAINT "order_items_subtotal_matches_snapshot" CHECK (
        "subtotal" = "selling_price" * "quantity"
    )
);

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "opening_time" TIME(0) NOT NULL,
    "closing_time" TIME(0) NOT NULL,
    "auto_schedule_enabled" BOOLEAN NOT NULL,
    "manual_override" "StoreOverride",
    "low_stock_threshold" INTEGER NOT NULL,
    "notifications_enabled" BOOLEAN NOT NULL,
    "theme" "Theme" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "settings_low_stock_threshold_nonnegative" CHECK ("low_stock_threshold" >= 0)
);

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_is_archived_idx" ON "products"("is_archived");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- Enforce the documented singleton Settings record without adding an undocumented field.
CREATE UNIQUE INDEX "settings_singleton_idx" ON "settings" ((true));

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Preserve historical transaction snapshots by preventing changes or deletion after creation.
CREATE FUNCTION "prevent_order_item_mutation"()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Order items are immutable after creation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "order_items_are_immutable"
BEFORE UPDATE OR DELETE ON "order_items"
FOR EACH ROW EXECUTE FUNCTION "prevent_order_item_mutation"();

-- Require every order to contain at least one item when its transaction commits.
CREATE FUNCTION "ensure_order_has_item"()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM "order_items"
        WHERE "order_id" = NEW."id"
    ) THEN
        RAISE EXCEPTION 'Every order must contain at least one order item';
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "orders_require_order_item"
AFTER INSERT OR UPDATE ON "orders"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "ensure_order_has_item"();
