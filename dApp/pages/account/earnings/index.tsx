import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { connect } from 'react-redux';
import { 
  tokenTransctionService,
  earningService,
  payoutRequestService,
  subscriptionService,
  paymentService,
  authService
} from '@services/index';
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import { IPerformer, IUIConfig } from 'src/interfaces';
import { Avatar } from '@components/common/catalyst/avatar'
import { Badge } from '@components/common/catalyst/badge'
import { Button } from '@components/common/catalyst/button'
import { Divider } from '@components/common/catalyst/divider'
import { Heading, Subheading } from '@components/common/catalyst/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/common/catalyst/table'
import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcLedgerCanister } from '@dfinity/ledger';
import { formatDate } from '@lib/date';

interface IProps {
  currentUser: IPerformer;
  ui: IUIConfig;
  settings: any;
}

export function Stat({ title, value, change }: { title: string; value: string, change:string }) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 text-trax-white font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold text-trax-white sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 text-trax-white sm:text-xs/6">
        <Badge 
          color={
            change.startsWith('+') ? 'lime' : 
            change.startsWith('-') ? 'pink' : 
            change.startsWith('0.0%') ? 'pink' : 
            'green'
          }
        >
          {change}
        </Badge>{' '}
        <span className="text-trax-zinc-500">from last month</span>
      </div>
    </div>
  )
}

