<?php

namespace App\Notifications;

use App\Models\PriceAlert;
use App\Models\TrackedProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PriceDropAlert extends Notification implements ShouldQueue
{
    use Queueable;

    protected PriceAlert $priceAlert;

    protected TrackedProduct $trackedProduct;

    public function __construct(PriceAlert $priceAlert)
    {
        $this->priceAlert = $priceAlert;
        $this->trackedProduct = $priceAlert->trackedProduct;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $subject = $this->getSubject();
        $greeting = $this->getGreeting();

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line($this->getMainMessage())
            ->line($this->getPriceDetails())
            ->action('View Product Details', url("/price-tracker/{$this->trackedProduct->id}"))
            ->line('Thank you for using Smart Price Tracker!');

        if ($this->trackedProduct->product_image_url) {
            $message->line('')->attach($this->trackedProduct->product_image_url);
        }

        return $message;
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'price_alert',
            'alert_type' => $this->priceAlert->alert_type,
            'product_id' => $this->trackedProduct->id,
            'product_name' => $this->trackedProduct->product_name,
            'retailer_name' => $this->trackedProduct->retailer->name,
            'old_price' => $this->priceAlert->old_price,
            'new_price' => $this->priceAlert->new_price,
            'target_price' => $this->trackedProduct->target_price,
            'savings' => $this->priceAlert->old_price - $this->priceAlert->new_price,
            'percentage_drop' => $this->calculatePercentageDrop(),
            'product_image_url' => $this->trackedProduct->product_image_url,
            'product_url' => url("/price-tracker/{$this->trackedProduct->id}"),
        ];
    }

    private function getSubject(): string
    {
        switch ($this->priceAlert->alert_type) {
            case 'target_reached':
                return "🎯 Target Price Reached: {$this->trackedProduct->product_name}";
            case 'price_drop':
                return "💰 Price Drop Alert: {$this->trackedProduct->product_name}";
            case 'back_in_stock':
                return "✅ Back in Stock: {$this->trackedProduct->product_name}";
            default:
                return "🔔 Price Alert: {$this->trackedProduct->product_name}";
        }
    }

    private function getGreeting(): string
    {
        switch ($this->priceAlert->alert_type) {
            case 'target_reached':
                return 'Great news! Your target price has been reached!';
            case 'price_drop':
                return "Good news! The price has dropped on a product you're tracking!";
            case 'back_in_stock':
                return "The product you're tracking is back in stock!";
            default:
                return 'Hello!';
        }
    }

    private function getMainMessage(): string
    {
        $productName = $this->trackedProduct->product_name;
        $retailer = $this->trackedProduct->retailer->name;

        switch ($this->priceAlert->alert_type) {
            case 'target_reached':
                return "The price for \"{$productName}\" at {$retailer} has reached your target price!";
            case 'price_drop':
                return "The price for \"{$productName}\" at {$retailer} has dropped!";
            case 'back_in_stock':
                return "The product \"{$productName}\" at {$retailer} is now back in stock!";
            default:
                return "There's an update on \"{$productName}\" at {$retailer}.";
        }
    }

    private function getPriceDetails(): string
    {
        $oldPrice = $this->formatCurrency($this->priceAlert->old_price);
        $newPrice = $this->formatCurrency($this->priceAlert->new_price);
        $savings = $this->formatCurrency($this->priceAlert->old_price - $this->priceAlert->new_price);
        $percentageDrop = $this->calculatePercentageDrop();

        $details = "Price: {$oldPrice} → {$newPrice}";

        if ($this->priceAlert->new_price < $this->priceAlert->old_price) {
            $details .= " (Save {$savings} - {$percentageDrop}% off)";
        }

        if ($this->priceAlert->alert_type === 'target_reached') {
            $targetPrice = $this->formatCurrency($this->trackedProduct->target_price);
            $details .= " | Target: {$targetPrice}";
        }

        return $details;
    }

    private function calculatePercentageDrop(): float
    {
        if ($this->priceAlert->old_price == 0) {
            return 0;
        }

        return round(
            (($this->priceAlert->old_price - $this->priceAlert->new_price) / $this->priceAlert->old_price) * 100,
            1
        );
    }

    private function formatCurrency(float $amount): string
    {
        return '$'.number_format($amount, 2);
    }
}
