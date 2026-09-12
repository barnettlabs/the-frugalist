/**
 * The price-drop email.
 *
 * Ports resources/views/emails/price-drop-alert.blade.php and the subject lines
 * from App\Mail\PriceDropAlert. This is the only Blade template in the whole
 * Laravel app, which is why it is hand-ported here rather than pulling in a
 * templating dependency.
 *
 * The analysis suggested React Email, and that is still the right destination -
 * its preview server would replace the PlaygroundController endpoints. But it
 * adds a build step and a JSX pipeline for one template, so it belongs in its
 * own change rather than inside the migration. Tracked in MIGRATION.md.
 *
 * Copy, styling and the savings calculation are preserved. Note the savings
 * line compares retail to current, so it reads "you save" against list price
 * rather than against the previous price that triggered the alert - that is the
 * original behaviour.
 */

export type PriceDropEmailInput = {
	productName: string;
	retailerName?: string;
	alertType: string;
	oldPrice: number;
	newPrice: number;
	retailPrice?: number;
	targetPrice?: number;
	retailerUrl: string | null;
	/**
	 * The URL that *is* available, from product_metadata. Accepted but unused, so
	 * that turning the button on later is a one-line change in one place rather
	 * than a hunt through the job. See the note in jobs/check-prices.ts.
	 */
	availableRetailerUrl?: string | null;
};

const money = (value: number) =>
	value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const escape = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

export function priceDropEmail(input: PriceDropEmailInput): {
	subject: string;
	html: string;
	text: string;
} {
	const isTarget = input.alertType === 'target_reached';
	const subject = isTarget ? 'Target Price Reached!' : 'Price Drop Alert!';
	const heading = isTarget ? '🎯 Target Price Reached!' : '📉 Price Drop Alert!';

	const retail = input.retailPrice ?? input.oldPrice;
	const savings = retail - input.newPrice;
	const percentage = retail > 0 ? (savings / retail) * 100 : 0;

	const name = escape(input.productName);
	const retailer = input.retailerName ? escape(input.retailerName) : null;

	const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isTarget ? 'Target Price Reached' : 'Price Drop Alert'}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
.container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.header { text-align: center; margin-bottom: 30px; }
.header h1 { color: #4f46e5; margin: 0; font-size: 24px; }
.product-info { background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; }
.product-name { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.retailer { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
.price-info { display: flex; gap: 32px; margin: 16px 0; }
.price-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
.price-value { font-size: 20px; font-weight: 700; }
.price-current { color: #059669; }
.price-retail { color: #6b7280; text-decoration: line-through; }
.savings { color: #059669; font-weight: 600; margin: 16px 0; }
.button { display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 12px; }
.footer { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px; }
</style>
</head>
<body>
<div class="container">
  <div class="header"><h1>${heading}</h1></div>
  <div class="product-info">
    <div class="product-name">${name}</div>
    ${retailer ? `<div class="retailer">Retailer: ${retailer}</div>` : ''}
    <div class="price-info">
      <div>
        <div class="price-label">Current Price</div>
        <div class="price-value price-current">$${money(input.newPrice)}</div>
      </div>
      <div>
        <div class="price-label">Retail Price</div>
        <div class="price-value price-retail">$${money(retail)}</div>
      </div>
    </div>
    <div class="savings">You save $${money(savings)} (${percentage.toFixed(1)}% off)</div>
    ${
			input.retailerUrl
				? `<div style="text-align: center;"><a href="${escape(input.retailerUrl)}" class="button">View Product</a></div>`
				: ''
		}
  </div>
  ${
		isTarget
			? `<p>Great news! The product has reached your target price${
					input.targetPrice !== undefined ? ` of <strong>$${money(input.targetPrice)}</strong>` : ''
				}.</p>
  <p>This tracking has been automatically stopped. You can view all your tracked products in your dashboard.</p>`
			: '<p>The price on a product you are tracking has dropped. You can view all your tracked products in your dashboard.</p>'
	}
  <div class="footer">You are receiving this because you are tracking this product on TheFrugalist.</div>
</div>
</body>
</html>`;

	const text = [
		heading,
		'',
		input.productName,
		retailer ? `Retailer: ${input.retailerName}` : null,
		`Current price: $${money(input.newPrice)}`,
		`Retail price: $${money(retail)}`,
		`You save $${money(savings)} (${percentage.toFixed(1)}% off)`,
		input.retailerUrl ? `\nView product: ${input.retailerUrl}` : null,
	]
		.filter((line) => line !== null)
		.join('\n');

	return { subject, html, text };
}
