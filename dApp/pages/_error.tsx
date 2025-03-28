import { ContactsOutlined, HomeOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import Router from 'next/router';

interface IProps {
  statusCode: number;
  message: string;
}

function Error({ statusCode, message }: IProps) {
  return (
    <div className="main-container">
      <Result
        status="error"
        title={statusCode}
        subTitle={message}
        extra={[
          <Button className="secondary" key="console" onClick={() => Router.push('/')}>
            <HomeOutlined />
            BACK HOME
          </Button>,
          <Button key="buy" className="primary" onClick={() => window.open('https://info.trax.so/contact', '_blank')}>
            <ContactsOutlined />
            CONTACT US
          </Button>
        ]}
      />
    </div>
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
