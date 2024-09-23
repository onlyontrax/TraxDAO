/* eslint-disable react/no-unused-prop-types */
import { SendOutlined } from '@ant-design/icons';
import {
  Avatar, Button, Form, Input, message
} from 'antd';
import Router from 'next/router';
import { PureComponent, createRef } from 'react';
import { IUser } from 'src/interfaces';
import { ICreateComment } from 'src/interfaces/comment';
import styles from './comment.module.scss';
import { spawn } from 'child_process';

interface IProps {
  objectId: string;
  objectType?: string;
  onSubmit: Function;
  creator: IUser;
  requesting: boolean;
  isReply?: boolean;
  siteName?: string;
}

const { TextArea } = Input;

export class CommentForm extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  formRef: any;

  state = {
    // text: ''
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  onFinish(values: ICreateComment) {
    const {
      onSubmit: handleComment, objectId, objectType, creator
    } = this.props;
    const data = values;
    if (!creator || !creator._id) {
      message.error('Please login!');
      return Router.push('/login');
    }
    if (!data.content) {
      return message.error('Please add a comment!');
    }
    if (data.content.length > 1000) {
      return message.error('Comment is over 150 characters');
    }
    data.objectId = objectId;
    data.objectType = objectType || 'video';
    this.formRef.resetFields();
    return handleComment(data);
  }

  render() {
    const { creator, requesting, isReply } = this.props;
    if (!this.formRef) this.formRef = createRef();
    return (
      <div className={styles.componentsCommentsCommentModule}>
        <Form
          ref={(ref) => {
            this.formRef = ref;
          }}
          name="comment-form"
          onFinish={this.onFinish.bind(this)}
          initialValues={{
            content: ''
          }}
        >
          <div className="comment-form">
            <div className="cmt-area">
              <Form.Item name="content">
                <div className="add-comment-wrapper pt-3 pr-0">
                  {/* <Avatar
                    alt="per_atv"
                    src={creator?.avatar || '/static/no-avatar.png'}
                    className="comment-avatar"
                    size={25}
                  /> */}
                  <TextArea
                    className="cmt-text-area"
                    disabled={!creator || !creator._id}
                    style={{ width: '100%' }}
                    minLength={2}
                    rows={1}
                    placeholder={!isReply ? 'Add a comment...' : 'Add a reply here'}
                  />
                </div>
              </Form.Item>
            </div>
            <Button
              className={!isReply ? 'submit-btn' : 'reply-btn'}
              style={{ background: '' }}
              htmlType="submit"
              disabled={!creator || !creator._id || requesting}
            >
              {!isReply ? (
                <span className='text-sm text-trax-white font-light'>Post</span>

                ): (
                  <span className='text-sm text-trax-white font-light'>Reply</span>

                  )}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

CommentForm.defaultProps = {
  objectType: '',
  isReply: false,
  siteName: ''
} as Partial<IProps>;
