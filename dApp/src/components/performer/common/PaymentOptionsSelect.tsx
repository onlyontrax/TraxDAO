import React from 'react';
import { Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IUser, IPerformer } from '@interfaces/index';

const { Option } = Select;

interface PaymentOptionsSelectProps {
  mode: 'ppv' | 'tip';
  loading: boolean;
  canPay: boolean;
  paymentOption: string;
  selectedCurrency: string;
  user: IUser;
  performer?: IPerformer;
  price: number;
  onChangePaymentOption: (option: string) => void;
}

const PaymentOptionsSelect: React.FC<PaymentOptionsSelectProps> = ({
  mode,
  loading,
  canPay,
  paymentOption,
  selectedCurrency,
  user,
  performer,
  price,
  onChangePaymentOption
}) => {
  // if (loading) {
  //   return <div>Loading payment options...</div>;
  // }

  if (mode === 'ppv' && !canPay) return null;

  const isCryptoCurrency = ['TRAX'].includes(selectedCurrency);
  const showCryptoOptions = user.account?.wallet_icp && (mode === 'ppv' || performer.account?.wallet_icp);

  // const renderCreditOption = () => (
  //   <Option value="credit" key="credit" className="payment-type-option-content">
  //     <div className='payment-type-img-wrapper'>
  //       <img
  //         src={'/static/credit.png'}
  //         className=' rounded-full'
  //         alt="TRAX logo"
  //       />
  //     </div>
  //     <div className='payment-type-info'>
  //       <span className='currency-name'>Credit</span>
  //       <p className='currency-amount'>{user.balance.toFixed(2)}</p>
  //     </div>
  //   </Option>
  // );

  const renderCryptoOptions = () => (
    <>
      <Option value="plug" key="plug" className="payment-type-option-content">
        <div className='payment-type-img-wrapper'>
          <img src='/static/plug-favicon.png' alt="Plug wallet"/>
        </div>
        <div className='payment-type-info'>
          <span className='currency-name'>Plug wallet</span>
          <p className='currency-amount'>
            {`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}
          </p>
        </div>
      </Option>

      <Option value="II" key="II" className="payment-type-option-content">
        <div className='payment-type-img-wrapper'>
          <img src='/static/icp-logo.png'  alt="Internet Identity"/>
        </div>
        <div className='payment-type-info'>
          <span className='currency-name'>Internet Identity</span>
          <p className='currency-amount'>{`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}</p>
        </div>
      </Option>
    </>
  );

  return (
    <div className="payment-details">
      {/* <p className="payment-heading">Payment method</p> */}
      <Select
        onChange={onChangePaymentOption}
        value={paymentOption}
        className={`payment-recipient-wrapper ${(paymentOption === "plug" || paymentOption ===  "II") ? 'border border-custom-green' : "border border-border-gray" }`}
      >
        {/* {!isCryptoCurrency && user.balance > 0 && renderCreditOption()} */}
        {showCryptoOptions && renderCryptoOptions()}
        {mode === 'tip' && paymentOption === "noPayment" && (
          <Option value="noPayment" key="noPayment" className="payment-type-option-content">
            <div className='payment-type-img-wrapper'>
              <FontAwesomeIcon className='w-8 h-8 p-0.5' icon={faXmark} />
            </div>
            <div className='payment-type-info'>
              <span className='currency-name'>Connect payment method</span>
              <p className='currency-amount'>Visit the Settings page to connect</p>
            </div>
          </Option>
        )}
      </Select>
    </div>
  );
};

export default PaymentOptionsSelect;
