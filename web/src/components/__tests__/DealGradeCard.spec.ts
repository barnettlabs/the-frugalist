import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/api/client', () => {
  return { default: { post: vi.fn() } }
})

import apiClient from '@/api/client'
import DealGradeCard from '@/components/DealGradeCard.vue'

const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

describe('DealGradeCard', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('shows the initial CTA before any run', () => {
    const wrapper = mount(DealGradeCard, {
      props: { agentSlug: 'deal-grade-finance', calculatorType: 'finance', inputs: { msrp: 35000 } },
    })
    expect(wrapper.text()).toContain('Grade this deal')
  })

  it('calls compute then agent and renders the grade', async () => {
    postMock
      .mockResolvedValueOnce({ data: { inputs: { msrp: 35000 }, computed: { monthly_payment: 645 } } })
      .mockResolvedValueOnce({
        data: {
          agent: { slug: 'deal-grade-finance', version: 1 },
          response: {
            grade: 'B', rating: 'good', confidence: 0.7,
            summary: 'Decent.', red_flags: ['high fees'], tips: ['negotiate'],
          },
          cached: false,
        },
      })

    const wrapper = mount(DealGradeCard, {
      props: { agentSlug: 'deal-grade-finance', calculatorType: 'finance', inputs: { msrp: 35000 } },
    })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(postMock).toHaveBeenNthCalledWith(1, '/calculators/finance/compute', expect.objectContaining({ msrp: 35000, with_schedule: false }))
    expect(postMock).toHaveBeenNthCalledWith(2, '/ai/agents/deal-grade-finance/run', expect.objectContaining({
      context: { inputs: { msrp: 35000 }, computed: { monthly_payment: 645 } },
    }))
    expect(wrapper.text()).toContain('B')
    expect(wrapper.text()).toContain('Decent.')
    expect(wrapper.text()).toContain('high fees')
    expect(wrapper.text()).toContain('negotiate')
  })

  it('shows a friendly error when the api fails', async () => {
    postMock.mockRejectedValueOnce({ response: { status: 500, data: {} } })

    const wrapper = mount(DealGradeCard, {
      props: { agentSlug: 'deal-grade-finance', calculatorType: 'finance', inputs: { msrp: 35000 } },
    })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toMatch(/Could not grade/i)
  })

  it('surfaces a daily-limit message on 429', async () => {
    postMock.mockResolvedValueOnce({ data: { inputs: {}, computed: {} } })
    postMock.mockRejectedValueOnce({ response: { status: 429, data: {} } })

    const wrapper = mount(DealGradeCard, {
      props: { agentSlug: 'deal-grade-finance', calculatorType: 'finance', inputs: {} },
    })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toMatch(/daily limit/i)
  })
})
