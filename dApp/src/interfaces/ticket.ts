export interface ITicket {
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
    tiers: [{
        name: string,
        supply: number,
        price: number
    }]
    address: string;
    performer: any;
    createdAt: Date;
    updatedAt: Date;
    isBookMarked: boolean;
    downloadLink?: string;
    latitude: number;
    longitude: number;
    date: string;
    start: string;
    end: string;
  }