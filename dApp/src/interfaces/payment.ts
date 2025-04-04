export class PaymentProductModel {
  name: string;

  description: string;

  price: number;

  tokenSymbol?: string;

  cryptoTransactionId?: string;

  isCrypto?: boolean;

  extraInfo: any;

  productType: string;

  productId: string;

  purchasedTier?: string;

  limitSupply?: boolean;
}

export class PaymentTicketModel {
  name?: string;

  description?: string;

  price?: number | string;

  tokenSymbol?: string;

  cryptoTransactionId?: string;

  isCrypto?: boolean;

  extraInfo?: any;

  purchasedTier: string;

  type?: string;

  ticketId?: string;
}

export interface ITransaction {
  paymentGateway: string;
  source: string;
  sourceId: string;
  target: string;
  targetId: string;
  type: string;
  paymentResponseInfo: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  products: PaymentProductModel[];
  tokenSymbol?: string;
  cryptoTransactionId?: string;
  isCrypto?: boolean;
  accountSenderId: string;
  accountSenderInfo?: any;
  accountReceiverId: string;
  accountReceiverInfo?: any;
}

export interface ICoupon {
  _id: string;
  name: string;
  description: string;
  code: string;
  value: number;
  expiredDate: string | Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder {
  _id: string;

  transactionId: string;

  performerId: string;

  performerInfo?: any;

  userId: string;

  userInfo?: any;

  orderNumber: string;

  shippingCode: string;

  shippingOption: string;

  productId: string;

  productInfo: any;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  tokenSymbol?: string;

  cryptoTransactionId?: string;

  isCrypto?: boolean;

  deliveryAddress?: string;

  deliveryStatus: string;

  postalCode?: string;

  userNote?: string;

  phoneNumber?: string;

  createdAt: Date;

  updatedAt: Date;

  digitalPath: string;

  deliveryAddressId: string;

  accountSenderId: string;

  accountSenderInfo?: any;

  accountReceiverId: string;

  accountReceiverInfo?: any;
}
