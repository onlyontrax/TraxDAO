/* eslint-disable no-nested-ternary */
import { Image } from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import styles from './loader.module.scss';

interface IProps {
  customText?: string;
}

class Loader extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    isMobile: false,
  }

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

  render() {
    const { customText } = this.props;
    const { isMobile } = this.state;
    return (
      <div className={styles.componentsCommonBaseLoaderModule}>
        <div className="loading-screen">
          <div style={{ textAlign: 'center' }}>
            <Image src="/static/trax_loading_optimize.gif" alt="Loading..." />
            {customText && <p>{customText}</p>}
          </div>
        </div>
      </div>
    );
  }
}

Loader.defaultProps = {
  customText: ''
} as Partial<IProps>;

const mapStatesToProps = (state) => ({
  ui: { ...state.ui }
});

export default connect(mapStatesToProps)(Loader);
