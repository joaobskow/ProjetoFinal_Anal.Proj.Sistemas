import { createContext, useContext } from 'react';

export const StoreContext = createContext(null);
export const NavContext = createContext(null);

export const useStore = () => useContext(StoreContext);
export const useNav = () => useContext(NavContext);
