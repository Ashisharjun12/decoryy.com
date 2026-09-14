export type PayoutStatus = 'PAID' | 'PROCESSING' | 'PENDING' | 'FAILED' | 'CANCELLED';

export type MockPayout = {
  id: string;
  dateLabel: string;
  amount: number;
  status: PayoutStatus;
  title: string;
};

export type PayoutSummary = {
  available: number;
  pending: number;
  earnedThisMonth: number;
  codDues: number;
  codCapWarning: boolean;
  minWithdrawalPaise: number;
  canWithdraw: boolean;
  withdrawDisabledReason: string | null;
};

export type WalletTransactionDirection = 'credit' | 'debit';

export type WalletTransaction = {
  id: string;
  title: string;
  dateLabel: string;
  amountPaise: number;
  direction: WalletTransactionDirection;
};

export const MOCK_PAYOUT_SUMMARY: PayoutSummary = {
  available: 820000,
  pending: 420000,
  earnedThisMonth: 1240000,
  codDues: 185000,
  codCapWarning: true,
  minWithdrawalPaise: 10000,
  canWithdraw: true,
  withdrawDisabledReason: null,
};

export const MOCK_SETTLEMENTS: MockPayout[] = [
  {
    id: 'settlement-1',
    dateLabel: '28 Aug 2025',
    amount: 1240000,
    status: 'PAID',
    title: 'Weekly settlement',
  },
  {
    id: 'settlement-2',
    dateLabel: '14 Aug 2025',
    amount: 980000,
    status: 'PAID',
    title: 'Weekly settlement',
  },
  {
    id: 'settlement-3',
    dateLabel: '1 Sep 2025',
    amount: 420000,
    status: 'PROCESSING',
    title: 'Settlement in progress',
  },
];

/** @deprecated Use MOCK_SETTLEMENTS */
export const MOCK_PAYOUTS = MOCK_SETTLEMENTS;

export const MOCK_WALLET_HISTORY: WalletTransaction[] = [
  {
    id: 'txn-1',
    title: 'Birthday decor booking',
    dateLabel: 'Today, 2:40 PM',
    amountPaise: 185000,
    direction: 'credit',
  },
  {
    id: 'txn-2',
    title: 'Withdrawal to HDFC Bank',
    dateLabel: 'Yesterday, 6:15 PM',
    amountPaise: 500000,
    direction: 'debit',
  },
  {
    id: 'txn-3',
    title: 'Anniversary setup booking',
    dateLabel: '10 Sep 2025',
    amountPaise: 224000,
    direction: 'credit',
  },
  {
    id: 'txn-4',
    title: 'Platform service fee',
    dateLabel: '8 Sep 2025',
    amountPaise: 12000,
    direction: 'debit',
  },
  {
    id: 'txn-5',
    title: 'Housewarming decor booking',
    dateLabel: '5 Sep 2025',
    amountPaise: 310000,
    direction: 'credit',
  },
  {
    id: 'txn-6',
    title: 'Withdrawal to UPI',
    dateLabel: '3 Sep 2025',
    amountPaise: 300000,
    direction: 'debit',
  },
];

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PAID: 'Paid',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};
