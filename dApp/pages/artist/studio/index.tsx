/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout } from 'antd';
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
import { AnimatePresence, motion } from "framer-motion";
import TraxToggle from '@components/common/TraxToggleButton';
import { authService, settingService, userService, cryptoService, routerService } from '@services/index';
import { Heading } from '@components/common/catalyst/heading'
import { Input, InputGroup } from '@components/common/catalyst/input'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import { Button } from '@components/common/catalyst/button'

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  settings: ISettings;
  user: IPerformer;
}


const initial = { opacity: 0, y: 0 };
const animate_1 = {opacity: 1, y: 0,
  transition: {
    duration: 1,
    delay: 0.3,
    ease: "easeOut",
    once: true,
  },
}

const animate_2 = {opacity: 1, y: 0,
  transition: {
    duration: 1,
    delay: 0.5,
    ease: "easeOut",
    once: true,
  },
}


class MyContentPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    isMobile: false,
    isVideo: false,
    activeTab: 'music'
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

  handleToggleChange = (value: boolean) => {
    this.setState({ isVideo: value });
  };

  render() {
    const { isVideo, isMobile, activeTab } = this.state;
    const { ui, user } = this.props;
    const token = authService.getToken();
    return (
      <Layout className='px-4 dark:bg-trax-zinc-900 rounded-lg'>
        <Head>
          <title>{`${ui?.siteName} | My Payments`}</title>
        </Head>
        <div className="main-container content-container mt-4 pt-[20px] sm:mt-0">
          <Heading>STUDIO</Heading>
            <Video />       
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
