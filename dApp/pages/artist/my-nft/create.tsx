
import { IPerformer, ISettings, IUIConfig } from 'src/interfaces';
import { PureComponent } from "react";
import { Layout, message } from 'antd';
import Router from 'next/router';
import { ReadOutlined } from '@ant-design/icons';
import Head from "next/head";
import PageHeading from '@components/common/page-heading';
import { connect } from 'react-redux';
import CreateSongNftForm from '@components/nft/form-song';
import CreateTicketNftForm from '@components/nft/form-ticket';

interface IProps {
  ui: IUIConfig;
  user: IPerformer;
  settings: ISettings;
}

interface IStates {
  submiting: boolean;
  type: string;
}

class NFTCreatePage extends PureComponent<IProps, IStates> {
  state = {
    submiting: false,
    type: 'song'
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user.verifiedDocument) {
      message.warning('Your Identity has not been verified yet! You can\'t post any content right now. Please to to Account settings to verify your account.');
      Router.back();
    }
    if (!user?.wallet_icp) {
      message.info('You must connect your wallet id to TRAX in order to make use of web3 features.');
    }
  }

  render() {
    const { ui, user } = this.props;
    const { type } = this.state;
    return <Layout>
    <Head>
      <title>{`${ui?.siteName} | New NFT`}</title>
    </Head>
      <div className="main-container">
        <PageHeading title="New NFT" icon={<ReadOutlined />} />
        <div style={{display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
          <button onClick={() => this.setState({type: 'song'})} style={{borderRadius: '5px', borderWidth: '1px', borderColor: '#fff', backgroundColor: '#111', padding: '5px 20px 5px 20px'}}>Song</button>
          <button onClick={() => this.setState({type: 'ticket'})} style={{borderRadius: '5px', borderWidth: '1px', borderColor: '#fff', backgroundColor: '#111', padding: '5px 20px 5px 20px'}}>Ticket</button>
        </div>
        {
        type === 'song' ? <CreateSongNftForm performer={user} type="video" /> : <CreateTicketNftForm performer={user} type="photo" />
        }
      </div>
    </Layout>;
  }
}
const mapStates = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current },
  settings: { ...state.settings }
});
export default connect(mapStates)(NFTCreatePage);