import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Form } from 'antd';
//import { Sheet } from 'react-modal-sheet';
import { InputRef } from 'antd/lib/input';
import TraxButton from '@components/common/TraxButton';
import SlideUpModal from '@components/common/layout/slide-up-modal';

interface SmsModalProps {
  visible: boolean;
  onOk: (pin: string) => void;
  onCancel: () => void;
  smsError?: string;
  showSms2faButton: boolean;
  onShowSms2faButtonPress: () => void;
  onGetSmsCode: () => void;
  isMobile: boolean;
}

const SmsModal: React.FC<SmsModalProps> = ({
  visible,
  onOk,
  onCancel,
  smsError,
  showSms2faButton,
  onShowSms2faButtonPress,
  onGetSmsCode,
  isMobile,
}) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(InputRef | null)[]>([]);
  const [isGetCodeButtonDisabled, setIsGetCodeButtonDisabled] = useState(false);

  useEffect(() => {
    if (visible && !isGetCodeButtonDisabled) {
      handleGetSmsCode();
    }
    if (visible) {
      inputRefs.current[0]?.focus();
    }
  }, [visible]);

  if (!visible) return null;

  const handleGetSmsCode = () => {
    onGetSmsCode();
    setIsGetCodeButtonDisabled(true);
  };

  const handlePinChange = (index: number, value: string) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length === 6) {
      onOk(fullPin);
    }
  };

  const content = (
    <>
      <div className="modal-title text-left">
        We just sent you an SMS
      </div>
      <Form.Item
        validateStatus={smsError ? 'error' : ''}
        help={smsError}
        className="two-factor-form-item"
      >
        <div className="flex justify-center space-x-2">
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-10 text-center text-lg"
            />
          ))}
        </div>
      </Form.Item>
      <div className="modal-buttons">
        <TraxButton
          htmlType="button"
          styleType="primary"
          buttonSize="medium"
          buttonText="Submit"
          onClick={handleSubmit}
        />
        <TraxButton
          htmlType="button"
          styleType="secondary"
          buttonSize="medium"
          buttonText="Cancel"
          onClick={onCancel}
        />
        {showSms2faButton && (
          <TraxButton
            htmlType="button"
            styleType="secondary"
            buttonSize="medium"
            buttonText="Switch to 2FA"
            onClick={onShowSms2faButtonPress}
          />
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <SlideUpModal
        isOpen={visible}
        onClose={onCancel}
        className="two-factor-modal auth-modal-sheet"
      >
        {content}
      </SlideUpModal>
    );
  }

  return (
    <Modal
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      className="two-factor-modal auth-modal-desktop"
      footer={null}
    >
      {content}
    </Modal>
  );
};

export default SmsModal;
