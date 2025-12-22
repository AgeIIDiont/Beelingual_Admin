import { createSlice } from '@reduxjs/toolkit';

const USER_KEY = 'beelingual_admin_user';

const getInitialUser = () => {
    const str = localStorage.getItem(USER_KEY);
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
        return null;
    }
};

const initialState = {
    user: getInitialUser(),
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            // Persist to localStorage for consistency with current authService
            localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
        },
        clearUser: (state) => {
            state.user = null;
            localStorage.removeItem(USER_KEY);
        },
        updateProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem(USER_KEY, JSON.stringify(state.user));
            }
        },
    },
});

export const { setUser, clearUser, updateProfile } = userSlice.actions;
export const selectUser = (state) => state.user.user;

export default userSlice.reducer;
