import { IVideo } from '@interfaces/index';
import { Button } from 'antd';
import Image from 'next/image';
import { PureComponent } from 'react';

interface IProps {
  video: IVideo;
  onFinish: Function;
  submiting: boolean;
}

export class PurchaseVideoForm extends PureComponent<IProps> {
  render() {
    const { onFinish, submiting = false, video } = this.props;
    return (
      <div className="text-center">
        <div className="tip-performer">
          <Image alt="p-avt" src={video?.performer?.avatar || '/no-avatar.png'} style={{ width: '100px', borderRadius: '50%' }} />
          <div>
            {video?.performer?.name}
            <small>
              @
              {video?.performer?.username}
            </small>
          </div>
        </div>
        <div style={{ margin: '20px 0' }} />
        <Button type="primary" loading={submiting} disabled={submiting} onClick={onFinish.bind(this)}>
          Unlock video for
          {' '}
          $
          {video.price.toFixed(2)}
        </Button>
      </div>
    );
  }
}
