import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { followService } from 'src/services';
import { getResponseError } from '@lib/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import TraxButton from '@components/common/TraxButton';
import { motion, AnimatePresence } from 'framer-motion';

const FollowersComponent = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchFollowers = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const resp = await followService.getPerformerFollowers({
        limit,
        offset,
        sort: 'desc',
        sortBy: 'createdAt'
      });
      const newFollowers = resp.data.data;
      setFollowers(prevFollowers => [...prevFollowers, ...newFollowers]);
      setOffset(prevOffset => prevOffset + limit);
      setHasMore(newFollowers.length === limit);
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  const exportFollowerEmails = async () => {
    try {
      setExporting(true);
      const resp = await followService.exportFollowerEmailsCSV({});
      const url = window.URL.createObjectURL(new Blob([resp]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'followers-emails.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      setExporting(false);
    }
  };

  const renderFollower = (follower, index) => (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.3,
      delay: index * 0.06,
      ease: "easeOut"
    }} key={follower?.objectInfo?._id} className="flex justify-between items-center py-2 px-4 text-sm bg-[#1F1F1FB2] rounded-lg">
      <div className="flex items-center space-x-3">
        <img
          className="w-12 h-12 rounded-full"
          src={follower?.objectInfo?.avatar || '/static/no-avatar.png'}
          alt="avatar"
        />
        <div>
          <span className='text-trax-white'>
            {follower?.objectInfo?.name || follower?.objectInfo?.username || 'N/A'}
          </span>
          <div className="text-trax-gray-500">{follower?.objectInfo?.email || 'N/A'}</div>
        </div>
      </div>
      <div className="text-trax-white">
        {new Date(follower?.objectInfo?.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );

  return (
    <div>
      <div className="flex justify-start items-center mb-4">
        <TraxButton
          htmlType="button"
          styleType="primary"
          buttonSize="medium"
          buttonText="Export Emails"
          onClick={exportFollowerEmails}
          loading={exporting}
          disabled={exporting}
        />
      </div>
      <InfiniteScroll
        dataLength={followers.length}
        next={fetchFollowers}
        hasMore={hasMore}
        loader={<div className="text-center text-trax-gray-500">Loading...</div>}
        scrollableTarget="scrollableDiv"
      >
        <div className="space-y-2">
          {followers.map(renderFollower)}
        </div>
      </InfiniteScroll>
      {followers.length === 0 && !loading && (
        <div className="text-center text-trax-gray-500 mt-4">No followers found.</div>
      )}
    </div>
  );
};

export default FollowersComponent;