function Earnings({ currentUser, ui, settings }: IProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    isBalanceLoading: false,
    totalWalletBalance: 0,
    balanceTRAX: 0,
    balanceTRAXUSD: 0,
    transactions: [],
    hasMore: true,
    currentOffset: 0,
    totalPayoutTokens: 0,
    previousPayoutTokens: 0,
    stats: {
      totalGrossPrice: 0,
      totalSiteCommission: 0,
      totalNetPrice: 0,
      totalGrossPriceICP: 0,
      totalGrossPriceTRAX: 0,
      totalGrossPriceCKBTC: 0,
      totalSiteCommissionICP: 0,
      totalSiteCommissionTRAX: 0,
      totalSiteCommissionCKBTC: 0,
      totalNetPriceICP: 0,
      totalNetPriceTRAX: 0,
      totalNetPriceCKBTC: 0,
      totalReferralCommission: 0,
      totalAgentCommission: 0
    },
    previousStats: {
      totalGrossPrice: 0,
      totalSiteCommission: 0,
      totalNetPrice: 0,
      totalGrossPriceICP: 0,
      totalGrossPriceTRAX: 0,
      totalGrossPriceCKBTC: 0,
      totalSiteCommissionICP: 0,
      totalSiteCommissionTRAX: 0,
      totalSiteCommissionCKBTC: 0,
      totalNetPriceICP: 0,
      totalNetPriceTRAX: 0,
      totalNetPriceCKBTC: 0,
      totalReferralCommission: 0,
      totalAgentCommission: 0
    }
  });

  // Calculate percentage change between current and previous values
  const calculatePercentageChange = (current, previous) => {
    // If previous is 0, we can't calculate percentage change (would be division by zero)
    if (previous === 0) {
      // If current is also 0, return "0%"
      if (current === 0) return "0%";
      // If current is positive, return "∞%" (infinite growth from zero)
      return "+∞%";
    }
    
    const change = ((current - previous) / previous) * 100;
    
    // Format with + or - sign, and round to one decimal place
    if (change > 0) {
      return `+${change.toFixed(1)}%`;
    } else {
      return `${change.toFixed(1)}%`; // Negative numbers already have a - sign
    }
  };

  // Function to fetch transactions from different services
  const fetchTransactions = async () => {
    try {
      const { currentOffset } = data;
      const pageSize = 99;
      const sort = 'desc';
      const sortBy = 'createdAt';
      const type = '';

      setData(prevData => ({
        ...prevData,
        isBalanceLoading: true
      }));

      const [earningResp, payoutRequestResp, tokenPackageResp] = await Promise.all([
        earningService.accountSearch({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
          type,
        }),
        payoutRequestService.search({
          limit: pageSize,
          offset: currentOffset,
          sort,
          sortBy,
        }),
        paymentService.userSearch({ sort, sortBy, limit: pageSize, offset: currentOffset, type: 'token_package' })
      ]);

      const formattedEarnings = earningResp?.data?.data?.map(e => ({ ...e, activityType: 'earning' })) || [];
      const formattedPayouts = payoutRequestResp?.data?.data?.map(p => ({ ...p, activityType: 'payout' })) || [];
      const formattedTokenPackages = tokenPackageResp?.data?.data?.map(p => ({ ...p, activityType: 'tokenPackage' })) || [];

      const newTransactions = [...formattedEarnings, ...formattedPayouts, ...formattedTokenPackages]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });

      // Get the total number of transactions
      const totalTransactions = Math.max(
        earningResp?.data?.total || 0,
        payoutRequestResp?.data?.total || 0,
        tokenPackageResp?.data?.total || 0
      );

      setData(prevData => ({
        ...prevData,
        transactions: [...(prevData.transactions || []), ...newTransactions],
        currentOffset: currentOffset + pageSize,
        hasMore: currentOffset + pageSize < totalTransactions,
        isBalanceLoading: false
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error(getResponseError(error));
      setData(prevData => ({
        ...prevData,
        isBalanceLoading: false
      }));
    }
  };

  // Function to fetch more transactions when scrolling
  const fetchMoreTransactions = () => {
    fetchTransactions();
  };

  // Helper function to get transaction type
  const getTransactionType = (transaction) => {
    if (!transaction) return '-';
    
    if (transaction.activityType === 'payout') {
      return `Payout request (${transaction.status || 'pending'})`;
    }
    if (transaction.activityType === 'tokenPackage') {
      return `${transaction?.products?.[0]?.tokens || ''} token package (${transaction.status || 'pending'})`;
    }

    const type = transaction.sourceType === 'referral' ? 'referral' : transaction.subscriptionType || transaction.type;
    
    switch (type) {
      case 'monthly':
      case 'monthly_subscription':
        return 'Monthly subscription';
      case 'yearly':
      case 'yearly_subscription':
        return 'Yearly subscription';
      case 'free_subscription':
      case 'free':
        return 'Free subscription';
      case 'tip':
        return 'Tip';
      case 'video':
        return 'Video purchase';
      case 'referral':
        return `Referral (${transaction.type || 'general'})`;
      default:
        return type || 'Transaction';
    }
  };

  // Helper function to format amount
  const formatAmount = (transaction) => {
    if (!transaction) return '-';
    
    if (transaction.activityType === 'earning' && transaction.netPrice !== undefined) {
      return `${transaction.isCrypto ? `${transaction.tokenSymbol || ''} ` : '$'}${parseFloat(transaction.netPrice).toFixed(2)}`;
    }
    if (transaction.activityType === 'payout' && transaction.requestTokens !== undefined) {
      return `-$${parseFloat(transaction.requestTokens).toFixed(2)}`;
    }
    if (transaction.activityType === 'tokenPackage' && transaction.originalPrice !== undefined) {
      return `$${parseFloat(transaction.originalPrice).toFixed(2)}`;
    }
    return '-';
  };

  // Fetch wallet balance data
  const fetchWalletData = async () => {
    try {
      // Default to just the base account balance
      let totalBalance = currentUser?.account?.balance || 0;
      let traxFormattedBalance = 0;
      let traxValueInUSD = 0;

      /* remove balace from Trax crypto
      if (currentUser?.account?.wallet_icp) {
        const host = settings.icHost;
        const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);
        
        // Get TRAX price
        const traxPrice = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;
        
        // Set up agent
        const agent = new HttpAgent({ host });
        if (settings.icNetwork !== true) {
          await agent.fetchRootKey();
        }
        
        // Create ledger and fetch balance
        const ledgerActorTRAX = IcrcLedgerCanister.create({ 
          agent, 
          canisterId: TRAXLedgerCanID 
        });
        
        const traxBal = await ledgerActorTRAX.balance({
          owner: Principal.fromText(currentUser.account.wallet_icp),
          certified: false,
        });
        
        // Format TRAX balance
        traxFormattedBalance = Number(traxBal) / 100000000;
        traxValueInUSD = traxPrice * traxFormattedBalance;
        
        // Update total balance to include TRAX value
        totalBalance += traxValueInUSD;
      } */
      
      // Update all state values at once
      setData(prevData => ({
        ...prevData,
        balanceTRAX: traxFormattedBalance,
        balanceTRAXUSD: traxValueInUSD,
        totalWalletBalance: totalBalance,
        isBalanceLoading: false
      }));
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      // Update state with error information
      setData(prevData => ({
        ...prevData,
        isBalanceLoading: false,
        error: "Failed to load balance information"
      }));
    }
  };

  // Fetch account stats for current period and previous month
  const fetchAccountStats = async () => {
    try {
      // Calculate dates for one month ago from today
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      
      // Start date for both queries - use earliest possible date
      const earliestDate = new Date(0); // January 1, 1970
      
      // Format dates to ISO strings for the API
      const earliestDateISO = earliestDate.toISOString();
      const nowISO = now.toISOString();
      const oneMonthAgoISO = oneMonthAgo.toISOString();

      // Fetch current stats (all data up to now)
      const currentStatsResp = await earningService.accountStats({
        fromDate: earliestDateISO,
        toDate: nowISO
      });
      
      // Fetch previous stats (all data up to one month ago)
      const previousStatsResp = await earningService.accountStats({
        fromDate: earliestDateISO,
        toDate: oneMonthAgoISO
      });
      
      if (currentStatsResp.data && previousStatsResp.data) {
        setData(prevData => ({
          ...prevData,
          stats: currentStatsResp.data,
          previousStats: previousStatsResp.data
        }));
      }
    } catch (error) {
      console.error('Error fetching account stats:', error);
    }
  };

  // Fetch payout requests and calculate total tokens for current and previous periods
  const fetchPayoutRequests = async () => {
    try {
      // Calculate dates for one month ago
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      
      const nowISO = now.toISOString();
      const oneMonthAgoISO = oneMonthAgo.toISOString();
      
      // Parameters for fetching all payouts (no pagination for complete data)
      const sort = 'desc';
      const sortBy = 'createdAt';
      const limit = 1000; // Use a large limit to get all records

      // Fetch all payout requests
      const allPayoutsResp = await payoutRequestService.search({
        sort,
        sortBy,
        limit
      });
      
      // Process current payouts (all payouts up to now)
      const currentPayouts = allPayoutsResp?.data?.data || [];
      let totalCurrentTokens = 0;
      
      // Calculate total tokens for all payouts
      currentPayouts.forEach(payout => {
        if (payout.requestTokens) {
          totalCurrentTokens += parseFloat(payout.requestTokens) || 0;
        }
      });
      
      // Filter previous payouts (only payouts up to one month ago)
      const previousPayouts = currentPayouts.filter(payout => {
        const payoutDate = new Date(payout.createdAt);
        return payoutDate <= oneMonthAgo;
      });
      
      let totalPreviousTokens = 0;
      
      // Calculate total tokens for previous period
      previousPayouts.forEach(payout => {
        if (payout.requestTokens) {
          totalPreviousTokens += parseFloat(payout.requestTokens) || 0;
        }
      });
      
      // Update the state with both token totals
      setData(prevData => ({
        ...prevData,
        totalPayoutTokens: totalCurrentTokens,
        previousPayoutTokens: totalPreviousTokens
      }));
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      message.error(getResponseError(error));
    }
  };

  // Initial data loading
  useEffect(() => {
    if (currentUser && settings) {
      // Set loading state at the beginning
      setData(prevData => ({
        ...prevData,
        isBalanceLoading: true
      }));
      
      // Fetch both wallet data and transactions separately
      fetchWalletData();
      fetchTransactions();
      fetchAccountStats();
      fetchPayoutRequests();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <img src="/static/trax_loading_optimize.gif" alt="Loading..." className="w-96" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${ui?.siteName || 'Trax'} | Earnings`}</title>
      </Head>
      <div className='main-container content-container mt-4 pt-[20px] sm:mt-0 min-h-screen px-4'>
        <Heading className='uppercase'>Earnings</Heading>
        <div className="mt-8 flex items-end">
          <Subheading className="flex-grow">Overview</Subheading>
          <div className="flex items-center">
              <Link href="/artist/payout-request/create">
              <Button>Withdraw</Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <Stat 
            title="Balance" 
            value={`$${data?.totalWalletBalance?.toFixed(2) || '0.00'}`} 
            change={(() => {
              // Get values with fallbacks to 0 if undefined
              const currentNetPrice = data?.stats?.totalNetPrice || 0;
              const previousNetPrice = data?.previousStats?.totalNetPrice || 0;
              const currentPayouts = data?.totalPayoutTokens || 0;
              const previousPayouts = data?.previousPayoutTokens || 0;
              
              // Calculate current and previous balances
              const currentBalance = currentNetPrice - currentPayouts;
              const previousBalance = previousNetPrice - previousPayouts;
              
              return calculatePercentageChange(currentBalance, previousBalance);
            })()}
          />
          <Stat 
            title="Rewards" 
            value={`N/A`} 
            change='0.0%'
          />
          <Stat 
            title="Lifetime earnings" 
            value={`$${(data?.stats?.totalNetPrice || 0).toFixed(2)}`} 
            change={(() => {
              const current = data?.stats?.totalNetPrice || 0;
              const previous = data?.previousStats?.totalNetPrice || 0;
              return calculatePercentageChange(current, previous);
            })()}
          />
        </div>
        <div className="mt-8 flex items-end">
          <Subheading className="flex-grow mt-14">Recent activity</Subheading>
        </div>
        
        <InfiniteScroll
          dataLength={data.transactions ? data.transactions.length : 0}
          next={fetchMoreTransactions}
          hasMore={data.hasMore}
          loader={<div className="text-center text-trax-gray-500">Loading...</div>}
          scrollableTarget="scrollableDiv"
        >
          <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
            <TableHead>
              <TableRow>
                <TableHeader>Transaction #</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>User</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.transactions && data.transactions.map((transaction, index) => (
                <TableRow key={transaction?._id || index}>
                  <TableCell>{String(index + 1).padStart(3, '0')}</TableCell>
                  <TableCell className="text-trax-zinc-500">
                    {transaction?.createdAt ? formatDate(transaction.createdAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar 
                        src={(transaction?.userInfo?.avatar || 
                             transaction?.sourceInfo?.performerInfo?.avatar || 
                             transaction?.sourceInfo?.userInfo?.avatar ||
                             '/static/no-avatar.png')} 
                        className="size-6" 
                      />
                      <span>
                        {transaction?.userInfo?.name || 
                         transaction?.sourceInfo?.performerInfo?.name || 
                         transaction?.sourceInfo?.userInfo?.name || 
                         '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getTransactionType(transaction)}</TableCell>
                  <TableCell>{formatAmount(transaction)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </InfiniteScroll>
        {(!data.transactions || data.transactions.length === 0) && !data.isBalanceLoading && (
          <div className="text-center text-trax-gray-500 mt-4">No transactions found.</div>
        )}
      </div>
    </>
  )
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  ui: { ...state.ui },
  settings: { ...state.settings },
});

export default connect(mapStates)(Earnings);