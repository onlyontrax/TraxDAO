/* eslint-disable react/no-danger */
import Link from 'next/link';
import { NextRouter, withRouter } from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig, IUser } from 'src/interfaces';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  router: NextRouter;
  customId?: string;
}
class Footer extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      ui, currentUser, router, customId
    } = this.props;
    const menus = ui.menus && ui.menus.length > 0
      ? ui.menus.filter((m) => m.section === 'footer')
      : [];
    return (
      <div className="main-footer" id={customId || 'main-footer'}>
        <div className="main-container">
          <ul>
            {!currentUser._id ? (
              <>
                <div className="footer-text-wrapper">
                  <h1>
                    Register for Early Access
                  </h1>
                  <p>
                    Join TRAX now to be eligible for our upcoming airdrop!
                  </p>
                </div>
                <div className="footer-button-wrapper">
                  <li key="login" className={router.pathname === '/login' ? 'active' : ''}>
                    <Link href="/login">
                      Log in
                    </Link>
                  </li>
                  <li key="signup">
                    <Link className="button-alternate" href="/auth/register">
                      Sign up
                    </Link>
                  </li>
                </div>
              </>
            ) : (
              <>
                <li key="home" className={router.pathname === '/home' ? 'active' : ''}>
                  <Link href="/home">
                    Home
                  </Link>
                </li>
                <li key="artist" className={router.pathname === '/artist' ? 'active' : ''}>
                  <Link href="/artist">
                    Artist
                  </Link>
                </li>
                <li key="contact" className={router.pathname === '/contact' ? 'active' : ''}>
                  <Link href="/contact">
                    Contact
                  </Link>
                </li>
              </>
            )}
            {menus
              && menus.length > 0
              && menus.map((item) => (
                <li key={item._id} className={router.pathname === item.path ? 'active' : ''}>
                  <a rel="noreferrer" href={item.path} target={item.isNewTab ? '_blank' : ''}>
                    {item.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }
}

Footer.defaultProps = {
  customId: ''
} as Partial<IProps>;

const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: { ...state.ui }
});
export default withRouter(connect(mapState)(Footer)) as any;
