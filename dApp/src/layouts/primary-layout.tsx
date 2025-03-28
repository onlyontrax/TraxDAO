import React, { useState, useEffect } from 'react';
import { Layout, FloatButton, message, Image } from 'antd';
import Link from 'next/link';
import Head from 'next/head';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import { IUIConfig } from 'src/interfaces/ui-config';
import { loadUIValue } from '@redux/ui/actions';
import Loader from '@components/common/base/loader';
import Header from '@components/common/layout/header';
import NewHeader from '@components/common/layout/new-header';
import Footer from '@components/common/layout/footer';
import NewFooter from '@components/common/layout/NewFooter';
import Sidebar from '@components/common/layout/sidebar';
import styles from './primary-layout.module.scss';
import { performerService } from 'src/services';
import VideoSearch from '@components/video/Video-search';
import WavePlayer from '@components/common/wave-audio-player';
import { IAccount, IUser } from 'src/interfaces';
import { motion } from 'framer-motion';
import { bannerService } from '@services/banner.service';
import FeedContainer from '@components/common/FeedContainer';
import { SplideBanner } from '@components/common';
import { Store } from 'redux';
import { EmailVerificationBanner } from '@components/common/email-verification-banner';

interface DefaultProps {
  loadUIValue: Function;
  children: any;
  ui: IUIConfig;
  user: IUser;
  account: IAccount;
}

const initial2 = { opacity: 0, y: 20 };
const animate1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1.3,
    delay: 0.3,
    ease: 'easeOut',
    once: true,
  },
};

