import apiClient from './client'

export interface AdminRetailer {
  id: number
  name: string
  slug: string
  logo_url: string | null
  api_base_url: string
  api_key: string | null
  api_config: Record<string, unknown> | null
  is_active: boolean
  coming_soon: boolean
  rate_limit_per_hour: number
  created_at: string
  updated_at: string
}

export interface AdminAnnouncement {
  id: number
  title: string | null
  message: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  is_admin: boolean
  email_verified_at: string | null
  phone_verified_at: string | null
  created_at: string
  tracked_products_count?: number
  vehicle_finance_sheets_count?: number
  vehicle_lease_sheets_count?: number
  devices_count?: number
}

export interface PaginatedUsers {
  data: AdminUser[]
  current_page: number
  last_page: number
  total: number
}

export type BugReportStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export interface AdminBugReport {
  id: number
  user_id: number | null
  user?: { id: number; email: string; first_name: string | null; last_name: string | null } | null
  page_url: string
  subject: string
  description: string
  status: BugReportStatus
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface PaginatedBugReports {
  data: AdminBugReport[]
  current_page: number
  last_page: number
  total: number
}

export const adminRetailersApi = {
  async list(): Promise<AdminRetailer[]> {
    const { data } = await apiClient.get<{ retailers: AdminRetailer[] }>('/admin/retailers')
    return data.retailers
  },
  async availableSlugs(): Promise<{ registered: string[]; available: string[] }> {
    const { data } = await apiClient.get<{ registered: string[]; available: string[] }>('/admin/retailers/available-slugs')
    return data
  },
  async create(payload: Partial<AdminRetailer>): Promise<AdminRetailer> {
    const { data } = await apiClient.post<{ retailer: AdminRetailer }>('/admin/retailers', payload)
    return data.retailer
  },
  async update(id: number, payload: Partial<AdminRetailer>): Promise<AdminRetailer> {
    const { data } = await apiClient.put<{ retailer: AdminRetailer }>(`/admin/retailers/${id}`, payload)
    return data.retailer
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/retailers/${id}`)
  },
}

export const adminAnnouncementsApi = {
  async list(): Promise<AdminAnnouncement[]> {
    const { data } = await apiClient.get<{ announcements: AdminAnnouncement[] }>('/admin/announcements')
    return data.announcements
  },
  async create(payload: Partial<AdminAnnouncement>): Promise<AdminAnnouncement> {
    const { data } = await apiClient.post<{ announcement: AdminAnnouncement }>('/admin/announcements', payload)
    return data.announcement
  },
  async update(id: number, payload: Partial<AdminAnnouncement>): Promise<AdminAnnouncement> {
    const { data } = await apiClient.put<{ announcement: AdminAnnouncement }>(`/admin/announcements/${id}`, payload)
    return data.announcement
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/announcements/${id}`)
  },
}

export const adminUsersApi = {
  async list(params: { search?: string; page?: number } = {}): Promise<PaginatedUsers> {
    const { data } = await apiClient.get<{ users: PaginatedUsers }>('/admin/users', { params })
    return data.users
  },
  async get(id: number): Promise<AdminUser> {
    const { data } = await apiClient.get<{ user: AdminUser }>(`/admin/users/${id}`)
    return data.user
  },
  async update(id: number, payload: Partial<AdminUser>): Promise<AdminUser> {
    const { data } = await apiClient.patch<{ user: AdminUser }>(`/admin/users/${id}`, payload)
    return data.user
  },
}

export const adminBugReportsApi = {
  async list(params: { status?: BugReportStatus; page?: number } = {}): Promise<PaginatedBugReports> {
    const { data } = await apiClient.get<{ bug_reports: PaginatedBugReports }>('/admin/bug-reports', { params })
    return data.bug_reports
  },
  async get(id: number): Promise<AdminBugReport> {
    const { data } = await apiClient.get<{ bug_report: AdminBugReport }>(`/admin/bug-reports/${id}`)
    return data.bug_report
  },
  async update(id: number, payload: { status: BugReportStatus }): Promise<AdminBugReport> {
    const { data } = await apiClient.put<{ bug_report: AdminBugReport }>(`/admin/bug-reports/${id}`, payload)
    return data.bug_report
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/bug-reports/${id}`)
  },
}
