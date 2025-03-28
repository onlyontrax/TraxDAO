import { useEffect, useState } from 'react';
// import { Sparkl } from '@ant-design/icons';
import { Button } from 'antd';
import {TbCopy} from 'react-icons/tb'
import {HiSparkles} from 'react-icons/hi'
import {GoInfo} from 'react-icons/go'
import { BsCheckCircleFill } from 'react-icons/bs';
import { AnimatePresence, motion } from "framer-motion";
import TraxButton from '@components/common/TraxButton';


const slideVariants = {
  hidden: {
    x: '-100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 120,
      mass: 1,
      duration: 0.4,
      delay: 0.3
    }
  }
};


function CopyReferralCode({ referralCode, isMobile }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(()=>{

  },[])

  const handleCopyClick = () => {
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/register?referralCode=${referralCode}`;

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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={slideVariants} 
      className=' flex mx-auto flex items-center w-full '
    >
      <div className="stats-earning-referral">
        <h2 className="stats-earning-referral-h1">
          Refer to earn 5%
        </h2>
        <h2 className="stats-earning-referral-h2">
          Invite artists to join trax.so and earn commission on their earnings. 5% for the first year, 1% lifetime.
        </h2>
      
        <TraxButton
          htmlType="button"
          styleType="primary"
          buttonSize="full"
          buttonText={isCopied ? 'Link Copied!' : 'Copy link'}
        
          onClick={handleCopyClick}
        />
      </div>
    </motion.div>
    // <div className="menu-item-custom">
    //   <div className='refer-container'>
    //     <div className='dollar-image'>
    //       <div className='overlay' />
    //     </div>
    //     <div className='refer-wrapper'>
    //       <div className='refer-top-section'>
    //         <div className='sparkly-icon-wrapper'>
    //           <HiSparkles className='sparkly-icon-refer' />
    //         </div>
    //         <a href="https://trax.so/page?id=referral-program-terms" className='info-icon-wrapper'>
    //           <GoInfo className='info-icon-refer' />
    //         </a>
    //       </div>

    //       <div className='refer-middle-section'>
    //         <div className='main-text-refer-wrapper'>
    //           <span className='main-text-refer'>Invite artists <br /> to <span className='special-main-text'>TRAX</span></span>
    //         </div>  
    //       </div>
    
    //       <div className='refer-bottom-section'>
    //         <div className='refer-offer-info'>
    //           <span>Get 5% of earnings*</span>
    //         </div>
    //         <Button className='refer-btn-navbar' onClick={handleCopyClick}>
    //           {isCopied ? <BsCheckCircleFill className='copied-icon-refer' /> : <TbCopy className='copy-icon-refer'/>} 
    //           {' '}
    //           {isCopied ? 'Link Copied!' : 'Copy Link'}
    //         </Button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}

export default CopyReferralCode;
