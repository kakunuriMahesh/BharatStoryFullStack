import { configureStore } from '@reduxjs/toolkit';
import storiesReducer from './slices/storiesSlice';

export const store = configureStore({
  reducer: {
    stories: storiesReducer,
  },
});

export default store;
