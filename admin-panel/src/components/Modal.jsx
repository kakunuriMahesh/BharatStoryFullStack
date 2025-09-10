import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
      <div className="bg-slate-900 border border-1 p-6 rounded shadow-lg max-w-lg w-full relative h-[400px] overflow-y-scroll">
        <button
          className="absolute top-2 right-2 text-white font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
