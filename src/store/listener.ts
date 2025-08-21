import {
  createListenerMiddleware,
  type TypedStartListening,
  type TypedAddListener,
  addListener,
} from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from './index';

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;

export type AppAddListener = TypedAddListener<RootState, AppDispatch>;
export const addAppListener = addListener as AppAddListener;
