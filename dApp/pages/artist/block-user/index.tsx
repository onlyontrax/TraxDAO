/* eslint-disable react/no-unused-prop-types */
import {
  Button, Form, Input, Layout, Modal, message
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { SelectUserDropdown } from '@components/user/select-users-dropdown';
import { UsersBlockList } from '@components/user/users-block-list';
import { IUIConfig } from 'src/interfaces';
import { blockService } from 'src/services';
import styles from './index.module.scss';

interface IProps {
  ui: IUIConfig;
  className: string;
}

class BlockPage extends PureComponent<IProps> {
  static onlyPerformer = true;

  static authenticate = true;

  state = {
    loading: false,
    submiting: false,
    limit: 10,
    offset: 0,
    blockUserId: '',
    userBlockedList: [],
    totalBlockedUsers: 0,
    openBlockModal: false
  };

  componentDidMount() {
    this.getBlockList();
  }

  async handleTabChange(data) {
    await this.setState({ offset: data.current - 1 });
    this.getBlockList();
  }

  async handleUnblockUser(userId: string) {
    if (!window.confirm('Are you sure to unblock this user?')) return;
    const { userBlockedList } = this.state;
    try {
      await this.setState({ submiting: true });
      await blockService.unBlockUser(userId);
      message.success('Unblocked successfully');
      this.setState({ submiting: false, userBlockedList: userBlockedList.filter((u) => u.targetId !== userId) });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occured. Please try again later');
      this.setState({ submiting: false });
    }
  }

  handleBlockUser = async (data) => {
    const { blockUserId: targetId } = this.state;
    const { reason } = data;
    if (!targetId) {
      message.error('Please select a user');
      return;
    }

    try {
      await this.setState({ submiting: true });
      await blockService.blockUser({ targetId, target: 'user', reason });
      message.success('User profile is blocked successfully');
      this.getBlockList();
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ submiting: false, openBlockModal: false });
    }
  };

  async getBlockList() {
    const { limit, offset } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await blockService.getBlockListUsers({
        limit,
        offset: offset * limit
      });
      this.setState({
        loading: false,
        userBlockedList: resp.data.data,
        totalBlockedUsers: resp.data.total
      });
    } catch (e) {
      message.error('An error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      userBlockedList, totalBlockedUsers, loading, limit, submiting, openBlockModal
    } = this.state;
    const { ui } = this.props;
    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Blacklist`}</title>
        </Head>
        <div className="main-container">
          <div className="block-user" style={{ float: 'right' }}>
            <Button className="ant-primary-btn" type="primary" onClick={() => this.setState({ openBlockModal: true })}>
              Block fan
            </Button>
          </div>

          <div className="users-blocked-list">
            <UsersBlockList
              items={userBlockedList}
              searching={loading}
              total={totalBlockedUsers}
              onPaginationChange={this.handleTabChange.bind(this)}
              pageSize={limit}
              submiting={submiting}
              unblockUser={this.handleUnblockUser.bind(this)}
            />
          </div>
        </div>

        <Modal
          centered
          title="Block user"
          open={openBlockModal}
          onCancel={() => this.setState({ openBlockModal: false })}
          footer={null}
          destroyOnClose
        >
          <Form
            name="blockForm"
            onFinish={this.handleBlockUser.bind(this)}
            initialValues={{ reason: '' }}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="account-form-settings"
          >
            <Form.Item label="Please select user you want to block">
              <SelectUserDropdown onSelect={(val) => this.setState({ blockUserId: val })} />
            </Form.Item>
            <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Tell us your reason' }]}>
              <Input.TextArea placeholder="Enter your reason" />
            </Form.Item>
            <Form.Item>
              <Button
                className="primary submit-content"
                htmlType="submit"
                loading={submiting}
                disabled={submiting}
                style={{ marginRight: '20px' }}
              >
                Submit
              </Button>
              <Button
                className="secondary submit-content-green"
                onClick={() => this.setState({ openBlockModal: false })}
              >
                Close
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(BlockPage);
