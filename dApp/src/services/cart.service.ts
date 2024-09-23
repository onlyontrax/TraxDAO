import { IProduct } from 'src/interfaces';

export class CartService {
  getCartByUser(userId: string): Promise<any> {
    let existCart = typeof window !== 'undefined' ? localStorage.getItem(`cart_${userId}`) as any : null;
    existCart = existCart && existCart.length ? (JSON.parse(existCart) as IProduct) : [];
    return existCart;
  }
}

export const cartService = new CartService();
