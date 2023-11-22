import { PureComponent } from 'react';
import {
  Row, Button,
  Col, Modal
} from 'antd';
import { } from '@ant-design/icons';
import styles from './index.module.scss';

interface IProps {
  onAddPollDuration: Function;
  openDurationPollModal: boolean;
}

export default class AddPollDurationForm extends PureComponent<IProps> {
  state = {
    limitTime: 7
  };

  async onChangePoll(value) {
    this.setState({ limitTime: value });
  }

  render() {
    const { onAddPollDuration, openDurationPollModal = false } = this.props;
    const { limitTime } = this.state;

    return (
      <div className={styles.componentsPostAddPollDurationsModule}>
        <Modal
          title={`Poll duration: ${!limitTime ? 'No limit' : `${limitTime} days`}`}
          open={openDurationPollModal}
          onCancel={() => onAddPollDuration(7)}
          onOk={() => onAddPollDuration(limitTime)}
        >
          <Row style={{flexDirection: 'row'}}>
            <Col span={4.5}>
              <Button className='poll-btn' onClick={this.onChangePoll.bind(this, 1)}>1 day</Button>
            </Col>
            <Col span={4.5}>
              <Button className='poll-btn' onClick={this.onChangePoll.bind(this, 3)}>3 days</Button>
            </Col>
            <Col span={4.5}>
              <Button className='poll-btn' onClick={this.onChangePoll.bind(this, 7)}>7 days</Button>
            </Col>
            <Col span={4.5}>
              <Button className='poll-btn' onClick={this.onChangePoll.bind(this, 30)}>30 days</Button>
            </Col>
            <Col span={6}>
              <Button className='poll-btn' onClick={this.onChangePoll.bind(this, 0)}>No limit</Button>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}
