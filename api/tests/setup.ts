import { vi } from 'vitest'

// Mock Ziggy global
global.route = vi.fn((name: string, params?: any) => {
  return `/mock-route/${name}${params ? `/${JSON.stringify(params)}` : ''}`
})

// Mock Inertia global
global.Inertia = {
  visit: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
  remember: vi.fn(),
  restore: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}