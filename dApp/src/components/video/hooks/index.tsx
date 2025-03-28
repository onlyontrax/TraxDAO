import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { videoService, tokenTransctionService, reactionService } from '@services/index';
import { IVideo } from 'src/interfaces';


interface IVideoStats {
    likes: number;
    views: number;
    comments: number;
    bookmarks: number;
  }

// Hook for fetching and managing video data
export const useVideoData = (id: string, initialVideo: IVideo | null) => {
  const [video, setVideo] = useState<IVideo | null>(initialVideo);
  const [loading, setLoading] = useState(!initialVideo);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await videoService.findOne(id);
        setVideo(response.data);
      } catch (error) {
        console.error('Error fetching video:', error);
        message.error('Failed to load video data');
      } finally {
        setLoading(false);
      }
    };

    if (!initialVideo) {
      fetchVideo();
    }
  }, [id, initialVideo]);

  return { video, loading, setVideo };
};

// Hook for managing video statistics
export const useVideoStats = (initialStats: IVideoStats) => {
  const [videoStats, setVideoStats] = useState<IVideoStats>(initialStats);

  useEffect(() => {
    setVideoStats(initialStats);
  }, [initialStats]);

  return { videoStats, setVideoStats };
};

// Auto-bookmark after purchase hook
export const usePurchaseHandling = (video: IVideo) => {
  const handlePostPurchase = useCallback(async () => {
    if (!video?._id) return;

    try {
      // Create bookmark
      await reactionService.create({
        objectId: video._id,
        action: 'book_mark',
        objectType: 'video'
      });

      message.success('Content automatically added to your library');
      return true;
    } catch (error) {
      console.error('Error auto-bookmarking after purchase:', error);
      return false;
    }
  }, [video?._id]);

  return { handlePostPurchase };
};

// Hook for managing user reactions (likes and bookmarks)
export const useUserReactions = (videoId: string, userId: string) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchUserReactions = async () => {
      if (!videoId || !userId) return;

      try {
        const [likesResponse, bookmarksResponse] = await Promise.all([
          videoService.getLikes({ userId }),
          videoService.getBookmarks({ userId })
        ]);

        setIsLiked(likesResponse.data.data.some(like => like.objectId === videoId));
        setIsBookmarked(bookmarksResponse.data.data.some(bookmark => bookmark.objectId === videoId));
      } catch (error) {
        console.error('Error fetching user reactions:', error);
      }
    };

    fetchUserReactions();
  }, [videoId, userId]);

  const updateUserReaction = useCallback((action: 'like' | 'book_mark', newState: boolean) => {
    if (action === 'like') {
      setIsLiked(newState);
    } else {
      setIsBookmarked(newState);
    }
  }, []);

  return { isLiked, isBookmarked, updateUserReaction };
};

// Hook for converting prices to different cryptocurrencies
export const usePriceConversion = (price: number) => {
  const [amountICPToDisplay, setAmountICPToDisplay] = useState('');
  const [amountCKBTCToDisplay, setAmountCKBTCToDisplay] = useState('');
  const [amountTRAXToDisplay, setAmountTRAXToDisplay] = useState('');
  const [isPriceICPLoading, setIsPriceICPLoading] = useState(true);

  useEffect(() => {
    const convertPrices = async () => {
      if (!price) return;

      try {
        setIsPriceICPLoading(true);
        const [icpRate, ckbtcRate, traxRate] = await Promise.all([
          tokenTransctionService.getExchangeRate(),
          tokenTransctionService.getExchangeRateBTC(),
          tokenTransctionService.getExchangeRateTRAX()
        ]);

        const amountICP = price / parseFloat(icpRate.data.rate);
        const amountCKBTC = price / parseFloat(ckbtcRate.data.rate);
        const amountTRAX = price / parseFloat(traxRate.data.rate);

        setAmountICPToDisplay(amountICP.toFixed(4));
        setAmountCKBTCToDisplay(amountCKBTC.toFixed(8));
        setAmountTRAXToDisplay(amountTRAX.toFixed(3));
      } catch (error) {
        console.error('Error converting prices:', error);
        message.error('Failed to load price conversions');
      } finally {
        setIsPriceICPLoading(false);
      }
    };

    convertPrices();
  }, [price]);

  return { amountICPToDisplay, amountCKBTCToDisplay, amountTRAXToDisplay, isPriceICPLoading };
};

// Utility function for handling reactions (like and bookmark)
export const handleReaction = async (action: 'like' | 'book_mark', video: IVideo, user: { _id: string }) => {
  try {
    const reactionData = {
      objectId: video._id,
      action: action,
      objectType: 'video'
    };

    if (action === 'like' ? video.isLiked : video.isBookmarked) {
      await reactionService.delete(reactionData);
      return {
        success: true,
        newState: false,
        message: action === 'like' ? 'Unliked' : 'Removed from Saved'
      };
    } else {
      await reactionService.create(reactionData);
      return {
        success: true,
        newState: true,
        message: action === 'like' ? 'Liked' : 'Added to Saved'
      };
    }
  } catch (error) {
    console.error(`Error ${action === 'like' ? 'liking' : 'bookmarking'} video:`, error);
    return {
      success: false,
      newState: action === 'like' ? video.isLiked : video.isBookmarked,
      message: `Failed to ${action === 'like' ? 'like' : 'bookmark'} video`
    };
  }
};