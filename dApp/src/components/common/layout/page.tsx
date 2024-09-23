import classnames from 'classnames';
import { PureComponent, ReactNode } from 'react';
import Loader from '../base/loader';
import styles from './page.module.scss';

interface IProps {
  loading?: boolean;
  className?: string;
  inner?: boolean;
  children: ReactNode;
}

export default class Page extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const {
      className, children, loading = false, inner = true
    } = this.props;
    const loadingStyle = {
      height: 'calc(100vh - 184px)',
      overflow: 'hidden'
    };
    return (
      <div className={styles.componentsCommonLayoutPageModule}>
        <div
          className={classnames(className, {
            contentInner: inner
          })}
          style={loading ? loadingStyle : null}
        >
          {loading && <Loader />}
          {children}
        </div>
      </div>
    );
  }
}

Page.defaultProps = {
  loading: false,
  className: '',
  inner: false
} as Partial<IProps>;
