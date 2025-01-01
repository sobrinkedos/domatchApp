import React from 'react';
import PlayerForm from './PlayerForm';

function PlayerModal({ isOpen, onClose, player, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          {player ? 'Editar Jogador' : 'Novo Jogador'}
        </h2>
        <PlayerForm
          player={player}
          onSubmit={(formData) => {
            onSubmit(formData);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export default PlayerModal;
