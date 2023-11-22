import { BulbOutlined } from '@ant-design/icons';
import { Image, Layout, Switch } from 'antd';
import { PureComponent } from 'react';
import ScrollBar from '../base/scroll-bar';
import { SiderMenu } from './menu';
import styles from './sider.module.scss';

interface ISiderProps {
  collapsed?: boolean;
  theme?: string;
  isMobile?: boolean;
  logo?: string;
  siteName?: string;
  onThemeChange?: Function
  menus?: any;
}

class Sider extends PureComponent<ISiderProps> {
  static defaultProps: Partial<ISiderProps>;

  render() {
    const {
      collapsed, theme, isMobile, logo, siteName, onThemeChange, menus
    } = this.props;
    return (
      <div className={styles.componentsCommonLayoutSiderModule}>
        <Layout.Sider
          width={256}
          breakpoint="lg"
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="slider"
        >
          <div className="brand">
            <div className="logo">
              <Image alt="logo" src={logo} />
              {!collapsed && <h1>{siteName}</h1>}
            </div>
          </div>

          <div className="menuContainer">
            <ScrollBar
              options={{
              // Disabled horizontal scrolling, https://github.com/utatti/perfect-scrollbar#options
                suppressScrollX: true
              }}
            >
              <SiderMenu
                menus={menus}
                theme={theme}
                isMobile={isMobile}
              />
            </ScrollBar>
          </div>
          {!collapsed && (
          <div className="switchTheme">
            <span>
              <BulbOutlined />
              <span>Switch Theme</span>
            </span>
            <Switch
              onChange={onThemeChange && onThemeChange.bind(
                this,
                theme === 'dark' ? 'light' : 'dark'
              )}
              checked={theme === 'dark'}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
          </div>
          )}
        </Layout.Sider>
      </div>
    );
  }
}

Sider.defaultProps = {
  collpasapsed: false,
  theme: '',
  isMobile: false,
  logo: '',
  siteName: '',
  onThemeChange: () => {},
  menus: []
} as Partial<ISiderProps>;

export default Sider;
