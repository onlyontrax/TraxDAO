import { SizeType } from 'antd/lib/config-provider/SizeContext';
import classnames from 'classnames';
import RcTabs, { TabsProps as RcTabsProps } from 'rc-tabs';
import React from 'react';

export interface TabsProps extends RcTabsProps {
  animated?: any;
  size?: SizeType;
}
// @ts-ignore
export const { TabPane } = RcTabs;

function Tabs({
  prefixCls = 'ant-tabs',
  size = 'large',
  animated = {
    inkBar: true,
    tabPane: false
  },
  defaultActiveKey,
  className,
  ...props
}: TabsProps) {
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey);
  const onTabClick = (key) => {
    setActiveKey(key);
  };
  return (
    <RcTabs
      className={classnames(className, { [`${prefixCls}-${size}`]: size })}
      prefixCls={prefixCls}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      renderTabBar={(_, TabNavList: any) => (
        <TabNavList
          animated={animated}
          onTabClick={onTabClick}
          activeKey={activeKey}
        />
      )}
      animated={animated}
      {...props}
    />
  );
}

Tabs.defaultProps = {
  animated: false,
  size: 'middle'
} as Partial<TabsProps>;

export default Object.assign(Tabs, { TabPane });
