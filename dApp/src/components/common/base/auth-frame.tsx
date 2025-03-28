import React, { ReactNode, useEffect, useState } from 'react';

interface AuthFrameProps {
  children: ReactNode;
}

const AuthFrame: React.FC<AuthFrameProps> = ({ children }) => {

  return (
    <>
      <div className="log-in-wrapper sm:min-h-screen mb-4 sm:mb-0">
        <div className='auth-content sm:mt-20 mt-0'>
          {children}
        </div>
      </div>
      <div className="authentication-image-container">
        <img className="authentication-image" src="/static/Banner1.jpg" alt="DFINITY logo" />
      </div>
    </>
  );
};

export default AuthFrame;
