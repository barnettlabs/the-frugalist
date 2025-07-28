<?php

namespace App\Console\Commands;

use App\Models\PriceAlert;
use App\Notifications\PriceDropAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendPriceAlertNotifications extends Command
{
    protected $signature = 'notifications:send-price-alerts 
                            {--limit=50 : Maximum number of notifications to send per run}
                            {--dry-run : Show what would be sent without actually sending}';

    protected $description = 'Send notifications for pending price alerts';

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Starting price alert notification process...');

        $limit = $this->option('limit');
        $dryRun = $this->option('dry-run');

        // Get pending alerts that haven't been notified yet
        $pendingAlerts = PriceAlert::with(['trackedProduct.user', 'trackedProduct.retailer'])
            ->where('notification_sent', false)
            ->orderBy('triggered_at', 'asc')
            ->take($limit)
            ->get();

        if ($pendingAlerts->isEmpty()) {
            $this->info('No pending price alerts to send.');
            return Command::SUCCESS;
        }

        $this->info("Found {$pendingAlerts->count()} pending alerts to send");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No notifications will actually be sent');
        }

        $sentCount = 0;
        $errors = 0;

        $progressBar = $this->output->createProgressBar($pendingAlerts->count());
        $progressBar->start();

        foreach ($pendingAlerts as $alert) {
            try {
                $user = $alert->trackedProduct->user;
                $product = $alert->trackedProduct;

                if (!$user) {
                    $this->warn("No user found for alert {$alert->id}");
                    $errors++;
                    continue;
                }

                if ($dryRun) {
                    $this->line("Would send {$alert->alert_type} notification to {$user->email} for {$product->product_name}");
                } else {
                    // Send the notification
                    $user->notify(new PriceDropAlert($alert));

                    // Mark as sent
                    $alert->update(['notification_sent' => true]);

                    $this->line("Sent {$alert->alert_type} notification to {$user->email} for {$product->product_name}");
                }

                $sentCount++;

            } catch (\Exception $e) {
                $errors++;
                Log::error("Error sending price alert notification for alert {$alert->id}: " . $e->getMessage());
                $this->error("Error sending notification for alert {$alert->id}: " . $e->getMessage());
            }

            $progressBar->advance();
            
            // Small delay to avoid overwhelming email services
            if (!$dryRun) {
                usleep(100000); // 100ms delay
            }
        }

        $progressBar->finish();
        $this->newLine();

        $duration = round(microtime(true) - $startTime, 2);
        
        $this->info("Notification process completed in {$duration} seconds");
        $this->table(['Metric', 'Count'], [
            ['Notifications ' . ($dryRun ? 'Planned' : 'Sent'), $sentCount],
            ['Errors', $errors],
        ]);

        return Command::SUCCESS;
    }
}