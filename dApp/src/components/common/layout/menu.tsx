import { Menu } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  theme?: string;
  isMobile?: boolean;
  menus?: any;
  collapsed?: boolean;
}

export class SiderMenu extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    openKeys: []
  };

  componentDidMount() {
  }

  onOpenChange = (keys) => {
    const { menus } = this.props;
    const { openKeys } = this.state;
    const rootSubmenuKeys = menus.filter((_) => !_.menuParentId).map((_) => _.id);

    const latestOpenKey = keys.find(
      (key) => openKeys.indexOf(key) === -1
    );

    let newOpenKeys = keys;
    if (rootSubmenuKeys.indexOf(latestOpenKey) !== -1) {
      newOpenKeys = latestOpenKey ? [latestOpenKey] : [];
    }
    this.setState({
      openKeys: newOpenKeys
    });
  }

  generateMenus = (data) => data.map((item) => {
    if (item.children) {
      return (
        <Menu.SubMenu
          key={item.id}
          title={(
            <>
              {item.icon}
              <span>{item.name}</span>
            </>
          )}
        >
          {this.generateMenus(item.children)}
        </Menu.SubMenu>
      );
    }
    return (
      <Menu.Item key={item.id}>
        {item.icon}
        <Link href={item.route} as={item.as || item.route}>
          {item.name}
        </Link>
      </Menu.Item>
    );
  })

  flatten(menus, flattenMenus = []) {
    menus.forEach((m) => {
      if (m.children) {
        this.flatten(m.children, flattenMenus);
      }
      const tmp = { ...m };
      delete tmp.children;
      flattenMenus.push(tmp);
    });

    return flattenMenus;
  }

  render() {
    const { theme, menus, collapsed } = this.props;
    const { openKeys } = this.state;
    const menuProps = collapsed
      ? {}
      : {
        openKeys
      };

    return (
      <Menu
        mode="inline"
        theme={theme as any}
        onOpenChange={this.onOpenChange.bind(this)}
        {...menuProps}
      >
        {this.generateMenus(menus)}
      </Menu>
    );
  }
}

SiderMenu.defaultProps = {
  theme: '',
  isMobile: false,
  menus: [],
  collapsed: false
} as Partial<IProps>;
