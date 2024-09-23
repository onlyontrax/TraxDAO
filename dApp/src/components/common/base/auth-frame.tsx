import React, { ReactNode, useEffect, useState } from 'react';

interface AuthFrameProps {
  children: ReactNode;
}

const AuthFrame: React.FC<AuthFrameProps> = ({ children }) => {

  return (
    <div className=" log-in-container log-in-section">
      <div className="log-in-wrapper">
        <div className='auth-content'>
          {children}
        </div>
      </div>
      <div className="authentication-image-container">
        <img className="authentication-image" src="/static/Banner1.jpg" alt="DFINITY logo" />
      </div>
    </div>
  );
};

export default AuthFrame;
