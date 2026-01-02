<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send push notifications to one or more Expo push tokens.
     *
     * @param array|string $tokens Single token or array of tokens
     * @param string $title Notification title
     * @param string $body Notification body
     * @param array $data Additional data to send
     * @return array Response data
     */
    public function send(array|string $tokens, string $title, string $body, array $data = []): array
    {
        $tokens = is_array($tokens) ? $tokens : [$tokens];

        // Filter out invalid tokens
        $tokens = array_filter($tokens, fn($token) => $this->isValidExpoToken($token));

        if (empty($tokens)) {
            return [
                'success' => false,
                'error' => 'No valid Expo push tokens provided',
            ];
        }

        $messages = [];
        foreach ($tokens as $token) {
            $messages[] = [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
                'priority' => 'high',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post(self::EXPO_PUSH_URL, $messages);

            if ($response->successful()) {
                $responseData = $response->json();
                $this->processResponse($responseData, $tokens);

                return [
                    'success' => true,
                    'data' => $responseData,
                ];
            }

            Log::error('Expo push notification failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to send push notification',
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('Expo push notification exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send a price drop alert notification.
     */
    public function sendPriceDropAlert(
        array|string $tokens,
        string $productName,
        float $currentPrice,
        float $previousPrice,
        string $alertType,
        int $trackedProductId
    ): array {
        $title = match ($alertType) {
            'target_reached' => 'Target Price Reached!',
            'price_drop' => 'Price Drop Alert!',
            'back_in_stock' => 'Back in Stock!',
            default => 'Price Alert',
        };

        $body = match ($alertType) {
            'target_reached' => sprintf('%s is now $%.2f - your target price!', $productName, $currentPrice),
            'price_drop' => sprintf('%s dropped to $%.2f (was $%.2f)', $productName, $currentPrice, $previousPrice),
            'back_in_stock' => sprintf('%s is back in stock at $%.2f!', $productName, $currentPrice),
            default => sprintf('%s: $%.2f', $productName, $currentPrice),
        };

        return $this->send($tokens, $title, $body, [
            'type' => 'price_alert',
            'alert_type' => $alertType,
            'tracked_product_id' => $trackedProductId,
            'current_price' => $currentPrice,
            'previous_price' => $previousPrice,
        ]);
    }

    /**
     * Check if a token is a valid Expo push token.
     */
    private function isValidExpoToken(string $token): bool
    {
        return str_starts_with($token, 'ExponentPushToken[') ||
               str_starts_with($token, 'ExpoPushToken[');
    }

    /**
     * Process the response and handle any token errors.
     */
    private function processResponse(array $response, array $tokens): void
    {
        if (!isset($response['data'])) {
            return;
        }

        foreach ($response['data'] as $index => $ticket) {
            if (isset($ticket['status']) && $ticket['status'] === 'error') {
                $token = $tokens[$index] ?? null;

                Log::warning('Expo push token error', [
                    'token' => $token,
                    'error' => $ticket['message'] ?? 'Unknown error',
                    'details' => $ticket['details'] ?? null,
                ]);

                // If the token is invalid, we should mark it as inactive
                if (isset($ticket['details']['error']) &&
                    in_array($ticket['details']['error'], ['DeviceNotRegistered', 'InvalidCredentials'])) {
                    $this->deactivateToken($token);
                }
            }
        }
    }

    /**
     * Deactivate a push token that is no longer valid.
     */
    private function deactivateToken(?string $token): void
    {
        if (!$token) {
            return;
        }

        \App\Models\UserDevice::where('push_token', $token)
            ->update(['is_active' => false]);

        Log::info('Deactivated invalid push token', ['token' => $token]);
    }
}
