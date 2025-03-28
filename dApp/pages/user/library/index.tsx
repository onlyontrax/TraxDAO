import React, { useEffect, useState } from 'react';
import { Layout, message, Tabs } from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
import {
  ICountry,
  IUIConfig,
  IUser
} from 'src/interfaces';
import {
  utilsService,
  videoService,
  subscriptionService,
  followService,
} from 'src/services';
import useDeviceSize from '@components/common/useDeviceSize';
import TrackListItem from '@components/common/layout/music-track';
import { motion, AnimatePresence } from 'framer-motion';
import RelatedList from '@components/video/related-list';
import Link from 'next/link';
import Image from 'next/image';

interface IProps {
  ui: IUIConfig;
  user: IUser;
  countries: ICountry[];
}

interface IState {
  loading: boolean;
  currentPage: IPageState;
  limit: number;
  videos: any[];
  music: any[];
  performers: IPerformer[];
  totalVideos: number;
  totalMusic: number;
  totalPerformers: number;
  countries: ICountry[];
  activeTab: string;
}

interface IPerformer {
  _id: string;
  username: string;
  name: string;
  avatar?: string;
  isSubscribed?: boolean;
  isFollowing?: boolean;
  subscriptionId?: string;
  createdAt: string;
}

interface IFollowingInfo {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  cover?: string;
  gender?: string;
  country?: string;
  isOnline?: number;
  verifiedAccount?: boolean;
  live?: number;
  streamingStatus?: string;
}

interface IFollowResponse {
  _id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  updatedAt: string;
  followerInfo: {
    _id: string;
    name: string;
    username: string;
  };
  followingInfo: IFollowingInfo;
}

interface IPageState {
  videos: number;
  music: number;
  performers: number;
}

