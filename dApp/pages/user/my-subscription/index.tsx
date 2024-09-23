import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getResponseError } from '@lib/utils';
import { subscriptionService } from '@services/index';
import { Layout, message, Avatar, Button } from 'antd';
import Head from 'next/head';
import { formatDateNoTime } from '@lib/date';
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';

const SubscriptionPage = ({ ui, currentUser, settings}) => {
  const router = useRouter();

  const [subscriptionList, setSubscriptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState({});
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
    if (!window.confirm('Are you sure you want to cancel this subscription!')) return;
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
      <div className="lg:w-5/6 md:pl-6 pl-4">
        <InfiniteScroll
          dataLength={subscriptionList.length}
          next={getData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
        >
          {subscriptionList.map((subscription) => (
            <div key={subscription._id} style={{maxWidth: '50rem'}} className="flex justify-between items-center p-2 text-sm">
              <div className="flex items-center space-x-3">
                <Link href={`/${subscription.performerInfo?.username}`}>
                  <Avatar src={subscription.performerInfo?.avatar || '/static/no-avatar.png'} />
                </Link>
                <div>
                  <Link href={`/${subscription.performerInfo?.username}`}>
                    <div className='text-trax-white hover:text-trax-lime-500'>
                      {subscription.performerInfo?.name || subscription.performerInfo?.username || 'N/A'}
                    </div>
                  </Link>
                  <div className="text-trax-gray-500">Member since {formatDateNoTime(subscription.createdAt)}</div>
                </div>
              </div>
              <div>
              <Button
                className="rounded-2xl border-none bg-trax-gray-800 text-trax-red-600 hover:bg-trax-gray-300"
                onClick={() => cancelSubscription(subscription)}
              >
                Cancel
              </Button>
              </div>
            </div>
          ))}
          {noSubscriptionsMessage && (
            <div style={{maxWidth: '50rem'}} className="text-center mt-4 text-trax-gray-500">{noSubscriptionsMessage}</div>
          )}
        </InfiniteScroll>
      </div>
    </Layout>
  );
};

SubscriptionPage.authenticate = true;

export default SubscriptionPage;
