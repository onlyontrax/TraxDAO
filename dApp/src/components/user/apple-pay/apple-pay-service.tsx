// ApplePayService.ts
import { Capacitor, registerPlugin } from '@capacitor/core';

interface ApplePaymentResult {
  status: 'success' | 'failed';
  message?: string;
}

interface ApplePayStatus {
  canMakePayments: boolean;
  canSetupCards: boolean;
}

interface ApplePayPlugin {
  canMakePayments(): Promise<ApplePayStatus>;
  startPayment(options: { token: string; amount: string; currency: string }): Promise<ApplePaymentResult>;
  presentApplePay(options: { amount: string; currency: string }): Promise<{ token: string }>;
}

const ApplePay = registerPlugin<ApplePayPlugin>('ApplePay');

export class ApplePayService {
  private static instance: ApplePayService;

  private constructor() {}

  public static getInstance(): ApplePayService {
    if (!ApplePayService.instance) {
      ApplePayService.instance = new ApplePayService();
    }
    return ApplePayService.instance;
  }

  /**
   * Checks if Apple Pay is available on the device
   */
  public async checkApplePayAvailability(): Promise<ApplePayStatus> {
    try {
      console.log("✅ ApplePay plugin registered:", ApplePay);
      const platform = Capacitor.getPlatform();
      console.log("🔍 Device check - Platform:", platform);

      if (platform !== 'ios') {
        return { canMakePayments: false, canSetupCards: false };
      }

      const result = await ApplePay.canMakePayments();
      console.log("Apple Pay Status:", result);
      return result;
    } catch (error) {
      console.error('Apple Pay check failed:', {
        error,
        stack: error.stack,
        platform: Capacitor.getPlatform(),
        timestamp: new Date().toISOString()
      });
      return { canMakePayments: false, canSetupCards: false };
    }
  }

  /**
   * Initiates Apple Pay and starts the payment process
   */
  public async startApplePayment(amount: string, currency: string = 'USD'): Promise<ApplePaymentResult> {
    try {
      if (Capacitor.getPlatform() !== 'ios') {
        throw new Error('Apple Pay is only available on iOS devices');
      }

      console.log("🔹 Checking Apple Pay availability...");
      const availability = await this.checkApplePayAvailability();
      if (!availability.canMakePayments) {
        throw new Error("Apple Pay is not available on this device");
      }

      console.log("🔹 Presenting Apple Pay...");
      const applePayResult = await ApplePay.presentApplePay({
        amount,
        currency
      });

      if (!applePayResult || !applePayResult.token) {
        throw new Error("Apple Pay token is missing or invalid");
      }

      console.log("Apple Pay authorized, sending token to backend...");

      // Start payment with token
      const paymentResult = await ApplePay.startPayment({
        token: applePayResult.token,
        amount,
        currency
      });

      console.log("Apple Pay payment result:", paymentResult);

      return {
        status: paymentResult.status === 'success' ? 'success' : 'failed',
        message: paymentResult.message
      };
    } catch (error) {
      console.error('Apple Pay payment failed:', error);
      return {
        status: 'failed',
        message: error.message || 'Payment failed'
      };
    }
  }
}