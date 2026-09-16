import { useEffect } from 'react';

// Pila a nivel de módulo: con modales anidados (p. ej. CreateExerciseModal dentro de
// EditRoutineModal), un solo Escape solo debe cerrar el que está más arriba, no los dos.
const stack: symbol[] = [];

export function useEscapeKey(isActive: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isActive) return;

    const id = Symbol();
    stack.push(id);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && stack[stack.length - 1] === id) {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stack.splice(stack.indexOf(id), 1);
    };
  }, [isActive, onEscape]);
}
