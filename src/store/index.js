import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import resourceReducer from './slices/resourceSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        resources: resourceReducer,
    },
});

export default store;
