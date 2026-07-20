-- Preserve one permanent aggregate record for each finalized business day.
CREATE TABLE "daily_analytics" (
    "id" UUID NOT NULL,
    "business_date" DATE NOT NULL,
    "total_orders" INTEGER NOT NULL,
    "revenue" DECIMAL(10,2) NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "profit" DECIMAL(10,2) NOT NULL,
    "average_order_value" DECIMAL(10,2) NOT NULL,
    "best_selling_product" TEXT,
    "total_items_sold" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_analytics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "daily_analytics_business_date_key" UNIQUE ("business_date"),
    CONSTRAINT "daily_analytics_total_orders_nonnegative" CHECK ("total_orders" >= 0),
    CONSTRAINT "daily_analytics_revenue_nonnegative" CHECK ("revenue" >= 0),
    CONSTRAINT "daily_analytics_cost_nonnegative" CHECK ("cost" >= 0),
    CONSTRAINT "daily_analytics_average_order_value_nonnegative" CHECK ("average_order_value" >= 0),
    CONSTRAINT "daily_analytics_total_items_sold_nonnegative" CHECK ("total_items_sold" >= 0)
);

-- Order items remain immutable after creation, while allowing the retention workflow
-- to remove finalized order detail in the same transaction as analytics creation.
DROP TRIGGER "order_items_are_immutable" ON "order_items";

CREATE TRIGGER "order_items_are_immutable"
BEFORE UPDATE ON "order_items"
FOR EACH ROW EXECUTE FUNCTION "prevent_order_item_mutation"();
