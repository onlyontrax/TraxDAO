// ApplePayButton.tsx
import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ApplePayService } from './apple-pay-service';

interface ApplePayButtonProps {
  amount: string;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: 'black' | 'white' | 'white-outline';
  type?: 'plain' | 'buy' | 'book' | 'subscribe';
}

export const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  style = 'black',
  type = 'plain'
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const applePayService = ApplePayService.getInstance();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const status = await applePayService.checkApplePayAvailability();
    // console.log("checkAvailability - applePayService.checkApplePayAvailability: ", status);
    setIsAvailable(status.canMakePayments);
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const result = await applePayService.startApplePayment(amount, currency);

      console.log("handlePayment - applePayService.startApplePayment: ", result);

      if (result.status === 'success') {
        setIsProcessing(false)
        onSuccess?.();
      } else {
        setIsProcessing(false)
        onError?.(result.message || 'Payment failed');
      }
    } catch (error) {
      setIsProcessing(false)
      onError?.(error.message || 'Payment failed');
    }
  };

  if (!isAvailable || Capacitor.getPlatform() !== 'ios') {
    return null;
  }

  return (
    <button
      onClick={handlePayment}
      className={`apple-pay-button apple-pay-button-${style} apple-pay-button-${type}`}
      role="button"
      aria-label="Apple Pay"
      disabled={isProcessing}
    />
  );
};