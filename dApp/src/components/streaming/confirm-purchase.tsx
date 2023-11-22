/* eslint-disable no-nested-ternary */
import { Button, Form } from 'antd';
import Image from 'next/image';
import { PureComponent } from 'react';
import { IPerformer, IStream } from 'src/interfaces';
import styles from '../post/index.module.scss';

interface IProps {
  activeStream: IStream;
  performer: IPerformer;
  onFinish: Function;
  submiting: boolean;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

export class PurchaseStreamForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, performer, activeStream, submiting
    } = this.props;
    return (
      <div className={styles.postModule}>
        <div className="text-center">
          <div className="tip-performer">
            <Image
              alt="p-avt"
              src={(performer?.avatar) || '/static/no-avatar.png'}
              style={{ width: '100px', borderRadius: '50%' }}
              layout="fill"
              objectFit="cover"
            />
            <div>
              {performer?.name || 'N/A'}
              <br />
              <small>
                @
                {performer?.username || 'n/a'}
              </small>
            </div>
          </div>
          <Form
            {...layout}
            name="nest-messages"
            onFinish={onFinish.bind(this)}
            initialValues={{ }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button className="primary" htmlType="submit" loading={submiting} disabled={submiting} block>
                Confirm to join this session for $
                {(activeStream.price || 0).toFixed(2)}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}
