import apiClient from './client'

export interface AiProvider {
  id: number
  slug: string
  name: string
  base_url: string
  has_api_key: boolean
  default_model: string | null
  enabled: boolean
  is_default: boolean
  sends_data_externally: boolean
  timeout_seconds: number
  settings: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface AiAgent {
  id: number
  slug: string
  name: string
  description: string | null
  provider_id: number | null
  provider?: { id: number; slug: string; name: string }
  model: string | null
  system_prompt: string
  user_prompt_template: string
  response_format: 'json_object' | 'json_schema' | 'text'
  output_schema: Record<string, unknown> | null
  temperature: number
  top_p: number
  max_tokens: number
  version: number
  enabled: boolean
  rate_limit_per_user_day: number
  settings: Record<string, unknown> | null
}

export interface AiAgentVersion {
  id: number
  agent_id: number
  version: number
  snapshot: Record<string, unknown>
  created_at: string
}

export interface AiAgentRoute {
  id: number
  context_key: string
  agent_id: number
  agent?: { id: number; slug: string; name: string }
  priority: number
  enabled: boolean
}

export interface AiInvocation {
  id: number
  user_id: number | null
  user?: { id: number; first_name: string | null; last_name: string | null; email: string } | null
  agent_id: number | null
  agent?: { id: number; slug: string; name: string }
  agent_version: number | null
  provider_id: number | null
  provider?: { id: number; slug: string; name: string }
  model: string | null
  context_key: string | null
  status: 'pending' | 'success' | 'invalid_json' | 'error' | 'timeout'
  error: string | null
  latency_ms: number | null
  prompt_tokens: number | null
  completion_tokens: number | null
  cached: boolean
  request_payload: Record<string, unknown> | null
  response: Record<string, unknown> | null
  raw_response: string | null
  created_at: string
}

export interface ProviderTestResult {
  models: { ok: boolean; error?: string; models: string[] }
  ping: { ok: boolean; content: string | null; error: string | null; latency_ms: number }
}

export const adminAiProvidersApi = {
  async list(): Promise<AiProvider[]> {
    const { data } = await apiClient.get<{ providers: AiProvider[] }>('/admin/ai/providers')
    return data.providers
  },
  async create(payload: Partial<AiProvider> & { api_key?: string }): Promise<AiProvider> {
    const { data } = await apiClient.post<{ provider: AiProvider }>('/admin/ai/providers', payload)
    return data.provider
  },
  async update(id: number, payload: Partial<AiProvider> & { api_key?: string }): Promise<AiProvider> {
    const { data } = await apiClient.patch<{ provider: AiProvider }>(`/admin/ai/providers/${id}`, payload)
    return data.provider
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/ai/providers/${id}`)
  },
  async test(id: number, model?: string): Promise<ProviderTestResult> {
    const { data } = await apiClient.post<ProviderTestResult>(`/admin/ai/providers/${id}/test`, { model })
    return data
  },
}

export const adminAiAgentsApi = {
  async list(): Promise<AiAgent[]> {
    const { data } = await apiClient.get<{ agents: AiAgent[] }>('/admin/ai/agents')
    return data.agents
  },
  async get(id: number): Promise<AiAgent> {
    const { data } = await apiClient.get<{ agent: AiAgent }>(`/admin/ai/agents/${id}`)
    return data.agent
  },
  async create(payload: Partial<AiAgent>): Promise<AiAgent> {
    const { data } = await apiClient.post<{ agent: AiAgent }>('/admin/ai/agents', payload)
    return data.agent
  },
  async update(id: number, payload: Partial<AiAgent>): Promise<AiAgent> {
    const { data } = await apiClient.patch<{ agent: AiAgent }>(`/admin/ai/agents/${id}`, payload)
    return data.agent
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/ai/agents/${id}`)
  },
  async versions(id: number): Promise<AiAgentVersion[]> {
    const { data } = await apiClient.get<{ versions: AiAgentVersion[] }>(`/admin/ai/agents/${id}/versions`)
    return data.versions
  },
  async rollback(id: number, version: number): Promise<AiAgent> {
    const { data } = await apiClient.post<{ agent: AiAgent }>(`/admin/ai/agents/${id}/rollback/${version}`)
    return data.agent
  },
  async preview(id: number, context: Record<string, unknown>): Promise<{ ok: boolean; response: any; cached: boolean; error: string | null; message: string | null }> {
    const { data } = await apiClient.post(`/admin/ai/agents/${id}/preview`, { context, use_cache: false })
    return data
  },
}

export const adminAiRoutesApi = {
  async list(): Promise<AiAgentRoute[]> {
    const { data } = await apiClient.get<{ routes: AiAgentRoute[] }>('/admin/ai/routes')
    return data.routes
  },
  async create(payload: Partial<AiAgentRoute>): Promise<AiAgentRoute> {
    const { data } = await apiClient.post<{ route: AiAgentRoute }>('/admin/ai/routes', payload)
    return data.route
  },
  async update(id: number, payload: Partial<AiAgentRoute>): Promise<AiAgentRoute> {
    const { data } = await apiClient.put<{ route: AiAgentRoute }>(`/admin/ai/routes/${id}`, payload)
    return data.route
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/ai/routes/${id}`)
  },
}

export interface PaginatedInvocations {
  data: AiInvocation[]
  current_page: number
  last_page: number
  total: number
}

export const adminAiInvocationsApi = {
  async list(params: { agent_id?: number; status?: string; errors_only?: boolean; page?: number } = {}): Promise<PaginatedInvocations> {
    const { data } = await apiClient.get<PaginatedInvocations>('/admin/ai/invocations', { params })
    return data
  },
  async get(id: number): Promise<AiInvocation> {
    const { data } = await apiClient.get<{ invocation: AiInvocation }>(`/admin/ai/invocations/${id}`)
    return data.invocation
  },
}
