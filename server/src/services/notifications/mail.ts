import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

/**
 * Outbound mail.
 *
 * Three transports, chosen by MAIL_TRANSPORT, matching how the Laravel app was
 * configured per environment:
 *
 *   resend  production. Same vendor and API key as resend-php.
 *   smtp    local development, pointed at Mailpit by compose.yaml.
 *   log     tests and anything without credentials.
 *
 * `log` is the default rather than `resend` on purpose: a misconfigured
 * environment should fail to send visibly, not send real email to real users
 * from a developer's machine.
 */

export type MailMessage = {
	to: string;
	subject: string;
	html: string;
	text?: string;
};

export type MailResult = { sent: boolean; transport: string; error?: string };

export async function sendMail(message: MailMessage): Promise<MailResult> {
	const config = env();
	const log = logger();

	switch (config.MAIL_TRANSPORT) {
		case 'resend':
			return sendViaResend(message);

		case 'smtp':
			return sendViaSmtp(message);

		case 'log':
		default:
			log.info(
				{ to: message.to, subject: message.subject, bytes: message.html.length },
				'mail (log transport - not sent)',
			);
			return { sent: true, transport: 'log' };
	}
}

async function sendViaResend(message: MailMessage): Promise<MailResult> {
	const config = env();
	const log = logger();

	if (!config.RESEND_KEY) {
		log.error('MAIL_TRANSPORT=resend but RESEND_KEY is not set');
		return { sent: false, transport: 'resend', error: 'RESEND_KEY missing' };
	}

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${config.RESEND_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: `${config.MAIL_FROM_NAME} <${config.MAIL_FROM_ADDRESS}>`,
				to: [message.to],
				subject: message.subject,
				html: message.html,
				...(message.text ? { text: message.text } : {}),
			}),
		});

		if (!response.ok) {
			const body = await response.text();
			log.error({ status: response.status, body: body.slice(0, 1000) }, 'resend send failed');
			return { sent: false, transport: 'resend', error: `HTTP ${response.status}` };
		}

		return { sent: true, transport: 'resend' };
	} catch (err) {
		log.error({ err }, 'resend send threw');
		return {
			sent: false,
			transport: 'resend',
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

/**
 * Minimal SMTP submission for Mailpit.
 *
 * Deliberately not a full SMTP client - Mailpit accepts any auth and does not
 * require TLS, and this path never runs in production. Anything beyond local
 * development goes through Resend.
 */
async function sendViaSmtp(message: MailMessage): Promise<MailResult> {
	const config = env();
	const log = logger();

	try {
		const net = await import('node:net');

		return await new Promise<MailResult>((resolve) => {
			const socket = net.createConnection(
				{ host: config.SMTP_HOST, port: config.SMTP_PORT },
				() => {
					const body = [
						`From: ${config.MAIL_FROM_NAME} <${config.MAIL_FROM_ADDRESS}>`,
						`To: ${message.to}`,
						`Subject: ${message.subject}`,
						'MIME-Version: 1.0',
						'Content-Type: text/html; charset=utf-8',
						'',
						message.html,
						'.',
					].join('\r\n');

					const script = [
						'EHLO localhost',
						`MAIL FROM:<${config.MAIL_FROM_ADDRESS}>`,
						`RCPT TO:<${message.to}>`,
						'DATA',
						body,
						'QUIT',
					];

					// Mailpit tolerates a pipelined conversation, which keeps this to a
					// few lines instead of a full state machine.
					socket.write(`${script.join('\r\n')}\r\n`);
				},
			);

			socket.setTimeout(5_000);
			socket.on('timeout', () => {
				socket.destroy();
				resolve({ sent: false, transport: 'smtp', error: 'timeout' });
			});
			socket.on('error', (err) => {
				log.error({ err }, 'smtp send failed');
				resolve({ sent: false, transport: 'smtp', error: err.message });
			});
			socket.on('close', () => resolve({ sent: true, transport: 'smtp' }));
		});
	} catch (err) {
		return {
			sent: false,
			transport: 'smtp',
			error: err instanceof Error ? err.message : String(err),
		};
	}
}
