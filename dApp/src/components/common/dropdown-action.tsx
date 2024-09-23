import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import { PureComponent } from 'react';

interface IMenuOption {
  key: string;
  name: string;
  onClick?: Function;
  children?: any;
}

interface IProps {
  menuOptions?: IMenuOption[];
  buttonStyle?: any;
  dropdownProps?: any;
  nameButtonMain?: string;
}

export class DropdownAction extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      menuOptions = [],
      buttonStyle,
      dropdownProps,
      nameButtonMain
    } = this.props;
    const menu = menuOptions.map((item) => (
      <Menu.Item key={item.key} onClick={() => item.onClick && item.onClick()}>
        {item.children || item.name}
      </Menu.Item>
    ));
    return (
      <Dropdown overlay={<Menu>{menu}</Menu>} {...dropdownProps}>
        <Button style={{ ...buttonStyle }}>
          {nameButtonMain || 'Action'}
          <DownOutlined />
        </Button>
      </Dropdown>
    );
  }
}

DropdownAction.defaultProps = {
  menuOptions: [],
  buttonStyle: {},
  dropdownProps: {},
  nameButtonMain: ''
} as Partial<IProps>;
