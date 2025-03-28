import React, { useState } from 'react';
import { Modal, Button, Divider, message } from 'antd';
import { Share } from 'lucide-react';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { FacebookOutlined, WhatsAppOutlined, LinkOutlined } from '@ant-design/icons';

const ShareButton = ({ url = window.location.href, title = 'Check this out!' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareLinks = {
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      message.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      message.error('Failed to copy link');
    }
  };

  const shareButtons = [
    {
      platform: 'copy',
      icon: <LinkOutlined />,
      label: 'Copy link',
      onClick: handleCopyLink,
      className: 'hover:bg-[#1b1b1b]'
    },
    {
      platform: 'x',
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>,
      label: 'Share on X',
      onClick: () => handleShare('x'),
      className: 'hover:bg-[#1b1b1b] text-trax-blue-400'
    },
    {
      platform: 'facebook',
      icon: <FacebookOutlined />,
      label: 'Share on Facebook',
      onClick: () => handleShare('facebook'),
      className: 'hover:bg-[#1b1b1b] text-trax-blue-600'
    },
    {
      platform: 'messenger',
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.454 5.512 3.726 7.21V22l3.405-1.869c.909.252 1.871.388 2.869.388 5.523 0 10-4.145 10-9.259C22 6.146 17.523 2 12 2zm1.008 12.445l-2.546-2.716-4.97 2.716 5.467-5.803 2.61 2.716 4.906-2.716-5.467 5.803z"/>
      </svg>,
      label: 'Share on Messenger',
      onClick: () => handleShare('messenger'),
      className: 'hover:bg-[#1b1b1b] text-trax-blue-600'
    },
    {
      platform: 'whatsapp',
      icon: <WhatsAppOutlined />,
      label: 'Share on WhatsApp',
      onClick: () => handleShare('whatsapp'),
      className: 'hover:bg-[#1b1b1b] text-trax-green-500'
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-[#a5a5a5] bg-transparent py-[5px] border border-[#ffffff14]  backdrop-blur px-[0.4rem] rounded-full"
      >
        <Share className="w-4 h-4" />
      </button>

      <Modal
        title="Share this page"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="share-modal"
        width={400}
        centered
      >
        <div className="bg-[#0e0e0e] space-y-4 mt-4">
          {shareButtons.map((button, index) => (
            <React.Fragment key={button.platform}>
              <Button
                icon={button.icon}
                onClick={button.onClick}
                className={`w-full h-12 flex items-center rounded-lg justify-start gap-3 text-left ${button.className}`}
                style={{ 
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span className="flex-grow">{button.label}</span>
                {button.platform === 'copy' && copied && (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                )}
              </Button>
              {index === 0 && (
                <Divider>
                  <span className="text-gray-500 text-sm">Share via</span>
                </Divider>
              )}
            </React.Fragment>
          ))}
        </div>
      </Modal>

      <style jsx global>{`
        .share-modal .ant-modal-content {
          background-color: #1a1a1a;
          color: #ffffff;
          padding: 20px 24px;

        }
        
        .share-modal .ant-modal-header {
          background-color: #1a1a1a;
          border-bottom: none;
        }
        
        .share-modal .ant-modal-title {
          color: #ffffff;
          font-family: HeadingPro;
          font-size: 2rem; 
          text-transform: uppercase;
        }
        
        .share-modal .ant-modal-close {
          color: #ffffff;
        }
        
        .share-modal .ant-btn {
          border: 1px solid #333;
          background: transparent;
          color: #ffffff;
          transition: all 0.2s;
        }
        
        .share-modal .ant-btn:hover {
          transform: scale(1.02);
          border-color: #444 !important;
        }
        
        .share-modal .ant-divider {
          border-color: #333;
        }
        
        .share-modal .ant-divider-inner-text {
          color: #666;
        }
      `}</style>
    </>
  );
};

export default ShareButton;