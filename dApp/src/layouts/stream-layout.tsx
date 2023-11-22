import Footer from '@components/common/layout/footer';
import Header from '@components/common/layout/header';
import { loadUIValue } from '@redux/ui/actions';
import { FloatButton, Layout } from 'antd';
import dynamic from 'next/dynamic';
import { Router } from 'next/router';
import Script from 'next/script';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/ui-config';
import styles from './primary-layout.module.scss';

const LoadScripts = dynamic(() => import('@components/common/base/stream-scripts'), { ssr: false });
const Loader = dynamic(() => import('@components/common/base/loader'));

interface DefaultProps {
  loadUIValue: Function;
  children: any;
  ui: IUIConfig
}

class PrimaryLayout extends PureComponent<DefaultProps> {
  state = {
    routerChange: false
  };

  componentDidMount() {
    const { loadUIValue: handleLoadUI } = this.props;
    process.browser && handleLoadUI();
    process.browser && this.handleStateChange();
  }

  handleStateChange() {
    Router.events.on('routeChangeStart', async () => this.setState({ routerChange: true }));
    Router.events.on('routeChangeComplete', async () => this.setState({ routerChange: false }));
  }

  render() {
    const {
      children, ui
    } = this.props;
    const { routerChange } = this.state;
    return (
      <>
        <div className={styles.layoutModule}>
          <Layout>
            <LoadScripts />
            <div
              className={ui?.theme === 'dark' ? 'container dark' : 'container'}
              id="primaryLayout"
            >
              <Header />
              <Layout.Content
                className="content"
                style={{ position: 'relative' }}
              >
                {routerChange && <Loader />}
                {children}
              </Layout.Content>
              <FloatButton.BackTop className="backTop" />
            </div>
            <Script src="/static/lib/webrtc_adaptor.js" />
          </Layout>
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
