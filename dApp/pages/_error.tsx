import { ContactsOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import Router from 'next/router';

interface IProps {
  statusCode: number;
  message: string;
}

function Error({ statusCode, message }: IProps) {
  return (
    <Result
      status="error"
      title={statusCode}
      subTitle={message}
      extra={[
        <Button className="secondary" key="console" onClick={() => Router.push('/home')}>
          <HomeOutlined />
          BACK HOME
        </Button>,
        <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
          <ContactsOutlined />
          CONTACT US
        </Button>
      ]}
    />
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return {
    statusCode: res?.statusCode || err?.statusCode || 404,
    message: res?.message || err?.message || `An error ${statusCode} occurred on server`
  };
};

export default Error;
