import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';

const DropdownModal = ({ isOpen, onClose, children, isMobile, isNavigation }) => {
  const modalRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Close modal on route change
    const handleRouteChange = () => {
      if (isOpen) {
        onClose();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, isOpen, onClose]);

  useEffect(() => {
    if (!isNavigation) {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2
            }}
            className="fixed inset-0 bg-trax-black bg-opacity-50 z-[1] backdrop-blur"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: '-100%' }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: '-100%'
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              mass: 0.8,
              exit: {
                duration: 0.2,
                type: "tween",
                ease: "easeOut"
              }
            }}
            className={`fixed left-0 right-0 bg-white shadow-lg overflow-y-auto overflow-x-hidden rounded-b-xl z-50 ${
              isNavigation ? 'bg-[#000]' : 'bg-[#1f1f1f]'
            } ${isMobile ? 'top-0 bottom-0 h-screen' : 'top-0'}`}
          >
            <div className={`${isMobile ? 'pb-36' : ''} pt-8 mt-8`}>
              <motion.div
                className="absolute z-[35] right-4 sm:right-8 top-3 sm:top-4 p-1 hover:bg-[#414141] rounded-lg bg-[#00000000] cursor-pointer transition text-trax-white hover:text-custom-green"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  damping: 5,
                  stiffness: 200,
                  duration: 0.2
                }}
              >
                <XMarkIcon onClick={onClose} className="w-6 h-6" />
              </motion.div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DropdownModal;