export interface ShippingFee {
  type: string;
  fee: number;
}
export interface IProduct {
  _id: string;
  performerId: string;
  digitalFileId: string;
  digitalFileUrl: string;
  imageId: string;
  image: any;
  type: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  price: number;
  stock: number;
  performer: any;
  createdAt: Date;
  updatedAt: Date;
  isBookMarked: boolean;
  shippingFees: ShippingFee[];
  downloadLink?: string;
}
