<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $alertType === 'target_reached' ? 'Target Price Reached' : 'Price Drop Alert' }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
        }
        .product-info {
            background-color: #f9fafb;
            border-left: 4px solid #4f46e5;
            padding: 20px;
            margin: 20px 0;
        }
        .product-name {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 10px;
        }
        .price-info {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 15px;
            background-color: #fff;
            border-radius: 6px;
        }
        .price-label {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .price-value {
            font-size: 20px;
            font-weight: 700;
        }
        .price-current {
            color: #10b981;
        }
        .price-retail {
            color: #6b7280;
            text-decoration: line-through;
        }
        .savings {
            background-color: #d1fae5;
            color: #065f46;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
            font-weight: 600;
            font-size: 18px;
        }
        .retailer {
            color: #6b7280;
            font-size: 14px;
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                @if($alertType === 'target_reached')
                    🎯 Target Price Reached!
                @else
                    📉 Price Drop Alert!
                @endif
            </h1>
        </div>

        <div class="product-info">
            <div class="product-name">{{ $product->product_name }}</div>
            <div class="retailer">Retailer: {{ $product->retailer->name }}</div>

            <div class="price-info">
                <div>
                    <div class="price-label">Current Price</div>
                    <div class="price-value price-current">${{ number_format($product->current_price, 2) }}</div>
                </div>
                <div>
                    <div class="price-label">Retail Price</div>
                    <div class="price-value price-retail">${{ number_format($product->retail_price, 2) }}</div>
                </div>
            </div>

            @php
                $savings = $product->retail_price - $product->current_price;
                $percentage = $product->retail_price > 0 ? (($savings / $product->retail_price) * 100) : 0;
            @endphp

            <div class="savings">
                You save ${{ number_format($savings, 2) }} ({{ number_format($percentage, 1) }}% off)
            </div>

            @if($product->retailer_url)
                <div style="text-align: center;">
                    <a href="{{ $product->retailer_url }}" class="button">View Product</a>
                </div>
            @endif
        </div>

        @if($alertType === 'target_reached')
            <p>Great news! The product has reached your target price of <strong>${{ number_format($product->target_price, 2) }}</strong>.</p>
            <p>This tracking has been automatically stopped. You can view all your tracked products in your dashboard.</p>
        @else
            <p>The price has dropped! This product is now available at a lower price than before.</p>
        @endif

        <div class="footer">
            <p>You're receiving this email because you're tracking this product on TheFrugalist.</p>
            <p>Visit your <a href="{{ url('/price-tracker') }}">Price Tracker Dashboard</a> to manage your tracked products.</p>
        </div>
    </div>
</body>
</html>
