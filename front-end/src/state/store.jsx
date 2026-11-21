import { useCallback, useMemo, useReducer } from 'react';
import { buildModel } from '../domain/pcp.js';
import { loadInitialData } from '../data/source.js';
import { initialState, reducer } from './reducer.js';
import { StoreContext } from './context.js';

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => initialState(loadInitialData()));
  const model = useMemo(() => buildModel(state.db, state.referenceDate), [state.db, state.referenceDate]);
  const act = useCallback((type, payload = {}) => dispatch(type === 'reset' ? { type, db: loadInitialData() } : { type, ...payload }), []);
  const value = useMemo(() => ({ state, model, act }), [state, model, act]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
