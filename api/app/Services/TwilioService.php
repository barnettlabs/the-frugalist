<?php

namespace App\Services;

use Twilio\Rest\Client;

class TwilioService
{
    protected Client $client;
    protected string $fromNumber;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->fromNumber = config('services.twilio.from');

        $this->client = new Client($sid, $token);
    }

    public function sendSms(string $to, string $message): bool
    {
        try {
            $this->client->messages->create($to, [
                'from' => $this->fromNumber,
                'body' => $message,
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Twilio SMS failed', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function sendVerificationCode(string $to, string $code): bool
    {
        $message = "Your verification code for TheFrugalist is: {$code}. This code expires in 10 minutes.";

        return $this->sendSms($to, $message);
    }

    public function sendPriceAlert(string $to, string $productName, float $currentPrice, float $retailPrice, string $alertType): bool
    {
        if ($alertType === 'target_reached') {
            $message = "🎯 Target price reached! {$productName} is now \${$currentPrice} (was \${$retailPrice}). View details at " . url('/price-tracker');
        } else {
            $message = "📉 Price drop alert! {$productName} dropped to \${$currentPrice} (was \${$retailPrice}). View details at " . url('/price-tracker');
        }

        return $this->sendSms($to, $message);
    }
}
