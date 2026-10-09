-- Stock-only watches have no target price. The route already writes null for
-- them and every reader handles null, but the column was NOT NULL, so creating
-- a stock watch failed with a 500.
ALTER TABLE "tracked_products" ALTER COLUMN "target_price" DROP NOT NULL;
