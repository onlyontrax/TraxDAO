import { Layout } from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import { IUIConfig } from 'src/interfaces/';
import Messenger from '@components/messages/Messenger';
import { resetMessageState } from '@redux/message/actions';

interface IProps {
  ui: IUIConfig;
  query: Record<string, string>;
  resetMessageState: Function;
}

class Messages extends PureComponent<IProps> {
  static authenticate = true;

  componentWillUnmount() {
    const { resetMessageState: resetStateHandler } = this.props;
    resetStateHandler();
  }

  render() {
    const { ui, query = {} } = this.props;
    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Messages`}</title>
        </Head>
        <Layout>
          <div className="main-container">
            <Messenger toSource={query.toSource} toId={query.toId} />
          </div>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatch = { resetMessageState };
export default connect(mapStates, mapDispatch)(Messages);
