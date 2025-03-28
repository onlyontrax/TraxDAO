import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const SlideUpModal = ({ isOpen, onClose, children, className = '' }) => {
  // Create portal container
  useEffect(() => {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);

    // Cleanup
    return () => {
      document.body.removeChild(modalRoot);
    };
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-trax-black/50 z-[9998]"
            style={{ position: 'fixed' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100vh' }}
            animate={{ y: 0 }}
            exit={{ y: '100vh' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed left-0 right-0 mr-0 bottom-0 z-[9999] bg-white rounded-t-xl p-0 max-h-[90vh] overflow-y-auto ${className}`}
            style={{ position: 'fixed' }}
          >
            {/* Close button */}
            {/* <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button> */}

            {/* Content */}
            <div className="overflow-hidden bg-trax-black">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Get the modal root element
  const modalRoot = document.getElementById('modal-root');
  
  // Only create portal if modalRoot exists
  return modalRoot ? createPortal(modalContent, modalRoot) : null;
};

export default SlideUpModal;