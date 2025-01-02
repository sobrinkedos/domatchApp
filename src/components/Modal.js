import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          {/* Cabeçalho */}
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          </div>

          {/* Conteúdo */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