const PrimaryLayout: React.FC<DefaultProps> = ({ loadUIValue, children, ui, user, account }) => {
  const [routerChange, setRouterChange] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [performers, setPerformers] = useState([]);
  const [sidebar, setSidebar] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(15);
  const [filter] = useState({ sortBy: 'latest' });
  const [isClicked, setIsClicked] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [genreFromChild, setGenreFromChild] = useState('');
  const [title, setTitle] = useState('');
  const [banners, setBanners] = useState([]);

  const router = useRouter();

  function handleGenreFromChild(selectedGenre) {
    setGenreFromChild(selectedGenre);
  }

  // New handler for logo clicks
  const handleLogoClick = (e) => {
    // Reset search state
    setIsSearch(false);
    setGenreFromChild('');
  };

  // New handler for header clicks
  const handleHeaderClick = (e) => {
    if (e) {
      e.preventDefault(); // Prevent any default navigation if needed
      e.stopPropagation(); // Stop event bubbling if needed
    }
    setIsSearch(false);
    setGenreFromChild('');
  };

  const getBanners = async () => {
    try {
      const response = await bannerService.search({ limit: 99 });
      setBanners(response?.data?.data || []);
    } catch (e) {
      setBanners([]);
    }
  }

  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    currentPathCleaned !== '' && setIsSearch(false);
    currentPathCleaned === '' && setTitle('');
    currentPathCleaned === 'artist/studio' &&  setTitle('Studio');
    currentPathCleaned === 'artist/editor' &&  setTitle('Editor');
    currentPathCleaned === 'account/wallet' && setTitle('Wallet');
    currentPathCleaned === 'artist/account'  && setTitle('Settings');
    currentPathCleaned === 'user/account'  && setTitle('Settings');
    currentPathCleaned === 'user/purchased'  && setTitle('Purchased');
    currentPathCleaned === 'user/library'  && setTitle('Library');

    loadUIValue();
    handleStateChange();
    getBanners();
    updateMedia();

    window.addEventListener('resize', updateMedia);

    return () => window.removeEventListener('resize', updateMedia);
  }, [router.asPath]);

  const updateMedia = () => {
    if (user?.account?.activeSubaccount === "performer") {
      setIsMobile(window.innerWidth < 1024);
    } else {
      setIsMobile(window.innerWidth < 640);
    }
    setIsTablet(window.innerWidth < 1000);
  };

  const handleSearch = (isSearch, performers, total) => {
    setIsSearch(isSearch);
    setPerformers(performers);
    setTotal(total);
  };

  const handleSidebarToggle = () => {
    setSidebar(!sidebar);
  };

  const handleStateChange = () => {
    router.events.on('routeChangeStart', () => setRouterChange(true));
    router.events.on('routeChangeComplete', () => setRouterChange(false));
  };

  const getPerformers = async (offset: any, filter: any, limit: any) => {
    try {
      setFetching(true);
      const resp = await performerService.search({
        limit,
        ...filter,
        offset: limit * offset,
      });
      setPerformers(resp.data.data);
      setTotal(resp.data.total);
      setFetching(false);
    } catch {
      message.error('Error occurred, please try again later');
      setFetching(false);
    }
  };

  const pageChanged = (page: number) => {
    setOffset(page - 1);
    getPerformers(page - 1, filter, limit);
  };

  const handleOutsideClick = () => {
    setIsClicked(true);
  };

  const handleClickInside = () => {
    setIsClicked(false);
  };

  

  const topBanners = banners && banners.length > 0 && banners.filter((b) => b.position === 'top');
  const isEmailVerified = !account._id || account?.verifiedEmail ? true : false;
  const activeSubaccount = account.activeSubaccount || 'user';
  const isPerformer = activeSubaccount === 'performer';

  return (
    <>
      <div className={styles.layoutModule}>
      <Layout className={`
        ${isEmailVerified 
          ? isMobile 
            ? 'pb-[60px]' 
            : `${isPerformer 
                ? 'dark:bg-trax-zinc-900 pb-[120px] rounded-lg' 
                : 'py-[80px]'}`
          : isMobile 
            ? 'pb-[168px] pt-[113px]' 
            : 'py-[188px]'
        }
      `}>
        <div className={ui?.theme === 'dark' ? 'container dark' : 'container'} id="primaryLayout" key="primaryLayout">
            {isMobile && !isPerformer ? (
              <>
                <NewHeader 
                  insideComponent={handleClickInside} 
                  isClickedOutside={isClicked} 
                  onOutsideClick={handleOutsideClick} 
                  onFinish={handleSearch} 
                  onSidebarToggle={handleSidebarToggle} 
                  setSidebar={sidebar} 
                  sendGenreToParent={handleGenreFromChild}
                  onClick={handleHeaderClick}
                />
                <Header onClick={handleHeaderClick} />
              </>
            ) : !isPerformer ? (
              <>
                <NewHeader 
                  onOutsideClick={handleOutsideClick} 
                  onFinish={handleSearch} 
                  onSidebarToggle={handleSidebarToggle} 
                  setSidebar={sidebar} 
                  sendGenreToParent={handleGenreFromChild}
                  onClick={handleHeaderClick}
                />
                <Sidebar onSidebarToggle={handleSidebarToggle} setSidebar={sidebar} />
              </>
            ) : isMobile && isPerformer ? (
              <>
                <Header onClick={handleHeaderClick} />
              </>
            ) : (
              <>
              {/* Remove the header for performer */}
              </>
            )}
            {!isSearch || genreFromChild === 'featured' ? (
              <Layout.Content 
              className={`content ${isPerformer ? 'bg-trax-zinc-900 mb-[25px] rounded-lg' : ''}`} 
              style={{ position: 'relative'}}
            >
                {routerChange && <Loader />}
                {children}
                <NewFooter isPerformer={isPerformer}/>
              </Layout.Content>
            ) : (
              <motion.div initial={initial2} animate={animate1}>
                <Layout.Content className="content" style={{ position: 'relative' }}>
                  {routerChange && <Loader />}
                  <div className=''>
                    <SplideBanner banners={topBanners}/>
                    <FeedContainer options={{ type: 'genres', genresTag: genreFromChild}} />
                  </div>
                  <NewFooter isPerformer={isPerformer}/>
                </Layout.Content>
              </motion.div>
            )}
          </div>
        </Layout>
      </div>
      <Footer />
    </>
  );
};

const mapStateToProps = (state: any) => ({
  ui: { ...state.ui },
  user: state.user.current,
  account: { ...state.user.account}
});

const mapDispatchToProps = { loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);