/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout, Button } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer, ISettings, IUIConfig, IUser
} from 'src/interfaces';
import { PlusCircleIcon, } from '@heroicons/react/24/outline';
import Products from '../my-store';
import Video from '../my-video';
import Music from '../my-video/my-music';
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
    isMobile: false,
    stage: 0
  };

  async componentDidMount() {
    this.checkScreenSize();
  }

  checkScreenSize(){
    this.setState({ isMobile: window.innerWidth < 500 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 500 });
  };

  changeStage(val: number) {
    this.setState({ stage: val });
  }

  render() {
    const { stage, isMobile } = this.state;
    const { ui, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | My Payments`}</title>
        </Head>
        <div className="main-container content-container mt-4 sm:mt-0">
          <div className='flex flex-row justify-between items-center px-4'>
            {!isMobile && (
              <h1 className="content-heading">Studio</h1>
            )}
          </div>

          <div className="tab-bar-studio">

            <div onClick={() => this.changeStage(0)} className="tab-btn-studio-wrapper">
              <h1 className={`${stage === 0 ? 'selected-studio-btn' : ''}`}>Music</h1>
              <div className={`${stage === 0 ? 'active' : ''} tab-btn-studio`} />
            </div>

            <div onClick={() => this.changeStage(1)} className="tab-btn-studio-wrapper">
              <h1 className={`${stage === 1 ? 'selected-studio-btn' : ''}`}>Videos</h1>
              <div className={`${stage === 1 ? 'active' : ''} tab-btn-studio`} />
            </div>

            {/* <div onClick={() => this.changeStage(2)} className="tab-btn-studio-wrapper">
              <h1 className={`${stage === 2 ? 'selected-studio-btn' : ''}`}>Events</h1>
              <div className={`${stage === 2 ? 'active' : ''} tab-btn-studio`} />
            </div> */}
          </div>

          {stage === 0 && <Music />}
          {stage === 1 && <Video/>}
          {/* {stage === 2 && <Tickets user={user} />} */}
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
