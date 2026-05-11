<?php

namespace App\Http\Controllers;

use App\Mail\PriceDropAlert;
use App\Models\TrackedProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class PlaygroundController extends Controller
{
    /**
     * Get available email templates for testing.
     */
    public function emailTemplates(Request $request): JsonResponse
    {
        return response()->json([
            'templates' => [
                [
                    'id' => 'price_drop_target_reached',
                    'name' => 'Price Drop - Target Reached',
                    'description' => 'Sent when a tracked product hits the target price',
                ],
                [
                    'id' => 'price_drop_alert',
                    'name' => 'Price Drop - General Alert',
                    'description' => 'Sent when a tracked product price drops significantly',
                ],
                [
                    'id' => 'price_drop_back_in_stock',
                    'name' => 'Price Drop - Back in Stock',
                    'description' => 'Sent when a tracked product is back in stock',
                ],
                [
                    'id' => 'verify_email',
                    'name' => 'Email Verification',
                    'description' => 'Sent to verify user email address',
                ],
            ],
        ]);
    }

    /**
     * Send a test email.
     */
    public function sendTestEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template' => 'required|string|in:price_drop_target_reached,price_drop_alert,price_drop_back_in_stock,verify_email',
        ]);

        $user = $request->user();

        try {
            switch ($validated['template']) {
                case 'price_drop_target_reached':
                case 'price_drop_alert':
                case 'price_drop_back_in_stock':
                    $this->sendPriceDropEmail($user, $validated['template']);
                    break;

                case 'verify_email':
                    $user->sendEmailVerificationNotification();
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully to '.$user->email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview an email template (returns HTML).
     */
    public function previewEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template' => 'required|string|in:price_drop_target_reached,price_drop_alert,price_drop_back_in_stock',
        ]);

        $alertType = match ($validated['template']) {
            'price_drop_target_reached' => 'target_reached',
            'price_drop_alert' => 'price_drop',
            'price_drop_back_in_stock' => 'back_in_stock',
        };

        $mockProduct = $this->getMockTrackedProduct($request->user());
        $mailable = new PriceDropAlert($mockProduct, $alertType);

        return response()->json([
            'html' => $mailable->render(),
            'subject' => $mailable->envelope()->subject,
        ]);
    }

    /**
     * Send a price drop email with mock data.
     */
    private function sendPriceDropEmail($user, string $template): void
    {
        $alertType = match ($template) {
            'price_drop_target_reached' => 'target_reached',
            'price_drop_alert' => 'price_drop',
            'price_drop_back_in_stock' => 'back_in_stock',
        };

        $mockProduct = $this->getMockTrackedProduct($user);

        Mail::to($user->email)->send(new PriceDropAlert($mockProduct, $alertType));
    }

    /**
     * Create a mock TrackedProduct for testing.
     */
    private function getMockTrackedProduct($user): TrackedProduct
    {
        // Try to use a real tracked product if available
        $realProduct = TrackedProduct::where('user_id', $user->id)->first();

        if ($realProduct) {
            return $realProduct;
        }

        // Create a mock product (not saved to DB)
        $mock = new TrackedProduct;
        $mock->id = 0;
        $mock->user_id = $user->id;
        $mock->retailer_id = 1;
        $mock->sku_upc = '6505727';
        $mock->product_name = 'Samsung 65" Class OLED S90D Series Smart TV';
        $mock->product_description = 'Experience stunning picture quality with the Samsung OLED TV featuring 4K resolution and smart capabilities.';
        $mock->product_image_url = 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6578/6578613_sd.jpg';
        $mock->retail_price = 1799.99;
        $mock->current_price = 1499.99;
        $mock->target_price = 1499.99;
        $mock->is_active = true;
        $mock->notification_method = ['email', 'push'];

        return $mock;
    }
}