const LibraryPage: React.FC<IProps> = ({ ui }) => {
  const { isMobile, isTablet, isDesktop } = useDeviceSize();
  const [state, setState] = useState<IState>({
    loading: false,
    currentPage: {
      videos: 0,
      music: 0,
      performers: 0,
    },
    limit: 12,
    videos: [],
    music: [],
    performers: [],
    totalVideos: 0,
    totalMusic: 0,
    totalPerformers: 0,
    countries: [],
    activeTab: 'tracks'
  });

  const updateState = (newState: Partial<IState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  const getData = async (): Promise<{ countries: ICountry[] }> => {
    try {
      const [countriesResponse] = await Promise.all([utilsService.countriesList()]);
      return {
        countries: Array.isArray(countriesResponse?.data) ? countriesResponse.data : []
      };
    } catch (e) {
      return {
        countries: []
      };
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await getData();
        updateState(data);
        await getItems('videos');
        await getItems('music');
        await getPerformers();
      } catch (error) {
        message.error('Error loading initial data');
      }
    };

    initData();
  }, []);

  const getItems = async (type: 'videos' | 'music') => {
    const { currentPage, limit } = state;
    const currentPageNumber = currentPage[type];
    const targetType = type === 'music' ? 'audio' : 'video';

    try {
      updateState({ loading: true });

      const [purchasedResp, bookmarkedResp] = await Promise.all([
        videoService.getPurchased({
          limit,
          offset: currentPageNumber * limit
        }),
        videoService.getBookmarks({
          limit,
          offset: currentPageNumber * limit
        })
      ]);

      // Filter purchased items
      const purchasedItems = (purchasedResp.data?.data || [])
        .filter(item => item.trackType === targetType)
        .map(item => ({
          ...item,
          isPurchased: true
        }));

      // Filter bookmarked items
      const bookmarkedItems = (bookmarkedResp.data?.data || [])
        .filter(item => item.objectInfo?.trackType === targetType)
        .map(item => ({
          ...item.objectInfo,
          _id: item.objectInfo._id || item.objectInfo.id,
          createdAt: item.createdAt,
          isBookmarked: true
        }));

      // Combine all items
      const combinedItems = [...purchasedItems, ...bookmarkedItems];

      // Deduplicate by ID
      const uniqueItems = Array.from(
        combinedItems.reduce((map, item) => {
          const itemId = item._id;
          if (!itemId) return map;

          const existing = map.get(itemId);
          if (!existing) {
            map.set(itemId, item);
          } else {
            map.set(itemId, {
              ...item,
              isPurchased: item.isPurchased || existing.isPurchased,
              isBookmarked: item.isBookmarked || existing.isBookmarked,
              createdAt: new Date(item.createdAt) > new Date(existing.createdAt)
                ? item.createdAt
                : existing.createdAt
            });
          }
          return map;
        }, new Map())
      ).map(([_, value]) => value);

      // Sort by date
      const sortedItems = uniqueItems.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Update state based on type
      setState(prevState => {
        if (type === 'videos') {
          return {
            ...prevState,
            videos: currentPageNumber === 0 ? sortedItems : [...prevState.videos, ...sortedItems],
            totalVideos: sortedItems.length,
            loading: false
          };
        } else {
          return {
            ...prevState,
            music: currentPageNumber === 0 ? sortedItems : [...prevState.music, ...sortedItems],
            totalMusic: sortedItems.length,
            loading: false
          };
        }
      });
    } catch (error) {
      message.error('Server error');
      updateState({ loading: false });
    }
  };

  const getPerformers = async () => {
    try {
      updateState({ loading: true });

      const [subscriptionsResp, followingResp] = await Promise.all([
        subscriptionService.userSearch({
          sort: 'desc',
          sortBy: 'createdAt',
          limit: state.limit,
          offset: state.currentPage.performers * state.limit
        }),
        followService.getFollowing({
          limit: state.limit,
          offset: state.currentPage.performers * state.limit
        })
      ]);

      // Add null checks for subscription data
      const activeSubscriptions = (subscriptionsResp?.data?.data || [])
        .filter(sub => sub?.status === 'active' && sub?.performerInfo)
        .map(sub => ({
          _id: sub.performerInfo._id,
          name: sub.performerInfo.name || '',
          username: sub.performerInfo.username || '',
          avatar: sub.performerInfo.avatar || '',
          isSubscribed: true,
          subscriptionId: sub._id,
          createdAt: sub.createdAt
        }));

      // Add null checks for following data
      const following = (followingResp?.data?.data || [])
        .filter(follow => follow?.followingInfo)
        .map(follow => ({
          _id: follow.followingInfo._id,
          name: follow.followingInfo.name || '',
          username: follow.followingInfo.username || '',
          avatar: follow.followingInfo.avatar || '',
          isFollowing: true,
          createdAt: follow.createdAt
        }));

      const combinedPerformers = [...activeSubscriptions, ...following];
      const uniquePerformers = Array.from(
        combinedPerformers.reduce((map, performer) => {
          if (!performer?._id) return map;

          const existing = map.get(performer._id);
          if (!existing) {
            map.set(performer._id, performer);
          } else {
            map.set(performer._id, {
              ...performer,
              isSubscribed: performer.isSubscribed || existing.isSubscribed,
              isFollowing: performer.isFollowing || existing.isFollowing,
              createdAt: new Date(performer.createdAt) > new Date(existing.createdAt)
                ? performer.createdAt
                : existing.createdAt
            });
          }
          return map;
        }, new Map())
      ).map(([_, value]) => value);

      const sortedPerformers = uniquePerformers.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setState(prevState => ({
        ...prevState,
        performers: state.currentPage.performers === 0
          ? sortedPerformers
          : [...prevState.performers, ...sortedPerformers],
        totalPerformers: sortedPerformers.length,
        loading: false
      }));

    } catch (error) {
      message.error('Error loading performers');
      updateState({ loading: false });
    }
  };

  const handleTabChange = (activeTab: string) => {
    setState(prevState => ({
      ...prevState,
      activeTab
    }));
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const tabContentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };


  const renderTrackList = () => {
    if (loading && music.length === 0) {
      return <div className="load-text">Loading...</div>;
    }

    if (!loading && music.length === 0) {
      return <div className="load-text">No tracks found</div>;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {music.map((track, index) => (
          <motion.div
            key={track._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2 + (index * 0.08),
              ease: "easeOut"
            }}
            className="block h-full"
          >
            <Link href={`/track/${track.slug || track._id}`}>
              <div>
                <TrackListItem
                  track={track}
                  index={index}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPerformersList = () => {
    const { loading, performers } = state;

    if (loading && performers.length === 0) {
      return <div className="load-text">Loading...</div>;
    }

    if (!loading && performers.length === 0) {
      return <div className="load-text">No artists found</div>;
    }

    return (
      <div className="content-grid">
        {performers.map((performer, index) => (
          <motion.div
            key={performer._id}
            className="content-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.1 * index,
              ease: "easeOut"
            }}
          >
            <Link
              href={`/${performer.username || performer._id}`}
              passHref
            >
              <div className="artist-picture-container">
                <img
                  src={performer.avatar || '/static/no-avatar.png'}
                  alt={performer.name || performer.username}
                  loading="lazy"
                  decoding="async"
                  className="artist-picture"
                />
                 {/* <Image
                   src={performer.avatar || '/static/no-avatar.png'}
                   alt={performer.name || performer.username}
                   className="artist-picture"
                   width={800}
                   height={600}
                   priority={false}
                   loading="lazy"
                   quality={5}
                 /> */}
              </div>

              {(performer.isSubscribed || performer.isFollowing) && (
                <div className="status-tag">
                  <div className="tag-content">
                    <span className="tag-text">
                      {performer.isSubscribed ? 'subscribed' : 'following'}
                    </span>
                  </div>
                </div>
              )}

              <div className="info-overlay">
                <h3 className="title">
                  {performer.name || performer.username}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    );
  };

  const {
    loading,
    videos,
    music,
    totalVideos,
    activeTab
  } = state;

  return (
    <Layout>
      <Head>
        <title>{`${ui?.siteName} | Library`}</title>
      </Head>
      <div className="library-container">
        {/* <div className="flex flex-col gap-4 mb-6">
          <motion.h1
            className="library-heading"
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            Library
          </motion.h1>
        </div> */}

        <div className="user-library">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          renderTabBar={(props, DefaultTabBar) => (
            <DefaultTabBar {...props}>
              {(node) => (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  {node}
                  {node.key === activeTab && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      layoutId="activeTab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
              )}
            </DefaultTabBar>
          )}
            items={[
              {
                key: 'tracks',
                label: 'Tracks',
                children: (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`tracks-${activeTab}`}
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {renderTrackList()}
                    </motion.div>
                  </AnimatePresence>
                )
              },
              {
                key: 'videos',
                label: 'Videos',
                children: (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`videos-${activeTab}`}
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {loading && videos.length === 0 ? (
                        <div className="load-text">Loading...</div>
                      ) : !loading && videos.length === 0 ? (
                        <div className="load-text">No videos found</div>
                      ) : (
                        <RelatedList
                          videos={videos}
                          total={totalVideos}
                          showStatusTags={true}
                          displayType="grid"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )
              },
              {
                key: 'artists',
                label: 'Artists',
                children: (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`performers-${activeTab}`}
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {renderPerformersList()}
                    </motion.div>
                  </AnimatePresence>
                )
              }
            ]}
          />
        </div>
      </div>
    </Layout>
  );
};

const mapState = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});

export default connect(mapState)(LibraryPage);
