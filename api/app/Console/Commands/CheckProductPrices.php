<?php

namespace App\Console\Commands;

use App\Mail\PriceDropAlert;
use App\Models\Notification;
use App\Models\TrackedProduct;
use App\Services\ExpoPushService;
use App\Services\Retailers\RetailerServiceFactory;
use App\Services\TwilioService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CheckProductPrices extends Command
{
    protected $signature = 'prices:check
                            {--limit=50 : Maximum number of products to check per run}
                            {--retailer= : Check only products from specific retailer}
                            {--user= : Check only products for specific user}
                            {--force : Force check all products regardless of last check time}';

    protected $description = 'Check prices for tracked products and create alerts when thresholds are met';

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Starting price check process...');

        $limit = $this->option('limit');
        $retailerSlug = $this->option('retailer');
        $userId = $this->option('user');
        $force = $this->option('force');

        // Build query for products to check
        $query = TrackedProduct::with(['retailer', 'user'])
            ->active()
            ->where('tracking_start_date', '<=', now());

        // Filter by end date
        $query->where(function ($q) {
            $q->whereNull('tracking_end_date')
                ->orWhere('tracking_end_date', '>=', now());
        });

        // Apply filters
        if ($retailerSlug) {
            $query->whereHas('retailer', function ($q) use ($retailerSlug) {
                $q->where('slug', $retailerSlug);
            });
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        // Only check products that haven't been checked recently (unless forced)
        if (! $force) {
            $query->needsCheck();
        }

        $products = $query->take($limit)->get();

        if ($products->isEmpty()) {
            $this->info('No products need price checking at this time.');

            return Command::SUCCESS;
        }

        $this->info("Found {$products->count()} products to check");

        $checkedCount = 0;
        $alertsCreated = 0;
        $errors = 0;

        $progressBar = $this->output->createProgressBar($products->count());
        $progressBar->start();

        foreach ($products as $product) {
            try {
                $result = $this->checkProductPrice($product);

                if ($result['checked']) {
                    $checkedCount++;
                    $alertsCreated += $result['alerts_created'];
                } else {
                    $errors++;
                }

            } catch (\Exception $e) {
                $errors++;
                Log::error("Error checking price for product {$product->id}: ".$e->getMessage());
                $this->error("Error checking {$product->product_name}: ".$e->getMessage());
            }

            $progressBar->advance();

            // Small delay to respect API rate limits
            usleep(200000); // 200ms delay
        }

        $progressBar->finish();
        $this->newLine();

        $duration = round(microtime(true) - $startTime, 2);

        $this->info("Price check completed in {$duration} seconds");
        $this->table(['Metric', 'Count'], [
            ['Products Checked', $checkedCount],
            ['Alerts Created', $alertsCreated],
            ['Errors', $errors],
        ]);

        return Command::SUCCESS;
    }

    private function checkProductPrice(TrackedProduct $product): array
    {
        try {
            $service = RetailerServiceFactory::create($product->retailer);
            $productData = $service->getProductDetails($product->sku_upc);

            if (! $productData) {
                $this->warn("Product not found: {$product->product_name} ({$product->sku_upc})");

                return ['checked' => false, 'alerts_created' => 0];
            }

            $oldPrice = $product->current_price;
            $newPrice = $productData['current_price'];
            $oldInStock = $product->in_stock ?? true;
            $newInStock = $productData['in_stock'] ?? true;
            $alertsCreated = 0;

            // Update product with new price and stock data
            $product->update([
                'current_price' => $newPrice,
                'in_stock' => $newInStock,
                'last_checked_at' => now(),
            ]);

            // Add to price history
            $product->priceHistory()->create([
                'price' => $newPrice,
                'in_stock' => $productData['in_stock'],
                'api_response' => array_merge($productData, [
                    'checked_via_command' => true,
                    'command_run_at' => now()->toISOString(),
                ]),
                'checked_at' => now(),
            ]);

            // Check for price alerts (only if watching for price drops)
            if ($product->shouldCheckForPriceDrop() && $newPrice < $oldPrice) {
                // Price dropped
                $alertType = ($product->target_price && $newPrice <= $product->target_price) ? 'target_reached' : 'price_drop';

                $alert = $product->priceAlerts()->create([
                    'old_price' => $oldPrice,
                    'new_price' => $newPrice,
                    'alert_type' => $alertType,
                    'triggered_at' => now(),
                ]);

                $alertsCreated++;

                $this->line("  💰 {$product->product_name}: {$this->formatCurrency($oldPrice)} → {$this->formatCurrency($newPrice)} ({$alertType})");

                // Send email notification if user has email verified and email is in notification methods
                if (in_array('email', $product->notification_method ?? []) && $product->user->canReceiveEmailNotifications()) {
                    Mail::to($product->user->email)->send(new PriceDropAlert($product, $alertType));
                    $this->line("  📧 Email notification sent to {$product->user->email}");
                }

                // Send push notification if user has 'push' in notification methods and has active devices
                $this->sendPushAlert($product, $alertType, $oldPrice, $newPrice);

                // Create in-app notification record
                $this->createInAppNotification($product, $alertType, $oldPrice, $newPrice);

                // Mark alert as notified
                $alert->update(['notification_sent' => true]);

                // SMS TEMPORARILY DISABLED - waiting for Twilio approval
                // Send SMS notification if user has phone verified and sms is in notification methods
                // if (in_array('sms', $product->notification_method ?? []) && $product->user->canReceiveSmsNotifications()) {
                //     $twilioService = app(TwilioService::class);
                //     $twilioService->sendPriceAlert(
                //         $product->user->phone_number,
                //         $product->product_name,
                //         $newPrice,
                //         $product->retail_price,
                //         $alertType
                //     );
                //     $this->line("  📱 SMS notification sent to {$product->user->phone_number}");
                // }

                // Auto-deactivate if target price reached
                if ($alertType === 'target_reached') {
                    $product->update(['is_active' => false]);
                    $this->line('  🎯 Target price reached - tracking auto-deactivated');
                }
            }

            // Check for stock alerts (only if watching for stock)
            if ($product->shouldCheckForStock()) {
                if (! $oldInStock && $newInStock) {
                    // Back in stock
                    $alert = $product->priceAlerts()->create([
                        'old_price' => $oldPrice,
                        'new_price' => $newPrice,
                        'alert_type' => 'back_in_stock',
                        'triggered_at' => now(),
                    ]);

                    $alertsCreated++;
                    $this->line("  ✅ {$product->product_name}: Back in stock!");

                    // Send email notification
                    if (in_array('email', $product->notification_method ?? []) && $product->user->canReceiveEmailNotifications()) {
                        Mail::to($product->user->email)->send(new PriceDropAlert($product, 'back_in_stock'));
                        $this->line("  📧 Email notification sent to {$product->user->email}");
                    }

                    // Send push notification + in-app record for back_in_stock
                    $this->sendPushAlert($product, 'back_in_stock', $oldPrice, $newPrice);
                    $this->createInAppNotification($product, 'back_in_stock', $oldPrice, $newPrice);
                    $alert->update(['notification_sent' => true]);
                } elseif ($oldInStock && ! $newInStock) {
                    // Went out of stock (just log, no alert)
                    $this->line("  ⚠️  {$product->product_name}: Out of stock");
                }
            }

            return ['checked' => true, 'alerts_created' => $alertsCreated];

        } catch (\Exception $e) {
            Log::error("Failed to check price for product {$product->id}", [
                'product_id' => $product->id,
                'product_name' => $product->product_name,
                'retailer' => $product->retailer->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function formatCurrency(float $amount): string
    {
        return '$'.number_format($amount, 2);
    }

    private function sendPushAlert(TrackedProduct $product, string $alertType, float $oldPrice, float $newPrice): void
    {
        if (! in_array('push', $product->notification_method ?? [])) {
            return;
        }

        $tokens = $product->user->activePushTokens();
        if (empty($tokens)) {
            return;
        }

        $result = app(ExpoPushService::class)->sendPriceDropAlert(
            $tokens,
            $product->product_name,
            $newPrice,
            $oldPrice,
            $alertType,
            $product->id
        );

        if ($result['success'] ?? false) {
            $this->line('  🔔 Push notification sent to '.count($tokens).' device(s)');
        } else {
            $this->line('  ⚠️  Push failed: '.($result['error'] ?? 'unknown'));
        }
    }

    private function createInAppNotification(TrackedProduct $product, string $alertType, float $oldPrice, float $newPrice): void
    {
        $title = match ($alertType) {
            'target_reached' => 'Target price reached',
            'price_drop' => 'Price drop',
            'back_in_stock' => 'Back in stock',
            default => 'Price alert',
        };

        $message = match ($alertType) {
            'target_reached' => sprintf('%s hit your target at %s', $product->product_name, $this->formatCurrency($newPrice)),
            'price_drop' => sprintf('%s dropped from %s to %s', $product->product_name, $this->formatCurrency($oldPrice), $this->formatCurrency($newPrice)),
            'back_in_stock' => sprintf('%s is back in stock at %s', $product->product_name, $this->formatCurrency($newPrice)),
            default => $product->product_name,
        };

        Notification::create([
            'user_id' => $product->user_id,
            'title' => $title,
            'message' => $message,
        ]);
    }
}
