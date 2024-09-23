import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Form, Button } from 'antd';
import { Sheet } from 'react-modal-sheet';
import { InputRef } from 'antd/lib/input';

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
        <Button onClick={handleSubmit} type="primary" className="modal-button">Submit</Button>
        <Button onClick={onCancel} className="modal-button">Cancel</Button>
        {showSms2faButton && <Button onClick={onShowSms2faButtonPress} className="modal-button">Switch to 2FA</Button>}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet
        isOpen={visible}
        onClose={onCancel}
        detent="content-height"
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content className="two-factor-modal auth-modal-sheet">
            {content}
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={onCancel} />
      </Sheet>
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
