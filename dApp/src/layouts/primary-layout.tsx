import { PureComponent } from 'react';
import dynamic from 'next/dynamic';
import { Layout, FloatButton } from 'antd';
import { connect } from 'react-redux';
import { Router } from 'next/router';
import { IUIConfig } from 'src/interfaces/ui-config';
import { loadUIValue } from '@redux/ui/actions';
import Loader from '@components/common/base/loader';
import Header from '@components/common/layout/header';
import NewHeader from '@components/common/layout/new-header';
import Footer from '@components/common/layout/footer';
import Sidebar from '@components/common/layout/sidebar';
import styles from './primary-layout.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
// import {AudioPlayer} from '../components/common/layout/audio-player'

interface DefaultProps {
  loadUIValue: Function;
  children: any;
  ui: IUIConfig
}

class PrimaryLayout extends PureComponent<DefaultProps> {
  state = {
    routerChange: false,
    isMobile: false
  };

  componentDidMount() {
    const { loadUIValue: handleLoadUI } = this.props;
    process.browser && handleLoadUI();
    process.browser && this.handleStateChange();

    this.setState({ isMobile: window.innerWidth < 450 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 450 });
  };

  handleStateChange() {
    Router.events.on('routeChangeStart', async () => this.setState({ routerChange: true }));
    Router.events.on('routeChangeComplete', async () => this.setState({ routerChange: false }));
  }

  render() {
    const {
      children, ui
    } = this.props;
    const { routerChange, isMobile } = this.state;
    return (
      <>
        <div className={styles.layoutModule}>
          <Layout className={isMobile ? '' : 'sidebar-layout'}>
            <div
              className={ui?.theme === 'dark' ? 'container dark' : 'container'}
              id="primaryLayout"
              key="primaryLayout"
            >
              {isMobile ? (
                <Header />
              ):(
                <Sidebar />
                
              )}
              
              <Layout.Content
                className="content"
                style={{ position: 'relative' }}
              >
                {routerChange && <Loader />}
                {children}
                {/* <div className="alpha-tag-wrapper">
                  <div className="alpha-tag">
                    Beta v2.7
                  </div>
                </div> */}
                
              </Layout.Content>
              {/* <AudioPlayer /> */}
              <FloatButton.BackTop className="backTop" />

            </div>
            
          </Layout>

          {/* <div className='music-player-container'>
            <div className='music-player-wrapper'>
              <div className='music-player-left'>
                <button className='music-player-play-btn'>
                  <FontAwesomeIcon icon={faPlay} />
                </button>
                
              </div>
              <div className='music-player-middle'>

              </div>
              <div className='music-player-right'>

              </div>
            </div>
          </div> */}

          

        </div>
        <Footer />
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ui: { ...state.ui }
});
const mapDispatchToProps = { loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);
