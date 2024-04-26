import React, { ReactNode } from 'react';

interface AuthFrameProps {
  children: ReactNode;
}

const AuthFrame: React.FC<AuthFrameProps> = ({ children }) => {
  return (
    <div className="log-in-container log-in-section">
      <div className="log-in-wrapper">
        <div className="log-in-logo">
          <img src="/static/logo-2.png" alt="Loading..." />
        </div>
        <div className='auth-content'>
          {children}
        </div>
      </div>
      <div className="authentication-image-container">
        <img className="authentication-image" src="/static/authentication.png" alt="DFINITY logo" />
      </div>
    </div>
  );
};

export default AuthFrame;
