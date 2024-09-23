import { Modal, Input, Form, Button } from 'antd';
import { Sheet } from 'react-modal-sheet';

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
        <Button onClick={onOk} type="primary" className="modal-button">Submit</Button>
        <Button onClick={onCancel} className="modal-button">Cancel</Button>
        {showSms2faButton && <Button onClick={onShowSms2faButtonPress} className="modal-button">Switch to SMS Auth</Button>}
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
          <Sheet.Header>
          </Sheet.Header>
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
