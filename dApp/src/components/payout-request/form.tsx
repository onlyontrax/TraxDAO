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
        paymentAccountType: paymentAccountType || 'paypal'
      }}
      scrollToFirstError
    >
      <div className="withdraw-heading">
        Request payout
      </div>
      <div className="req-payout-stats-wrapper">
        <Space size="large" className="req-payout-stats">
          <Statistic
            title="Total Earned"
            value={statsPayout?.totalEarnedTokens || 0}
            precision={2}
            prefix="$"

          />
          <Statistic
            title="Withdrew"
            value={statsPayout?.previousPaidOutTokens || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title="Wallet Balance"
            value={statsPayout?.remainingUnpaidTokens || 0}
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
          <Select.Option value="paypal" key="paypal">
            <img src="/static/paypal-ico.png"  style={{ width: '40px' }} alt="paypal" />
            {' '}
            Paypal
          </Select.Option>
        </Select>
      </Form.Item>
      <div className="payout-req-btn-wrapper">
        <Button
          className="submit-content-previous"
          loading={submiting}
          htmlType="button"
          disabled={submiting}
          style={{ margin: '5px' }}
          onClick={() => Router.back()}
        >
          Cancel
        </Button>
        <Form.Item>
          <Button
            className="submit-content-green"
            loading={submiting}
            htmlType="submit"
            disabled={['done', 'approved'].includes(status) || submiting}
            style={{ margin: '0 5px' }}
          >
            Submit
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
}

PayoutRequestForm.defaultProps = {};

export default PayoutRequestForm;
