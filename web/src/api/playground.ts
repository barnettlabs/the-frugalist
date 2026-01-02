import apiClient from './client'

export interface EmailTemplate {
  id: string
  name: string
  description: string
}

export interface EmailTemplatesResponse {
  templates: EmailTemplate[]
}

export interface SendTestEmailResponse {
  success: boolean
  message: string
}

export interface PreviewEmailResponse {
  html: string
  subject: string
}

export const playgroundApi = {
  /**
   * Get available email templates for testing
   */
  async getEmailTemplates(): Promise<EmailTemplatesResponse> {
    const response = await apiClient.get('/playground/email-templates')
    return response.data
  },

  /**
   * Send a test email to the current user
   */
  async sendTestEmail(template: string): Promise<SendTestEmailResponse> {
    const response = await apiClient.post('/playground/send-test-email', { template })
    return response.data
  },

  /**
   * Preview an email template (returns rendered HTML)
   */
  async previewEmail(template: string): Promise<PreviewEmailResponse> {
    const response = await apiClient.post('/playground/preview-email', { template })
    return response.data
  },
}
