import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getResponseError } from '@lib/utils';
import { subscriptionService } from '@services/index';
import { Layout, message, Avatar, Button, Modal } from 'antd';
import Head from 'next/head';
import { formatDateNoTime } from '@lib/date';
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';

import TraxButton from '@components/common/TraxButton';

const SubscriptionPage = ({ ui, currentUser, settings}) => {
  const router = useRouter();

  const [subscriptionList, setSubscriptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState({});
  const [openCancelSubscriptionModal, setOpenCancelSubscriptionModal] = useState(false)
  const [noSubscriptionsMessage, setNoSubscriptionsMessage] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const resp = await subscriptionService.userSearch({
        ...filter,
        ...filter,
        sort: 'desc',
        sortBy: 'updatedAt',
        limit: 10,
        offset: subscriptionList.length,
      });
      const activeSubscriptions = resp.data.data.filter(sub => sub.status === 'active');

      setSubscriptionList(prevSubscriptions => [...prevSubscriptions, ...activeSubscriptions]);

      // Check if there's more data to load
      setHasMore(activeSubscriptions.length > 0);

      // Set message when there are no subscriptions
      if (activeSubscriptions.length === 0 && subscriptionList.length === 0) {
        setNoSubscriptionsMessage('No active subscriptions found.');
      } else {
        setNoSubscriptionsMessage(null);
      }
    } catch (error) {
      message.error(getResponseError(error) || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscription) => {
    try {
      await subscriptionService.cancelSubscription(subscription._id, subscription.paymentGateway);
      message.success('Subscription cancelled successfully');
      getData();
    } catch (e) {
      message.error(e?.message || 'Error occurred, please try again later');
    }
  };

  return (
    <Layout>
      <Head>
        <title>{`${ui?.siteName} | My Subscriptions`}</title>
      </Head>
      <div className="">
        <InfiniteScroll
          dataLength={subscriptionList.length}
          next={getData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
        >
          {subscriptionList.map((subscription) => (
            subscription.performerInfo && (
              <>
                <div key={subscription._id} style={{maxWidth: '50rem'}} className="flex justify-between items-center p-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <Link href={`/artist/profile/?id=${subscription.performerInfo?.username}`}>
                      <Avatar src={subscription.performerInfo?.avatar || '/static/no-avatar.png'} />
                    </Link>
                    <div>
                      <Link href={`/artist/profile/?id=${subscription.performerInfo?.username}`}>
                        <div className='text-trax-white hover:text-trax-lime-500'>
                          {subscription.performerInfo?.name || subscription.performerInfo?.username || 'N/A'}
                        </div>
                      </Link>
                      <div className="text-trax-gray-500">Member since {formatDateNoTime(subscription.createdAt)}</div>
                    </div>
                  </div>
                  <div>
                  <TraxButton
                      htmlType="button"
                      styleType="alert"
                      buttonSize='small'
                      buttonText="Cancel"
                      onClick={() => setOpenCancelSubscriptionModal(true)}
                    />
                  </div>
                </div>
                <Modal
                  key="cancel_subscription"
                  className="subscription-modal"
                  width={500}
                  centered
                  title={null}
                  open={openCancelSubscriptionModal}
                  footer={null}
                  onCancel={() => setOpenCancelSubscriptionModal(false)}
                  destroyOnClose
                >
                  <div className="send-tip-container gap-8">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4">
                        <span className="text-4xl uppercase font-heading font-bold text-trax-white mt-2">Cancel Subscription</span>
                        <span className="text-trax-gray-400 text-base font-base ">Are you sure you want to cancel your subscription to {subscription.performerInfo?.name}? After your current term finishes you will lose access to their members only content.</span>
                      </div>

                      <TraxButton
                        htmlType="button"
                        styleType="alert"
                        buttonSize='full'
                        buttonText="Cancel"
                        onClick={() => cancelSubscription(subscription)}
                      />
                    </div>
                  </div>
                </Modal>
              </>
            )
          ))}

          {noSubscriptionsMessage && (
            <div className='flex blur-[1px] opacity-50 mx-auto flex max-w-[400px] mt-12'>
              <div style={{maxWidth: '50rem'}} className="text-3xl text-trax-white font-heading font-semibold uppercase flex m-auto">{noSubscriptionsMessage}</div>
            </div>

          )}
        </InfiniteScroll>
      </div>


    </Layout>
  );
};

SubscriptionPage.authenticate = true;

export default SubscriptionPage;
