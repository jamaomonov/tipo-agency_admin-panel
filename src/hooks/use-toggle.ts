import { useState, useCallback } from 'react';

/**
 * Простой хук для переключения булева состояния.
 * @param initialState - Начальное состояние (по умолчанию false).
 * @returns Кортеж, содержащий текущее состояние и функцию для его переключения.
 */
export function useToggle(initialState = false): [boolean, () => void] {
  const [state, setState] = useState(initialState);
  const toggle = useCallback(() => setState(s => !s), []);
  return [state, toggle];
}