/* eslint-disable no-shadow */
export type PaymentAccounnt =
  | 'wire'
  | 'paypal'
  | 'issue_check_us'
  | 'deposit'
  | 'payoneer'
  | 'bitpay';
export enum PAYMENT_ACCOUNT {
  WIRE = 'wire',
  PAYPAL = 'paypal',
  ISSUE = 'issue_check_us',
  DEPOSIT = 'deposit',
  PAYONNEER = 'payoneer',
  BITPAY = 'bitpay'
}
export const paymentAccountTypes = [
  { value: 'wire', title: 'Wire Transfer (Free)' },
  { value: 'paypal', title: 'Paypal' },
  { value: 'issue_check_us', title: 'Issue Check (U.S. Only)' },
  { value: 'deposit', title: 'Direct Deposit' },
  { value: 'payoneer', title: 'Payoneer' },
  { value: 'bitpay', title: 'Bitpay' }
];
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'done';

export enum PAYOUT_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DONE = 'done'
}

export interface PayoutRequestInterface {
  _id: string;
  sourceId: string;
  source: string;
  paymentAccountType: PaymentAccounnt;
  requestNote: string;
  adminNote: string;
  status: PayoutStatus;
  requestTokens: number;
  createdAt: Date;
  updatedAt: Date;
}
