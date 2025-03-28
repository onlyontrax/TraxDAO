export class IEarning {
  _id: string;

  userId: string;

  userInfo?: any;

  transactionId: string;

  transactionInfo?: any;

  performerId: string;

  performerInfo?: any;

  sourceType: string;

  grossPrice: number;

  netPrice: number;

  tokenSymbol?: string;

  cryptoTransactionId?: string;

  userType?: string;

  isCrypto?: boolean;

  commission: number;

  isPaid: boolean;

  accountSenderId: string;

  accountSenderInfo?: any;

  accountReceiverId: string;

  accountReceiverInfo?: any;

  createdAt: Date;

  paidAt: Date;
}
