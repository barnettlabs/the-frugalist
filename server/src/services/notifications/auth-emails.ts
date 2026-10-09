/**
 * The account emails: password reset and email verification.
 *
 * Laravel sent both through its built-in notifications, so there was no template
 * to port. These follow the price-drop email's look so the three read as one
 * product. Each takes a finished URL - building it is the caller's concern,
 * because the reset link goes to the web app while the verification link goes
 * to the API, which verifies and then redirects.
 */

type AuthEmail = { subject: string; html: string; text: string };

const escape = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

function layout(title: string, intro: string, action: string, url: string, outro: string): string {
	return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
.container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h1 { color: #4f46e5; margin: 0 0 20px; font-size: 24px; text-align: center; }
.button { display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
.link { word-break: break-all; color: #6b7280; font-size: 12px; }
.footer { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px; }
</style>
</head>
<body>
<div class="container">
  <h1>${title}</h1>
  <p>${intro}</p>
  <p style="text-align: center; margin: 28px 0;"><a href="${escape(url)}" class="button">${action}</a></p>
  <p>${outro}</p>
  <p class="link">If the button does not work, paste this link into your browser:<br>${escape(url)}</p>
  <div class="footer">TheFrugalist</div>
</div>
</body>
</html>`;
}

export function passwordResetEmail(url: string): AuthEmail {
	const intro = 'We received a request to reset the password for your TheFrugalist account.';
	const outro =
		'This link expires in one hour. If you did not ask to reset your password, you can ignore this email - your password will not change.';

	return {
		subject: 'Reset your TheFrugalist password',
		html: layout('Reset your password', intro, 'Reset password', url, outro),
		text: `${intro}\n\nReset your password: ${url}\n\n${outro}`,
	};
}

export function verificationEmail(url: string): AuthEmail {
	const intro = 'Confirm this is your email address to start receiving price alerts.';
	const outro = 'If you did not create a TheFrugalist account, you can ignore this email.';

	return {
		subject: 'Verify your TheFrugalist email address',
		html: layout('Verify your email', intro, 'Verify email', url, outro),
		text: `${intro}\n\nVerify your email: ${url}\n\n${outro}`,
	};
}
