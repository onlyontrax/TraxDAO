export interface IAddress {
  _id: string;

  source: string;

  sourceId: string;

  name: string;

  country: string;

  state: string;

  city: string;

  streetNumber: string;

  streetAddress: string;

  zipCode: string;

  description: string;

  createdAt: Date;

  updatedAt: Date;
}
