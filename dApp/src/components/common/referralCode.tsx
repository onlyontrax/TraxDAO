import { useState } from 'react';
// import { Sparkl } from '@ant-design/icons';
import { Button } from 'antd';
import {TbCopy} from 'react-icons/tb'
import {HiSparkles} from 'react-icons/hi'
import {GoInfo} from 'react-icons/go'
import { BsCheckCircleFill } from 'react-icons/bs';

function CopyReferralCode({ referralCode }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/auth/register?referralCode=${referralCode}`;

    const textArea = document.createElement('textarea');
    textArea.value = referralLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset copied status after 2 seconds
  };

  return (
    <div className="menu-item-custom">
      <div className='refer-container'>
        <div className='dollar-image'>
          <div className='overlay' />
        </div>
        <div className='refer-wrapper'>
          <div className='refer-top-section'>
            <div className='sparkly-icon-wrapper'>
              <HiSparkles className='sparkly-icon-refer' />
            </div>
            <a href="https://trax.so/page?id=referral-program-terms" className='info-icon-wrapper'>
              <GoInfo className='info-icon-refer' />
            </a>
          </div>

          <div className='refer-middle-section'>
            <div className='main-text-refer-wrapper'>
              <span className='main-text-refer'>Invite artists <br /> to <span className='special-main-text'>TRAX</span></span>
            </div>  
          </div>
    
          <div className='refer-bottom-section'>
            <div className='refer-offer-info'>
              <span>Get 5% of earnings*</span>
            </div>
            <Button className='refer-btn-navbar' onClick={handleCopyClick}>
              {isCopied ? <BsCheckCircleFill className='copied-icon-refer' /> : <TbCopy className='copy-icon-refer'/>} 
              {' '}
              {isCopied ? 'Link Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CopyReferralCode;
