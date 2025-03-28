import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};


const ModalWithStyles = ({ isOpen, onClose, children }) => (
  <>
    <Modal isOpen={isOpen} onClose={onClose}>
      {children}
    </Modal>
  </>
);

export default ModalWithStyles;