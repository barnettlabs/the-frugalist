<?php

namespace Tests\Feature;

use App\Models\Retailer;
use App\Models\TrackedProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The needs-check scope is raw, engine-specific SQL, which makes it the query
 * most likely to break quietly on the move to Postgres. A scope that throws
 * stops every scheduled price check; a scope that silently matches nothing does
 * the same without an error, which is worse. Neither had any coverage.
 */
class TrackedProductNeedsCheckTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $attributes = []): TrackedProduct
    {
        $user = User::factory()->create();
        $retailer = Retailer::create([
            // The last case creates two products, so the retailer name has to be
            // unique per call as well as the slug.
            'name' => 'Test Retailer '.uniqid(),
            'slug' => 'test-'.uniqid(),
            'api_base_url' => 'https://example.test',
        ]);

        return TrackedProduct::create(array_merge([
            'user_id' => $user->id,
            'retailer_id' => $retailer->id,
            'product_name' => 'Test Product',
            'sku_upc' => '12345',
            'retail_price' => 120,
            'current_price' => 100,
            'target_price' => 90,
            'is_active' => true,
            'tracking_start_date' => now()->subDay(),
            'check_interval' => 60,
        ], $attributes));
    }

    public function test_product_never_checked_is_due(): void
    {
        $product = $this->product(['last_checked_at' => null]);

        $this->assertTrue(
            TrackedProduct::needsCheck()->where('id', $product->id)->exists()
        );
    }

    public function test_product_checked_within_the_interval_is_not_due(): void
    {
        $product = $this->product(['last_checked_at' => now()->subMinutes(30)]);

        $this->assertFalse(
            TrackedProduct::needsCheck()->where('id', $product->id)->exists()
        );
    }

    public function test_product_checked_beyond_the_interval_is_due(): void
    {
        $product = $this->product(['last_checked_at' => now()->subMinutes(90)]);

        $this->assertTrue(
            TrackedProduct::needsCheck()->where('id', $product->id)->exists()
        );
    }

    public function test_interval_is_read_from_the_column_not_a_constant(): void
    {
        // Same elapsed time, different configured intervals. This is the part
        // that forces the interval to stay in SQL rather than being computed in
        // PHP, and therefore the part that differs between engines.
        $shortInterval = $this->product([
            'check_interval' => 15,
            'last_checked_at' => now()->subMinutes(30),
        ]);

        $longInterval = $this->product([
            'check_interval' => 240,
            'last_checked_at' => now()->subMinutes(30),
        ]);

        $due = TrackedProduct::needsCheck()->pluck('id')->all();

        $this->assertContains($shortInterval->id, $due);
        $this->assertNotContains($longInterval->id, $due);
    }
}
