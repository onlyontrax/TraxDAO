/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer, ISettings, IUIConfig, IUser
} from 'src/interfaces';

import Feeds from '../my-post';
import Products from '../my-store';
import Tracks from '../my-video';
import Tickets from '../my-events';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  settings: ISettings;
  user: IPerformer;
}

class MyContentPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    stage: 0
  };

  changeStage(val: number) {
    this.setState({ stage: val });
  }

  render() {
    const { stage } = this.state;
    const { ui, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Payments`}</title>
        </Head>
        <div className="main-container content-container">
          <h1 className="content-heading">Content</h1>
          <p />

          <div className="tab-bar">
            <div onClick={() => this.changeStage(0)} className="tab-btn-wrapper">
              <h1 className={`${stage === 0 ? 'selected-btn' : ''}`}>Feed</h1>
              <div className={`${stage === 0 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(1)} className="tab-btn-wrapper">
              <h1 className={`${stage === 1 ? 'selected-btn' : ''}`}>Tracks</h1>
              <div className={`${stage === 1 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(2)} className="tab-btn-wrapper">
              <h1 className={`${stage === 2 ? 'selected-btn' : ''}`}>Products</h1>
              <div className={`${stage === 2 ? 'active' : ''} tab-btn`} />
            </div>

            <div onClick={() => this.changeStage(3)} className="tab-btn-wrapper">
              <h1 className={`${stage === 3 ? 'selected-btn' : ''}`}>Events</h1>
              <div className={`${stage === 3 ? 'active' : ''} tab-btn`} />
            </div>
          </div>

          {stage === 0 && <Feeds />}
          {stage === 1 && <Tracks />}
          {stage === 2 && <Products user={user} />}
          {stage === 3 && <Tickets user={user} />}
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  settings: { ...state.settings }
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(MyContentPage);
