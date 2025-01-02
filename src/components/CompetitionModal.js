import React from 'react';
import CompetitionForm from './CompetitionForm';

function CompetitionModal({ isOpen, onClose, competition, onSubmit }) {
  if (!isOpen) return null;

  const handleSubmit = (formData) => {
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          {competition ? 'Editar Competição' : 'Nova Competição'}
        </h2>
        <CompetitionForm
          competition={competition}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export default CompetitionModal;
