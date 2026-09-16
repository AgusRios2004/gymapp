import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEscapeKey } from './useEscapeKey';

function pressEscape() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

describe('useEscapeKey', () => {
  it('llama a onEscape cuando está activo y se presiona Escape', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    pressEscape();

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('no llama a onEscape cuando no está activo', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(false, onEscape));

    pressEscape();

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('con un modal anidado, Escape solo cierra el de más arriba (el montado después)', () => {
    const onEscapeParent = vi.fn();
    const onEscapeChild = vi.fn();
    const parent = renderHook(() => useEscapeKey(true, onEscapeParent));
    const child = renderHook(() => useEscapeKey(true, onEscapeChild));

    pressEscape();
    expect(onEscapeChild).toHaveBeenCalledTimes(1);
    expect(onEscapeParent).not.toHaveBeenCalled();

    child.unmount();
    parent.unmount();
  });
});
