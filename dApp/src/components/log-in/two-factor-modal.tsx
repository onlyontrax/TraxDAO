import { Modal, Input, Form } from 'antd';
import { Sheet } from 'react-modal-sheet';
import TraxButton from '@components/common/TraxButton';
import SlideUpModal from '@components/common/layout/slide-up-modal';

interface TwoFactorModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  twoFactorError?: string;
  twoFactorKey: string;
  showSms2faButton: boolean;
  onShowSms2faButtonPress: () => void;
  isMobile: boolean;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  visible,
  onOk,
  onCancel,
  onInputChange,
  twoFactorError,
  twoFactorKey,
  showSms2faButton,
  onShowSms2faButtonPress,
  isMobile,
}) => {
  if (!visible) return null;

  const content = (
    <>
      <div className="modal-title text-center">
        Two-Factor Authentication
      </div>
      <Form.Item
        validateStatus={twoFactorError ? 'error' : ''}
        help={twoFactorError}
        className="two-factor-form-item"
      >
        <Input
          type="text"
          placeholder="Enter 2FA code"
          value={twoFactorKey}
          onChange={onInputChange}
          className="two-factor-input"
        />
      </Form.Item>
      <div className="modal-buttons">
        <TraxButton
          htmlType="button"
          styleType="primary"
          buttonSize="medium"
          buttonText="Submit"
          onClick={onOk}
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
            buttonText="Switch to SMS Auth"
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
      onOk={onOk}
      onCancel={onCancel}
      className="two-factor-modal auth-modal-desktop"
      footer={null}
    >
      {content}
    </Modal>
  );
};

export default TwoFactorModal;
