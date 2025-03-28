import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { connect } from 'react-redux';
import { 
  tokenTransctionService,
  earningService,
  payoutRequestService,
  subscriptionService,
  paymentService,
  authService,
  accountService
} from '@services/index';
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import { IPerformer, IUIConfig } from 'src/interfaces';
import { Avatar } from '@components/common/catalyst/avatar'
import { Badge } from '@components/common/catalyst/badge'
import { Button } from '@components/common/catalyst/button'
import { Text } from '@components/common/catalyst/text'
import { Input, InputGroup } from '@components/common/catalyst/input';
import { Field, Label } from '@components/common/catalyst/fieldset';
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

function Referals({ currentUser, ui, settings }: IProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    isBalanceLoading: false,
    transactions: [],
    hasMore: true,
    currentOffset: 0
  });

  const [isCopied, setIsCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [paymentList, setPaymentList] = useState([]);
  const [referralList, setReferralList] = useState([]);
  const [previousMonthReferralList, setPreviousMonthReferralList] = useState([]);

  // Generate referral link
  const generateReferralLink = useCallback(() => {
    const referralCode = currentUser?.account?.userReferral;
    
    if (typeof window !== 'undefined' && referralCode) {
      const { protocol, hostname, port } = window.location;
      const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      setReferralLink(`${baseUrl}/register?referralCode=${referralCode}`);
    }
  }, [currentUser]);

  // Search earnings functionality
  const userSearchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await earningService.performerReferralSearch({});
      const referralResp = await accountService.searchReferralList({
        accountId: currentUser?.account?._id
      });
      
      // Get current date and calculate one month ago
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      
      // Set full referral list
      const allReferrals = referralResp.data.data || [];
      setReferralList(allReferrals);
      
      // Filter referrals for previous month
      const previousReferrals = allReferrals.filter(referral => {
        const referralDate = new Date(referral.createdAt);
        return referralDate < oneMonthAgo;
      });
      
      setPreviousMonthReferralList(previousReferrals);
      setPaymentList(resp.data.data);
      setLoading(false);
      
    } catch (error) {
      message.error(getResponseError(await error));
      setLoading(false);
    }
  }, [currentUser?.account?._id]);

  // Initialize data when component mounts
  useEffect(() => {
    generateReferralLink();
    userSearchEarnings();
  }, [generateReferralLink, userSearchEarnings]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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

  // Function to fetch transactions - only referral earnings
  const fetchTransactions = async () => {
    try {
      const { currentOffset } = data;
      const pageSize = 99;
      const sort = 'desc';
      const sortBy = 'createdAt';

      setData(prevData => ({
        ...prevData,
        isBalanceLoading: true
      }));

      // Only fetch earnings
      const earningResp = await earningService.accountSearch({
        limit: pageSize,
        offset: currentOffset,
        sort,
        sortBy,
        sourceType: 'referral' // Only get referral type earnings
      });

      // Format and filter for only earnings
      const formattedEarnings = earningResp?.data?.data?.map(e => ({ ...e, activityType: 'earning' })) || [];
      
      // Filter to ensure we only have referral transactions
      const referralEarnings = formattedEarnings.filter(transaction => 
        transaction.sourceType === 'referral'
      );

      // Get the total number of transactions
      const totalTransactions = earningResp?.data?.total || 0;

      setData(prevData => ({
        ...prevData,
        transactions: [...(prevData.transactions || []), ...referralEarnings],
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

  // Helper function to get transaction type - simplified for referrals only
  const getTransactionType = (transaction) => {
    if (!transaction) return '-';
    
    // All transactions should be referrals now
    return `Referral (${transaction.type || 'general'})`;
  };

  // Helper function to format amount - simplified for earnings only with proper null handling
  const formatAmount = (transaction) => {
    // Return dash if transaction is missing or netPrice is null/undefined/NaN
    if (!transaction || 
        transaction.netPrice === undefined || 
        transaction.netPrice === null || 
        isNaN(parseFloat(transaction.netPrice))) return '-';
    
    // Format referral earnings
    return `${transaction.isCrypto ? `${transaction.tokenSymbol || ''} ` : '$'}${parseFloat(transaction.netPrice).toFixed(2)}`;
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
      fetchTransactions();
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
        <title>{`${ui?.siteName || 'Trax'} | Referals`}</title>
      </Head>
      <div className='main-container content-container mt-4 pt-[20px] sm:mt-0 min-h-screen px-4'>
        <Heading className='uppercase'>Referals</Heading>
        <Text className="mt-4 mb-6 w-1/2 text-base">
          Invite artists to join TRAX and we'll reward you when they sign up and start creating. 
          Copy your unique referral or profile link and share it with friends, family, 
          ...complete strangers!
        </Text>
        
        <div className="mt-8 w-full">
          <Field className="w-full">
            <Label htmlFor="referral-link" className="pb-2">
              Copy your unique referral link
            </Label>
            
            <div className="flex flex-col sm:flex-row w-full gap-2">
              <div className="w-1/3">
                <InputGroup className="w-full">
                  <Input
                    id="referral-link"
                    type="text"
                    value={referralLink}
                    readOnly
                  />
                </InputGroup>
              </div>
              <Button onClick={copyToClipboard}>
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </Field>
        </div>
        <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat 
            title="Signups" 
            value={`${referralList?.length || 0}`} 
            change={(() => {
              // Calculate percentage change between all-time and previous month
              const currentCount = referralList?.length || 0;
              const previousCount = previousMonthReferralList?.length || 0;
              const newSignups = currentCount - previousCount;
              
              // If no previous signups but have current ones, calculate based on new count
              if (previousCount === 0) {
                // If we went from 0 to N, that's an N*100% increase
                return newSignups > 0 ? `+${newSignups * 100}%` : "0%";
              }
              
              // Calculate percentage growth
              const percentChange = (newSignups / previousCount) * 100;
              
              // Format with + or - sign, and round to one decimal place
              if (percentChange > 0) {
                return `+${percentChange.toFixed(1)}%`;
              } else {
                return `${percentChange.toFixed(1)}%`;
              }
            })()}
          />
          <Stat 
            title="Pending earnings" 
            value={`N/A`} 
            change='0.0%'
          />
          <Stat 
            title="Available to withdraw" 
            value="N/A" 
            change="0.0%"
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
                <TableHeader>Earning type</TableHeader>
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

export default connect(mapStates)(Referals);