import styles from './index.module.scss';

interface IProps {
  redirectUrl: string;
}

function PaymentIframeForm({ redirectUrl } : IProps) {
  return (
    <div className={styles.componentsPaymentFormIframeModule}>
      <div className="payment-iframe-form">
        <iframe title="Payment check out" src={redirectUrl} />
      </div>
    </div>
  );
}

export default PaymentIframeForm;
