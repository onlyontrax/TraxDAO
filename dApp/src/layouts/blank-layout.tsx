import { PureComponent } from 'react';
import dynamic from 'next/dynamic';
import { Layout, FloatButton } from 'antd';
import { connect } from 'react-redux';
import { Router } from 'next/router';
import { IUIConfig } from 'src/interfaces/ui-config';
import { loadUIValue } from '@redux/ui/actions';
import Loader from '@components/common/base/loader';
import Footer from '@components/common/layout/footer';
import styles from './blank-layout.module.scss';

interface DefaultProps {
  children: any;
  ui: IUIConfig;
  loadUIValue: Function;
}

class BlankLayout extends PureComponent<DefaultProps> {
  state = {
    routerChange: false
  };

  componentDidMount() {
    const { loadUIValue: handleLoadUI } = this.props;
    process.browser && handleLoadUI();
    process.browser && this.handleStateChange();
  }

  handleStateChange() {
    Router.events.on(
      'routeChangeStart',
      async () => this.setState({ routerChange: true })
    );
    Router.events.on(
      'routeChangeComplete',
      async () => this.setState({ routerChange: false })
    );
  }

  render() {
    const {
      children, ui
    } = this.props;
    const { routerChange } = this.state;
    return (
      <div className={styles.layoutModule}>
        <Layout>
          <div className={ui?.theme === 'dark' ? 'container dark' : 'container'} id="primaryLayout">
            <Layout className="content" style={{ position: 'relative' }}>
              {routerChange && <Loader />}
              {children}
              <FloatButton.BackTop className="backTop" />
              <Footer />
            </Layout>
          </div>
        </Layout>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ui: state.ui
});

const mapDispatchToProps = { loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(BlankLayout);
