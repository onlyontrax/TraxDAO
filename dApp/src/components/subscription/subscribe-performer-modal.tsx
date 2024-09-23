import { IPerformer } from '@interfaces/performer';
import { getResponseError } from '@lib/utils';
import { hideSubscribePerformerModal } from '@redux/subscription/actions';
import { paymentService } from '@services/payment.service';
import { performerService } from '@services/performer.service';
import {
  Avatar,
  Button,
  Modal, Spin,
  message
} from 'antd';
import Image from 'next/image';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TickIcon } from 'src/icons';

type Props = {
  onSubscribed?: Function;
}

export function SubscribePerformerModal({ onSubscribed = null }: Props) {
  const [performer, setPerformer] = useState<IPerformer>();
  const [loading, setLoading] = useState(false);
  const [submiting, setSubmiting] = useState<boolean>();
  const currentUser = useSelector((state: any) => state.user.current);
  const settings = useSelector((state: any) => state.settings);
  const subscription = useSelector((state: any) => state.subscription);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetctPerformer = async () => {
      try {
        setLoading(true);
        const resp = await performerService.findOne(
          subscription.subscribingPerformerId
        );
        setPerformer(resp.data);
      } catch (e) {
        const error = await Promise.resolve(e);
        message.error(getResponseError(error));
      } finally {
        setLoading(false);
      }
    };

    subscription.subscribingPerformerId && fetctPerformer();
  }, [subscription.subscribingPerformerId]);

  const subscribe = async (subscriptionType: string) => {
    if (!currentUser._id) {
      message.error('Please log in!');
      Router.push('/login');
      return;
    }
    if (settings.paymentGateway === 'stripe' && !currentUser.stripeCardIds.length) {
      message.error('Please add a payment card');
      Router.push('/user/account');
      return;
    }
    try {
      setSubmiting(true);
      const resp = await paymentService.subscribePerformer({
        type: subscriptionType,
        performerId: performer._id,
        paymentGateway: settings.paymentGateway
      });
      if (resp?.data?.stripeConfirmUrl) {
        window.location.href = resp?.data?.stripeConfirmUrl;
      }
      if (settings.paymentGateway === '-ccbill') {
        window.location.href = resp?.data?.paymentUrl;
      } else {
        setSubmiting(false);
        dispatch(hideSubscribePerformerModal());
        onSubscribed && onSubscribed(performer?.username || performer?._id);
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  };

  const onCancel = () => {
    dispatch(hideSubscribePerformerModal());
  };

  return (
    <Modal
      open={subscription.showModal}
      destroyOnClose
      centered
      width={770}
      footer={null}
      onCancel={onCancel}
    >
      {loading && <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>}
      <div className="confirm-purchase-form">
        <div className="left-col">
          <Avatar className="sub-modal-avatar" src={performer?.avatar || '/static/no-avatar.png'} />
          <div className="p-name">
            {performer?.name || 'N/A'}
            {' '}
            {performer?.verifiedAccount && <TickIcon className="primary-color" />}
          </div>
          <div className="p-username">
            @
            {performer?.username || 'n/a'}
          </div>
        </div>
        <div className="right-col">
          <h2>
            Subscribe
            {' '}
            <span className="username">{`@${performer?.username}` || 'the artist'}</span>
          </h2>
          <Button
            className="primary"
            disabled={submiting}
            loading={submiting}
            onClick={() => subscribe('monthly')}
          >
            Subscribe
          </Button>
          <p className="sub-text">Clicking &quot;Subscribe&quot; will take you to the payment screen to finalize you subscription</p>
        </div>
      </div>
    </Modal>
  );
}
