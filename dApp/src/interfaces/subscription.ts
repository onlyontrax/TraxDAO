export interface ISubscription {
  _id: string;
  subscriptionType?: string;
  userId?: string;
  userInfo?: any;
  performerId?: string;
  performerInfo?: any;
  subscriptionId?: string;
  transactionId?: string;
  paymentGateway?: string;
  status?: string;
  meta?: any;
  startRecurringDate?: Date;
  nextRecurringDate?: Date;
  blockedUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  expiredAt?: Date;
}
