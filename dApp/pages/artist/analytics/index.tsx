import { useState, useEffect } from 'react';
import Head from 'next/head';
import { connect } from 'react-redux';
import { performerService, followService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import { IPerformer, IUIConfig } from 'src/interfaces';
import { Avatar } from '@components/common/catalyst/avatar'
import { Badge } from '@components/common/catalyst/badge'
import { Button } from '@components/common/catalyst/button'
import { Divider } from '@components/common/catalyst/divider'
import { Heading, Subheading } from '@components/common/catalyst/heading'
import { Select } from '@components/common/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/common/catalyst/table'
import InfiniteScroll from 'react-infinite-scroll-component';
import { last } from 'lodash';

interface IProps {
  currentUser: IPerformer;
  ui: IUIConfig; 
}

export function Stat({ title, value, change, period, showComparison = false }: { title: string; value: string; change: string; period: string; showComparison?: boolean; }) {

  const getPeriodText = () => {
    switch (period) {
      case 'last_month':
        return 'previous month';
      case 'last_week':
        return 'last week';
      case 'last_quarter':
        return 'previous quarter';
      default:
        return '';
    }
  };

  // Determine what to show in the bottom section
  const renderBottomSection = () => {
    // Case 1: If showComparison=true AND period='all_time' -> show 180 days message
    if (showComparison && period === 'all_time') {
      return (
        <div className="mt-3 text-sm/6 text-trax-zinc-500 sm:text-xs/6">
          * This data is from the last 180 days
        </div>
      );
    }
    
    // Case 2: If showComparison=false AND period='all_time' -> show nothing
    if (!showComparison && period === 'all_time') {
      return null;
    }
    
    // Case 3: For all other cases -> show the badge
    return (
      <div className="mt-3 text-sm/6 text-trax-white sm:text-xs/6">
        <Badge 
          color={
            change.startsWith('+') ? 'lime' : 
            change.startsWith('-') ? 'pink' : 
            change.startsWith('0%') ? 'pink' : 
            'green'
          }
        >
          {change}
        </Badge>{' '}
        <span className="text-trax-zinc-500">from {getPeriodText()}</span>
      </div>
    );
  };

  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 text-trax-white font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold text-trax-white sm:text-2xl/8">{value}</div>
      {renderBottomSection()}
    </div>
  )
}

function Analytics({ currentUser, ui }: IProps) {

  const [period, setPeriod] = useState('last_month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const calculatePercentageChange = (currentTotal: number | undefined, previousTotal: number | undefined): string => {
    if (currentTotal === undefined || previousTotal === undefined) return '0%';
    
    if (previousTotal === 0) {
      if (currentTotal === 0) return '0%';
      return `+${currentTotal * 100}%`;
    }
  
    if (previousTotal > currentTotal) {
      const decrease = ((previousTotal - currentTotal) / previousTotal) * 100;
      return `-${decrease.toFixed(1)}%`;
    }
    
    const increase = ((currentTotal - previousTotal) / previousTotal) * 100;
    return `+${increase.toFixed(1)}%`;
  };

  const fetchAnalytics = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const analytics = (await performerService.getAnalytics(selectedPeriod)).data;
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    if (loading) return;
    try {
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
    }
  };

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

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics(period);
      fetchFollowers();
    }
  }, [period, currentUser]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <img src="/static/trax_loading_optimize.gif" alt="Loading..." className="w-96" />
      </div>
    );
  }

  //console.log('Analytic', analytics);

  return (
    <>
      <Head>
        <title>{`${ui?.siteName || 'Trax'} | Analytics`}</title>
      </Head>
      <div className='main-container content-container mt-4 pt-[20px] sm:mt-0 min-h-screen px-4'>
        <Heading className='uppercase'>Analytics</Heading>
        <div className="mt-8 flex items-end">
          <Subheading className="flex-grow">Overview</Subheading>
          <div className="flex items-center">
            <Select 
              name="period" 
              value={period}
              onChange={handlePeriodChange}
              defaultValue={'last_month'}
            >
              <option value="last_week">Last week</option>
              <option value="last_month">Last month</option>
              <option value="last_quarter">Last quarter</option>
              <option value="all_time">All time</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <Stat 
            title="Followers" 
            value={analytics?.currentPeriod?.totalFollowers?.toLocaleString() || '0'} 
            change={calculatePercentageChange(analytics?.currentPeriod?.totalFollowers, analytics?.previousPeriod?.totalFollowers)} 
            period={period}
          />
          <Stat 
            title="Subscribers" 
            value={analytics?.currentPeriod?.totalSubscribers?.toLocaleString() || '0'} 
            change={calculatePercentageChange(analytics?.currentPeriod?.totalSubscribers, analytics?.previousPeriod?.totalSubscribers)} 
            period={period}
          />
          <Stat 
            title="Top locations" 
            value={analytics?.currentPeriod?.topLocationPerVideo?.toLocaleString() || '0'} 
            change={analytics?.previousPeriod?.topLocationPerVideo?.toLocaleString() || '0'} 
            period={period}
            showComparison={true}
            />
          <Stat 
            title="Page views" 
            value={analytics?.currentPeriod?.totalViewsPerVideo?.toLocaleString() || '0'} 
            change={calculatePercentageChange(analytics?.currentPeriod?.totalViewsPerVideo, analytics?.previousPeriod?.totalViewsPerVideo)}
            period={period}
            showComparison={true}
          />
          <Stat 
            title="Saves" 
            value={analytics?.currentPeriod?.totalVideoBookmarks?.toLocaleString() || '0'} 
            change={calculatePercentageChange(analytics?.currentPeriod?.totalVideoBookmarks, analytics?.previousPeriod?.totalVideoBookmarks)}
            period={period}
          />
          <Stat 
            title="Likes" 
            value={analytics?.currentPeriod?.totalVideoLikes?.toLocaleString() || '0'} 
            change={calculatePercentageChange(analytics?.currentPeriod?.totalVideoLikes, analytics?.previousPeriod?.totalVideoLikes)}
            period={period}
          />
          <Stat title="Gender" value="N/A" change="0%" period={period}/>
          <Stat title="Age" value="N/A" change="0%" period={period}/>
        </div>
        <div className="mt-8 flex items-end">
          <Subheading className="flex-grow mt-14">Followers</Subheading>
          <div className="flex items-center">
            <Button onClick={exportFollowerEmails} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export emails'}
            </Button>
          </div>
        </div>
        <InfiniteScroll
          dataLength={followers.length}
          next={fetchFollowers}
          hasMore={hasMore}
          loader={<div className="text-center text-trax-gray-500">Loading...</div>}
          scrollableTarget="scrollableDiv"
        >
          <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
            <TableHead>
              <TableRow>
                <TableHeader>Follower number</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {followers.map((follower, index) => (
                <TableRow key={follower?.followerId}>
                  <TableCell>{String(index + 1).padStart(3, '0')}</TableCell>
                  <TableCell className="text-trax-zinc-500">{follower?.createdAt.split('T')[0]}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={follower?.objectInfo?.avatar || '/static/no-avatar.png'} className="size-6" />
                      <span>{follower?.objectInfo?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{follower?.objectInfo?.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </InfiniteScroll>
        {followers?.length === 0 && !loading && (
          <div className="text-center text-trax-gray-500 mt-4">No followers found.</div>
        )}
      </div>
    </>
  )
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  ui: { ...state.ui },
});

export default connect(mapStates)(Analytics);