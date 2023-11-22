import { IUser } from '@interfaces/user';
import { logout } from '@redux/auth/actions';
import { Layout } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { SocketContext } from 'src/socket';
import styles from './index.module.scss';

interface IProps {
  ui: any;
  user: IUser;
  logout: Function;
}

class EmailVerifiedSuccess extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  render() {
    const { ui } = this.props;

    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Email Verification`}</title>
        </Head>
        <Layout className={styles.pagesContactModule}>
          <div className="email-verify-succsess">
            <p>
              Your email has been verified,
              <Link href="/login">click here to login</Link>
            </p>
          </div>
        </Layout>
      </>
    );
  }
}
EmailVerifiedSuccess.contextType = SocketContext;
const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});

export default connect(mapStatetoProps, { logout })(EmailVerifiedSuccess);
