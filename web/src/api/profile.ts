import apiClient from './client'
import type { User, Profile } from '@/types'

export interface ProfileUpdateData {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export interface PasswordUpdateData {
  current_password: string
  password: string
  password_confirmation: string
}

export interface ProfileResponse {
  user: User
  profile: Profile | null
}

export const profileApi = {
  async getProfile(): Promise<ProfileResponse> {
    const { data } = await apiClient.get<ProfileResponse>('/profile')
    return data
  },

  async updateProfile(profileData: ProfileUpdateData): Promise<ProfileResponse> {
    const { data } = await apiClient.put<ProfileResponse>('/profile', profileData)
    return data
  },

  async updatePassword(passwordData: PasswordUpdateData): Promise<{ message: string }> {
    const { data } = await apiClient.put<{ message: string }>('/password', passwordData)
    return data
  },

  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/profile', { data: { password } })
  },
}
