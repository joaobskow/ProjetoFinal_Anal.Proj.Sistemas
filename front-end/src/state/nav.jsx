import { useCallback, useMemo, useState } from 'react';
import { NavContext } from './context.js';

export function NavProvider({ children }) {
  const [route, setRoute] = useState({ page: 'dashboard', id: null, from: null });
  const [line, setLine] = useState('todas');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const go = useCallback((page, id = null) => {
    setRoute((current) => ({ page, id, from: current }));
    document.querySelector('.main')?.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => setRoute((current) => current.from ?? { page: 'dashboard', id: null, from: null }), []);
  const openModal = useCallback((type, payload = {}) => setModal({ type, ...payload }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const notify = useCallback((text) => {
    const id = Date.now();
    setToast({ id, text });
    window.setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3200);
  }, []);
  const matchesLine = useCallback((itemLine) => line === 'todas' || itemLine === line, [line]);

  const value = useMemo(
    () => ({ route, go, back, line, setLine, matchesLine, modal, openModal, closeModal, toast, notify }),
    [route, go, back, line, matchesLine, modal, openModal, closeModal, toast, notify],
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
