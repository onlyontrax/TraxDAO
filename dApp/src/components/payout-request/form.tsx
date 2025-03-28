/* eslint-disable react/no-unused-prop-types */
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Statistic,
  Tag
} from 'antd';
import Image from 'next/image';
import Router from 'next/router';
import { ISettings, PayoutRequestInterface } from 'src/interfaces';
import TraxButton from '@components/common/TraxButton';

interface Props {
  submit: Function;
  submiting: boolean;
  payout: Partial<PayoutRequestInterface>;
  statsPayout: {
    totalEarnedTokens: number;
    previousPaidOutTokens: number;
    remainingUnpaidTokens: number;
  };
  settings: ISettings;
}

function PayoutRequestForm({
  payout, submit, submiting, statsPayout
}: Props) {
  const [form] = Form.useForm();
  const {
    requestNote, requestTokens, status, paymentAccountType
  } = payout;

  return (
    <Form
      form={form}
      layout="vertical"
      className="payout-request-form"
      name="payoutRequestForm"
      onFinish={(data) => submit(data)}
      initialValues={{
        requestNote: requestNote || '',
        requestTokens: requestTokens || statsPayout?.remainingUnpaidTokens || 0,
        paymentAccountType: paymentAccountType || 'stripe'
      }}
      scrollToFirstError
    >
      <div className="withdraw-heading">
        Request payout
      </div>
      <div className="req-payout-stats-wrapper">
        <Space size="large" className="req-payout-stats">
          <Statistic
            title="Available balance"
            value={statsPayout?.remainingUnpaidTokens || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title="Total earned"
            value={statsPayout?.totalEarnedTokens || 0}
            precision={2}
            prefix="$"

          />
          <Statistic
            title="Claimed balance"
            value={statsPayout?.previousPaidOutTokens || 0}
            precision={2}
            prefix="$"
          />
        </Space>
      </div>
      <Form.Item label="Requested amount" name="requestTokens">
        <InputNumber style={{ width: '100%' }} disabled={payout && payout.status === 'done'} min={1} max={statsPayout?.remainingUnpaidTokens} />
      </Form.Item>
      <Form.Item label="Note to TRAX" name="requestNote">
        <Input.TextArea disabled={payout && payout.status === 'done'} placeholder="Text something to TRAX here" rows={3} />
      </Form.Item>
      {payout?.adminNote && (
        <Form.Item label="Admin noted">
          <Alert type="info" message={payout?.adminNote} />
        </Form.Item>
      )}
      {payout._id && (
        <Form.Item label="Status">
          <Tag color="orange" style={{ textTransform: 'capitalize' }}>{status}</Tag>
        </Form.Item>
      )}
      <Form.Item label="Select payout method" name="paymentAccountType">
        <Select>
          <Select.Option value="stripe" key="stripe">
            <img src="/static/stripe-icon.jpeg" width="30px" alt="stripe" />
            {' '}
            Stripe
          </Select.Option>
          <Select.Option value="paypal" key="paypal">
            <img src="/static/paypal-ico.png"  style={{ width: '40px' }} alt="paypal" />
            {' '}
            Paypal
          </Select.Option>
        </Select>
      </Form.Item>
      <div className="flex flex-row gap-4 pt-2">
          <TraxButton
            htmlType="button"
            styleType="secondary"
            buttonSize="small"
            buttonText="Cancel"
            disabled={submiting}
            onClick={() => Router.back()}
          />
          <TraxButton
            htmlType="submit"
            styleType="primary"
            buttonSize="small"
            buttonText="Submit"
            disabled={['done', 'approved'].includes(status) || submiting}
          />
      </div>
    </Form>
  );
}

PayoutRequestForm.defaultProps = {};

export default PayoutRequestForm;
