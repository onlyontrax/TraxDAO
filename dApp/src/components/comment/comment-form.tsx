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
import TraxButton from '@components/common/TraxButton';
import { Send } from 'lucide-react';


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
    text: ''
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
    const { text } = this.state;
    if (!this.formRef) this.formRef = createRef();
    return (
      <div className={styles.componentsCommentsCommentModule}>
        {/*  bg-[#272727] */}
        <div className='border border-[#353535] bg-transparent rounded-lg p-1'>
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
                <div className="add-comment-wrapper pr-0">
                  <TextArea
                    className="cmt-text-area"
                    disabled={!creator || !creator._id}
                    style={{ width: '100%' }}
                    onChange={(e) => this.setState({text: e.target.value})}
                    minLength={2}
                    rows={1}
                    placeholder={!isReply ? 'Add a comment...' : 'Add a reply here'}
                  />
                </div>
              </Form.Item>
            </div>
            <div className="grp-icons" style={{ paddingRight: 0 }}>
            <div aria-hidden className="grp-send" onClick={() => {
              const values = this.formRef.getFieldsValue();
              this.onFinish(values);
            }}>
              <Send className='w-6 h-6 text-trax-white mx-2 mt-[2px] cursor-pointer hover:text-custom-green'/>
            </div>
          </div>
            {/* <Send className='w-6 h-6 text-trax-white mx-2 mt-[2px] cursor-pointer hover:text-custom-green'/>
            <TraxButton
              htmlType="submit"
              styleType="primary"
              disabled={!text}
              buttonSize='small'
              buttonText={isReply ? "Reply" : "Post"}
              loading={false}
            /> */}
          </div>
        </Form>
      </div>
      </div>
    );
  }
}

CommentForm.defaultProps = {
  objectType: '',
  isReply: false,
  siteName: ''
} as Partial<IProps>;
