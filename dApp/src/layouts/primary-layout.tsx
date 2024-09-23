import React, { useState, useEffect } from 'react';
import { Layout, FloatButton, message, Image } from 'antd';
import Link from 'next/link';
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
import {
   IUser
} from 'src/interfaces';
interface DefaultProps {
  loadUIValue: Function;
  children: any;
  ui: IUIConfig;
  user: IUser;
}

const PrimaryLayout: React.FC<DefaultProps> = ({ loadUIValue, children, ui, user }) => {
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

  const router = useRouter();

  function handleGenreFromChild(selectedGenre) {
    setGenreFromChild(selectedGenre);
  }

  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    currentPathCleaned !== '' && setIsSearch(false);
    currentPathCleaned === '' && setTitle('');
    currentPathCleaned === 'artist/studio' &&  setTitle('Studio');
    currentPathCleaned === 'artist/earnings' && setTitle('Earnings');
    currentPathCleaned === 'artist/account'  && setTitle('Settings');
    currentPathCleaned === 'user/account'  && setTitle('Settings');
    currentPathCleaned === 'user/wallet'  && setTitle('Wallet');
    currentPathCleaned === 'user/purchased'  && setTitle('Purchased');
    currentPathCleaned === 'user/library'  && setTitle('Library');

    loadUIValue();
    handleStateChange();

    setIsMobile(window.innerWidth < 640);
    setIsTablet(window.innerWidth < 1000);

    window.addEventListener('resize', updateMedia);

    return () => window.removeEventListener('resize', updateMedia);
  }, [router.asPath]);


  const updateMedia = () => {
    setIsMobile(window.innerWidth < 640);
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

  return (
    <>
      <div className={styles.layoutModule}>
        <Layout className={`${isMobile ? '' : 'sidebar-layout'} ${sidebar ? 'sidebar-expanded' : 'sidebar-collapsed'} ${!user?._id && isMobile ? 'overflow-hidden' : ''}`}>
          <div className={ui?.theme === 'dark' ? 'container dark' : 'container'} id="primaryLayout" key="primaryLayout">
              <Link href={'/'} className={isMobile ? "fixed-nav-logo-mobile" : "fixed-nav-logo"}>
                {(isMobile && title !== '') ? (
                  <span className='top-[5px] relative text-[#b3b3b3] text-2xl uppercase font-heading'>{title}</span>
                ) : (
                  <>
                    {isMobile ? (
                        <Image alt="logo" preview={false} width="130px" className='' src="/static/trax_primary_logotype.svg" />
                    ):(
                        <Image alt="logo" preview={false} width="100px" className='' src="/static/trax_primary_logotype.svg" />
                    )}
                  </>
                )}
              </Link>

            {isMobile ? (
              <>
                <NewHeader insideComponent={handleClickInside} isClickedOutside={isClicked} onOutsideClick={handleOutsideClick} onFinish={handleSearch} onSidebarToggle={handleSidebarToggle} setSidebar={sidebar} sendGenreToParent={handleGenreFromChild} />
                <Header />
              </>
            ) : (
              <>
                <NewHeader onOutsideClick={handleOutsideClick} onFinish={handleSearch} onSidebarToggle={handleSidebarToggle} setSidebar={sidebar} sendGenreToParent={handleGenreFromChild} />
                <Sidebar onSidebarToggle={handleSidebarToggle} setSidebar={sidebar} />
              </>
            )}
            {!isSearch  || genreFromChild === 'featured' ? (
              <Layout.Content className="content" style={{ position: 'relative' }}>
                {routerChange && <Loader />}
                {children}
                <NewFooter />
              </Layout.Content>
            ) : (
              <Layout.Content className="content" style={{ position: 'relative' }}>
                {routerChange && <Loader />}
                <div  className='mt-[4.5rem] sm:mt-8 px-0 sm:px-12'>
                  <VideoSearch tags={genreFromChild}/>
                </div>
                <NewFooter />
              </Layout.Content>
            )}
            {/* <FloatButton.BackTop className="backTop" /> */}

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
});

const mapDispatchToProps = { loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);