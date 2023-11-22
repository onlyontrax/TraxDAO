/* eslint-disable react/no-did-update-set-state */
import { PureComponent, createRef } from 'react';

import { settingService } from '@services/setting.service';
import {
  Button, Col, Form, Input, Layout, Row, message
} from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
// import { GoogleReCaptcha } from '@components/common';
import { IUIConfig } from 'src/interfaces';
import styles from '../auth/index.module.scss';

const { TextArea } = Input;

interface IProps {
  ui: IUIConfig;
}

class ContactPage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  _intervalCountdown: any;

  formRef: any;

  state = {
    recaptchaSuccess: false,
    submiting: false,
    countTime: 60
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  };

  async onFinish(values) {
    try {
      await this.setState({ submiting: true });
      await settingService.contact(values);
      message.success('Thank you for contact us, we will reply within 48hrs.');
      this.handleCountdown();
    } catch (e) {
      message.error('Error occured, please try again later');
    } finally {
      this.formRef.current.resetFields();
      this.setState({ submiting: false });
    }
  }

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { ui } = this.props;
    const { submiting, countTime } = this.state;
    return (
      <Layout className={styles.pagesContactModule}>
        <Head>
          <title>{`${ui?.siteName} | Contact Us`}</title>
        </Head>
        <div className="main-container">
          <div className="contact-form-wrapper">
            <Row>
              <Col xs={24} sm={24} md={24} lg={24}>
                <p className="contact-form-h1">
                  <span className="">Contact Us</span>
                </p>
                <h5 className="contact-form-h5">We want to hear from you!</h5>
                <Form
                  layout="vertical"
                  name="contact-from"
                  ref={this.formRef}
                  onFinish={this.onFinish.bind(this)}
                  scrollToFirstError
                  className="contact-form-form"
                >
                  <div style={{ display: 'flex' }}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Item name="firstname" rules={[{ required: true, message: 'Tell us your full name' }]}>
                        <p>First name</p>
                        <Input placeholder="Kanye" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Item name="lastname" rules={[{ required: true, message: 'Tell us your full name' }]}>
                        <p>Last name</p>
                        <Input placeholder="East" />
                      </Form.Item>
                    </Col>
                  </div>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: 'Tell us your email address.'
                      },
                      { type: 'email', message: 'Invalid email format' }
                    ]}
                  >
                    <p>Email address</p>
                    <Input placeholder="you@company.com" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: 'What can we help you?' },
                      {
                        min: 20,
                        message: 'Please input at least 20 characters.'
                      }
                    ]}
                  >
                    <p>Message</p>
                    <TextArea rows={3} placeholder="" />
                  </Form.Item>
                  <div className="contact-form-btn-wrapper">
                    <Button
                      size="large"
                      className="ant-btn-primary"
                      type="primary"
                      htmlType="submit"
                      loading={submiting || countTime < 60}
                      disabled={submiting || countTime < 60}
                      style={{ fontWeight: 600, width: '100%' }}
                    >
                      {countTime < 60 ? 'Resend message in' : 'Send message'}
                      {' '}
                      {countTime < 60 && `${countTime}s`}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(ContactPage);
