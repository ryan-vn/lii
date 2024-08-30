// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import counter from './slice/counterSlice';

export const store = configureStore({
  reducer: {
    counter
  },
});
