import { logger } from '../../lib/logger.js';

/**
 * OpenAI-compatible chat client.
 *
 * Ports App\Services\Ai\OpenAiCompatibleClient. Providers are rows in
 * ai_providers with their own base URL and key, so this talks to whatever is
 * configured - OpenAI, an OpenRouter-style gateway, or a local model - rather
 * than to one vendor.
 *
 * Every failure becomes a result rather than an exception, because the caller
 * logs the outcome to ai_invocations either way and the admin UI reads that log
 * to explain what happened.
 */

export type ProviderConfig = {
	id: number;
	name: string;
	baseUrl: string;
	apiKey: string | null;
	defaultModel: string | null;
};

export type ChatOptions = {
	model?: string | null;
	temperature?: number | null;
	topP?: number | null;
	maxTokens?: number | null;
	responseFormat?: { type: string } | null;
};

export type ChatResult = {
	success: boolean;
	content: string | null;
	rawBody: string | null;
	latencyMs: number;
	promptTokens: number | null;
	completionTokens: number | null;
	error: string | null;
	requestPayload: Record<string, unknown>;
};

const TIMEOUT_MS = 120_000;

export async function chat(
	provider: ProviderConfig,
	messages: { role: string; content: string }[],
	options: ChatOptions = {},
): Promise<ChatResult> {
	const startedAt = Date.now();

	// array_filter dropped every null, so the provider never received an explicit
	// null for an unset option - some gateways reject that.
	const payload: Record<string, unknown> = { messages };
	const model = options.model ?? provider.defaultModel;

	if (model) payload.model = model;
	if (options.temperature !== null && options.temperature !== undefined) {
		payload.temperature = options.temperature;
	}
	if (options.topP !== null && options.topP !== undefined) payload.top_p = options.topP;
	if (options.maxTokens !== null && options.maxTokens !== undefined) {
		payload.max_tokens = options.maxTokens;
	}
	if (options.responseFormat) payload.response_format = options.responseFormat;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const response = await fetch(`${trimSlash(provider.baseUrl)}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
			},
			body: JSON.stringify(payload),
			signal: controller.signal,
		});

		const latencyMs = Date.now() - startedAt;
		const rawBody = await response.text();

		if (!response.ok) {
			return {
				success: false,
				content: null,
				rawBody,
				latencyMs,
				promptTokens: null,
				completionTokens: null,
				// Format preserved - the admin UI displays this string verbatim.
				error: `http_${response.status}: ${rawBody}`,
				requestPayload: payload,
			};
		}

		const body = JSON.parse(rawBody) as {
			choices?: { message?: { content?: string } }[];
			usage?: { prompt_tokens?: number; completion_tokens?: number };
		};

		return {
			success: true,
			content: body.choices?.[0]?.message?.content ?? null,
			rawBody,
			latencyMs,
			promptTokens: body.usage?.prompt_tokens ?? null,
			completionTokens: body.usage?.completion_tokens ?? null,
			error: null,
			requestPayload: payload,
		};
	} catch (err) {
		logger().error({ provider: provider.name, err }, 'ai provider request failed');

		return {
			success: false,
			content: null,
			rawBody: null,
			latencyMs: Date.now() - startedAt,
			promptTokens: null,
			completionTokens: null,
			error: err instanceof Error ? err.message : String(err),
			requestPayload: payload,
		};
	} finally {
		clearTimeout(timeout);
	}
}

/** Provider connectivity check, used by the admin "test" button. */
export async function ping(provider: ProviderConfig, model?: string | null): Promise<ChatResult> {
	return chat(provider, [{ role: 'user', content: 'ping' }], {
		model: model ?? provider.defaultModel,
		maxTokens: 5,
		temperature: 0,
	});
}

export async function listModels(
	provider: ProviderConfig,
): Promise<{ ok: boolean; error?: string; models: string[] }> {
	try {
		const response = await fetch(`${trimSlash(provider.baseUrl)}/models`, {
			headers: provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {},
			signal: AbortSignal.timeout(30_000),
		});

		if (!response.ok) {
			return { ok: false, error: `http_${response.status}`, models: [] };
		}

		const body = (await response.json()) as { data?: { id?: string }[] };

		return {
			ok: true,
			models: (body.data ?? []).map((m) => m.id).filter((id): id is string => Boolean(id)).sort(),
		};
	} catch (err) {
		return { ok: false, error: err instanceof Error ? err.message : String(err), models: [] };
	}
}

function trimSlash(url: string): string {
	return url.replace(/\/+$/, '');
}
