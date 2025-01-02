import { useState } from 'react';

export function usePhoneMask(initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const formatPhone = (input) => {
    // Remove tudo que não for dígito
    const cleaned = input.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const numbers = cleaned.slice(0, 11);
    
    // Formata o número
    let formatted = numbers;
    if (numbers.length > 2) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length > 7) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    
    return formatted;
  };

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setValue(formatted);
  };

  return [value, handleChange, setValue];
}
