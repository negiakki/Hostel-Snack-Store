-- Product stock defaults to zero so newly created products do not require inventory input.
ALTER TABLE "products"
ALTER COLUMN "stock" SET DEFAULT 0;

-- The store-settings singleton owns the global low-stock threshold.
ALTER TABLE "store_settings"
ADD COLUMN "low_stock_threshold" INTEGER NOT NULL DEFAULT 2,
ADD CONSTRAINT "store_settings_low_stock_threshold_nonnegative"
    CHECK ("low_stock_threshold" >= 0);
