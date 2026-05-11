/* eslint-disable max-lines-per-function */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';

import { DealGradeCard } from './deal-grade-card';

afterEach(cleanup);

const mockPost = jest.fn();
jest.mock('@/api/common', () => ({
  client: {
    post: (...args: unknown[]) => mockPost(...args),
  },
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

const withClient = (ui: React.ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
};

describe('DealGradeCard', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('renders the initial CTA', () => {
    setup(
      withClient(
        <DealGradeCard
          agentSlug="deal-grade-finance"
          calculatorType="finance"
          inputs={{ msrp: 35000 }}
        />
      )
    );
    expect(screen.getByText('Grade this deal')).toBeOnTheScreen();
  });

  it('shows the grade after a successful run', async () => {
    mockPost
      .mockResolvedValueOnce({
        data: { inputs: { msrp: 35000 }, computed: { monthly_payment: 645 } },
      })
      .mockResolvedValueOnce({
        data: {
          agent: { slug: 'deal-grade-finance', version: 1 },
          response: {
            grade: 'B',
            rating: 'good',
            confidence: 0.7,
            summary: 'Decent.',
            red_flags: ['watch the fees'],
            tips: ['ask for a lower rate'],
          },
          cached: false,
        },
      });

    const { user } = setup(
      withClient(
        <DealGradeCard
          agentSlug="deal-grade-finance"
          calculatorType="finance"
          inputs={{ msrp: 35000 }}
        />
      )
    );

    await user.press(screen.getByTestId('grade-deal-button'));

    await waitFor(() => {
      expect(screen.getByText('B')).toBeOnTheScreen();
    });
    expect(screen.getByText('Decent.')).toBeOnTheScreen();
    expect(screen.getByText('• watch the fees')).toBeOnTheScreen();
    expect(screen.getByText('• ask for a lower rate')).toBeOnTheScreen();
    expect(mockPost.mock.calls[0][0]).toBe('/api/calculators/finance/compute');
    expect(mockPost.mock.calls[1][0]).toBe(
      '/api/ai/agents/deal-grade-finance/run'
    );
  });

  it('surfaces a 429 rate-limit message', async () => {
    mockPost
      .mockResolvedValueOnce({ data: { inputs: {}, computed: {} } })
      .mockRejectedValueOnce({ response: { status: 429, data: {} } });

    const { user } = setup(
      withClient(
        <DealGradeCard
          agentSlug="deal-grade-finance"
          calculatorType="finance"
          inputs={{}}
        />
      )
    );

    await user.press(screen.getByTestId('grade-deal-button'));

    await waitFor(() => {
      expect(screen.getByText(/daily limit/i)).toBeOnTheScreen();
    });
  });
});
