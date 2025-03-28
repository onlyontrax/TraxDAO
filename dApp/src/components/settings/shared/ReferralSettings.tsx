import React, { useState, useEffect } from 'react';
import { message, Avatar } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { accountService } from '@services/index';
import { formatDateNoTime } from '@lib/date';
import { getResponseError } from '@lib/utils';
import Link from 'next/link';
import { IAccount } from 'src/interfaces';

interface IReferralSettingsProps {
  account: IAccount;
}

const ReferralSettings: React.FC<IReferralSettingsProps> = ({ account }) => {
  const [referralList, setReferralList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [noReferralsMessage, setNoReferralsMessage] = useState<string | null>(null);

  const getData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const service = accountService;
      const resp = await service.searchReferralList({
        limit: 10,
        offset: referralList.length
      });

      // Both fan and artist have the same response format
      const responseData = resp.data?.data || {};
      const newReferrals = [...(responseData.accounts || [])];

      setReferralList(prevReferrals => [...prevReferrals, ...newReferrals]);
      setHasMore(newReferrals.length === 10);

      if (newReferrals.length === 0 && referralList.length === 0) {
        setNoReferralsMessage('No referrals found.');
      } else {
        setNoReferralsMessage(null);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      message.error(getResponseError(error) || 'An error occurred. Please try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setReferralList([]); // Clear list when userType changes
    setHasMore(true);    // Reset hasMore when userType changes
    getData();
  }, [account]);

  const getProfileUrl = (referral: any) => {
    //if (!referral.username) return '#';
    return referral?.performerId
      ? `/artist/profile?id=${referral.performerInfo.username}`
      : `javascript:void(0);`;
  };

  const getUserName = (referral: any) => {
    return referral?.performerId ? referral.performerInfo.name || referral.performerInfo.username || 'N/A' : referral.userInfo.name || referral.userInfo.username || 'N/A';
  };

  return (
    <div className="account-form-settings">
      <div className="mb-4">
        <h1 className="profile-page-heading">Referrals</h1>
        <span className="profile-page-subtitle text-center sm:text-start">
          View all users who signed up using your referral code:
        </span>
      </div>

      <InfiniteScroll
        dataLength={referralList.length}
        next={getData}
        hasMore={hasMore}
        loader={<h4 className="infinite-scroll-loader">Loading...</h4>}
        scrollThreshold={0.8}
      >
        <div className="referral-list">
          {referralList.map((referral) => (
            <div key={referral._id} className="referral-item">
              <div className="user-info">
                {referral?.performerId && (<Link href={getProfileUrl(referral)} className="avatar-link">
                  <Avatar
                    src={referral?.performerId ? referral.performerInfo.avatar || '/static/no-avatar.png' : referral.userInfo.avatar || '/static/no-avatar.png'}
                    alt={getUserName(referral)}
                  />
                </Link>)}
                {!referral?.performerId && (<div className="avatar-link">
                  <Avatar
                    src={referral?.performerId ? referral.performerInfo.avatar || '/static/no-avatar.png' : referral.userInfo.avatar || '/static/no-avatar.png'}
                    alt={getUserName(referral)}
                  />
                </div>)}

                <div className="user-details">
                {referral?.performerId && (<Link href={getProfileUrl(referral)}>
                    <div className="username-link">
                      {getUserName(referral)}
                    </div>
                  </Link>)}
                {!referral?.performerId && (<div>
                    <div className="username-link">
                      {getUserName(referral)}
                    </div>
                  </div>)}
                  <div className="member-since">
                    Member since {formatDateNoTime(referral.createdAt)}
                  </div>
                </div>
              </div>
              <div className="status">
                Active
              </div>
            </div>
          ))}
        </div>

        {noReferralsMessage && referralList.length === 0 && (
          <div className="no-referrals">
            <div className="message">
              {noReferralsMessage}
            </div>
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default ReferralSettings;